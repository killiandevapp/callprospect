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
