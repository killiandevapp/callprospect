// src/call/repo.ts
import { pool } from "../db";

export type CallResult = "meeting" | "refused" | "no_answer" | "callback";

type InsertCallLogParams = {
  userId: number;
  prospectId: number;
  result: CallResult;
  durationSec: number | null;
  refusalReasonId?: number | null;
};

export async function insertCallLog(params: InsertCallLogParams): Promise<void> {
  const { userId, prospectId, result, durationSec, refusalReasonId } = params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Vérifier que le prospect appartient bien à une campagne de cet utilisateur
    const [rows] = await conn.query<any[]>(
      `
      SELECT p.id, p.campaign_id
      FROM prospects p
      JOIN campaigns c ON c.id = p.campaign_id
      WHERE p.id = ? AND c.user_id = ?
      LIMIT 1
      `,
      [prospectId, userId]
    );

    if (rows.length === 0) {
      throw new Error("PROSPECT_NOT_FOUND");
    }

    const campaignId = rows[0].campaign_id as number;
    const now = new Date();
    const startedAt =
      durationSec !== null
        ? new Date(now.getTime() - durationSec * 1000)
        : now;

    // 2) Insert dans call_logs
    await conn.query(
      `
      INSERT INTO call_logs
      (campaign_id, prospect_id, user_id, started_at, ended_at, duration_sec, result, refusal_reason_id, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)
      `,
      [
        campaignId,
        prospectId,
        userId,
        startedAt,
        now,
        durationSec,
        result,
        refusalReasonId ?? null,
      ]
    );

    // 3) Update du prospect (dernière info d'appel)
    await conn.query(
      `
      UPDATE prospects
      SET last_call_result = ?, last_call_at = ?, last_call_duration_sec = ?
      WHERE id = ?
      `,
      [result, now, durationSec, prospectId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
