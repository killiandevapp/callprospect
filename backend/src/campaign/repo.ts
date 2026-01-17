// src/campaign/repo.ts
import { pool } from "../db";

export type CampaignRow = {
  id: number;
  user_id: number;
  name: string;
  source: string | null;
  is_archived: number;
  last_used_at: Date | null;
  created_at: Date;
};

export async function findCampaignsByUser(userId: number): Promise<CampaignRow[]> {
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM campaigns WHERE user_id = ? AND is_archived = 0 ORDER BY created_at DESC",
    [userId]
  );
  return rows as CampaignRow[];
}

export async function createCampaignRepo(params: {
  userId: number;
  name: string;
  source?: string | null;
}): Promise<number> {
  const [r] = await pool.query<any>(
    "INSERT INTO campaigns(user_id, name, source) VALUES(?,?,?)",
    [params.userId, params.name, params.source || null]
  );
  return r.insertId as number;
}

export async function saveCampaignSetup(params: {
  userId: number;
  campaignId: number;
  source?: string;
  refusalReasons: string[];
}): Promise<void> {
  const { userId, campaignId, source, refusalReasons } = params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<any[]>(
      "SELECT id FROM campaigns WHERE id = ? AND user_id = ? LIMIT 1",
      [campaignId, userId]
    );
    if (rows.length === 0) {
      throw new Error("CAMPAIGN_NOT_FOUND");
    }

    await conn.query("UPDATE campaigns SET source = ? WHERE id = ?", [
      source || null,
      campaignId,
    ]);

    await conn.query("DELETE FROM refusal_reasons WHERE campaign_id = ?", [
      campaignId,
    ]);

    if (refusalReasons.length > 0) {
      const values = refusalReasons.map((label) => [campaignId, label]);
      await conn.query(
        "INSERT INTO refusal_reasons (campaign_id, label) VALUES ?",
        [values]
      );
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function insertManualProspects(params: {
  campaignId: number;
  prospects: { name: string; phone: string; notes?: string }[];
}): Promise<void> {
  const { campaignId, prospects } = params;

  if (prospects.length === 0) return;

  const values = prospects.map((p) => [
    campaignId,
    p.name,
    p.phone,
    p.notes || null,
  ]);

  await pool.query(
    "INSERT INTO prospects (campaign_id, name, phone, notes) VALUES ?",
    [values]
  );
}


export type RefusalReasonRow = {
  id: number;
  campaign_id: number;
  label: string;
  created_at: Date;
};

// Dernière campagne active de l'utilisateur (pratique si on n'envoie pas l'id)
export async function findLastCampaignForUser(
  userId: number
): Promise<CampaignRow | null> {
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM campaigns WHERE user_id = ? AND is_archived = 0 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );
  if (rows.length === 0) return null;
  return rows[0] as CampaignRow;
}

// Motifs de refus pour une campagne
export async function getRefusalReasonsByCampaign(
  campaignId: number
): Promise<RefusalReasonRow[]> {
  const [rows] = await pool.query<any[]>(
    "SELECT * FROM refusal_reasons WHERE campaign_id = ? ORDER BY created_at ASC",
    [campaignId]
  );
  return rows as RefusalReasonRow[];
}