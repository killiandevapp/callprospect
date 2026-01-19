import { pool } from "../db";

export type CallResult = "meeting" | "refused" | "no_answer" | "callback";

type InsertCallLogParams = {
  userId: number;
  prospectId: number;
  result: CallResult;
  durationSec: number | null;
  refusalReasonId?: number | null;
  
  // NOUVEAU pour RDV
  meetingAt?: Date | null;
  meetingLocation?: string | null;
  meetingNotes?: string | null;
};

// src/call/repo.ts

export async function insertCallLog(params: InsertCallLogParams): Promise<void> {
  const {
    userId,
    prospectId,
    result,
    durationSec,
    refusalReasonId,
    meetingAt,
    meetingLocation,
    meetingNotes,
  } = params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

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

    const [resultInsert] = await conn.query<any>(
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

    const callLogId = resultInsert.insertId as number;

    if (result === "meeting" && meetingAt) {
      await conn.query(
        `
        INSERT INTO meetings (call_log_id, meeting_at, status, location, notes)
        VALUES (?, ?, 'planned', ?, ?)
        `,
        [callLogId, meetingAt, meetingLocation ?? null, meetingNotes ?? null]
      );
    }

    // on décide du status en fonction du résultat
    const newStatus =
      result === "meeting" || result === "refused" ||  result === "callback"  ? "closed" : "open";

    await conn.query(
      `
      UPDATE prospects
      SET 
        last_call_result = ?,
        last_call_at = ?,
        last_call_duration_sec = ?,
        status = ?
      WHERE id = ?
      `,
      [result, now, durationSec, newStatus, prospectId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
