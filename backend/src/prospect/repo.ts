// src/prospect/repo.ts
import { pool } from "../db";

export type ProspectRow = {
  id: number;
  campaign_id: number;
  company: string | null;
  name: string | null;
  phone: string;
  email: string | null;
  notes: string | null;
  last_call_result: string | null;
  last_call_at: Date | null;
  last_call_duration_sec: number | null;
};

// On récupère les prospects liés aux campagnes de l'utilisateur
export async function findProspectsByUser(userId: number): Promise<ProspectRow[]> {
  const [rows] = await pool.query<any[]>(
    `
    SELECT p.*
    FROM prospects p
    JOIN campaigns c ON p.campaign_id = c.id
    WHERE c.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 200
    `,
    [userId]
  );

  return rows as ProspectRow[];
}
