import { pool } from "../db";

export type MeetingRow = {
  id: number;
  meeting_at: Date;
  status: string;
  location: string | null;
  notes: string | null;
  created_at: Date;

  prospect_name: string | null;
  prospect_phone: string | null;
  campaign_name: string | null;
};

export async function findMeetingsByUser(userId: number): Promise<MeetingRow[]> {
  const [rows] = await pool.query<any[]>(
    `
    SELECT 
      m.id,
      m.meeting_at,
      m.status,
      m.location,
      m.notes,
      m.created_at,
      p.name AS prospect_name,
      p.phone AS prospect_phone,
      c.name AS campaign_name
    FROM meetings m
    JOIN call_logs cl ON cl.id = m.call_log_id
    JOIN prospects p ON p.id = cl.prospect_id
    JOIN campaigns c ON c.id = cl.campaign_id
    WHERE cl.user_id = ?
    ORDER BY m.meeting_at ASC
    `,
    [userId]
  );

  return rows as MeetingRow[];
}
