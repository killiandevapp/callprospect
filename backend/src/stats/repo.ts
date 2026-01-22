// src/stats/repo.ts
import { pool } from "../db";

export type DayStat = {
  day: string;      // "2026-01-19"
  count: number;
};

export type SlotStat = {
  label: string;    // "Matin" / "Après-midi"
  percent: number;
};

export type RefusalStat = {
  label: string;    // motif
  percent: number;
};

export type StatsOverview = {
  totalCalls: number;
  refusedPct: number;
  discussionPct: number;
  callsPerHour: number;
  callsPerDay: DayStat[];
  timeSlots: SlotStat[];
  refusalReasons: RefusalStat[];
};

export async function getStatsOverviewRepo(params: {
  userId: number;
  from?: Date | null;
  to?: Date | null;
}): Promise<StatsOverview> {
  const { userId, from, to } = params;

  const filters: string[] = ["ca.user_id = ?"];
  const sqlParams: any[] = [userId];

  if (from && to) {
    filters.push("c.created_at BETWEEN ? AND ?");
    sqlParams.push(from, to);
  }

  const whereSql = filters.length ? "WHERE " + filters.join(" AND ") : "";

  // 1) total par résultat
  const [rowsTotal] = await pool.query<any[]>(
    `
    SELECT c.result, COUNT(*) AS count
    FROM call_logs c
    JOIN campaigns ca ON ca.id = c.campaign_id
    ${whereSql}
    GROUP BY c.result
    `,
    sqlParams
  );

  const totalCalls = rowsTotal.reduce((acc, r) => acc + Number(r.count || 0), 0);

  const refusedCount =
    rowsTotal.find((r) => r.result === "refused")?.count || 0;

  // on considère "discussion" = tous les appels sauf "no_answer"
  const discussionCount = rowsTotal
    .filter((r) => r.result !== "no_answer")
    .reduce((acc, r) => acc + Number(r.count || 0), 0);

  const refusedPct =
    totalCalls > 0 ? Math.round((refusedCount / totalCalls) * 100) : 0;

  const discussionPct =
    totalCalls > 0 ? Math.round((discussionCount / totalCalls) * 100) : 0;

  // 2) appels / jour (pour la courbe)
  const [rowsPerDay] = await pool.query<any[]>(
    `
    SELECT DATE(c.created_at) AS day, COUNT(*) AS count
    FROM call_logs c
    JOIN campaigns ca ON ca.id = c.campaign_id
    ${whereSql}
    GROUP BY DATE(c.created_at)
    ORDER BY day ASC
    `,
    sqlParams
  );

  const callsPerDay: DayStat[] = rowsPerDay.map((r) => ({
    day: r.day,
    count: Number(r.count || 0),
  }));

  // 3) créneaux horaires (Matin / Après-midi)
  const [rowsSlots] = await pool.query<any[]>(
    `
    SELECT
      CASE
        WHEN HOUR(c.created_at) < 12 THEN 'Matin'
        ELSE 'Après-midi'
      END AS slot,
      COUNT(*) AS count
    FROM call_logs c
    JOIN campaigns ca ON ca.id = c.campaign_id
    ${whereSql}
    GROUP BY slot
    `,
    sqlParams
  );

  const totalSlot = rowsSlots.reduce((acc, r) => acc + Number(r.count || 0), 0) || 1;

  const timeSlots: SlotStat[] = rowsSlots.map((r) => ({
    label: r.slot as string,
    percent: Math.round((Number(r.count || 0) / totalSlot) * 100),
  }));

  // 4) stats par motif de refus
  const [rowsRefusal] = await pool.query<any[]>(
    `
    SELECT rr.label, COUNT(*) AS count
    FROM call_logs c
    JOIN campaigns ca ON ca.id = c.campaign_id
    JOIN refusal_reasons rr ON rr.id = c.refusal_reason_id
    ${whereSql}
      AND c.result = 'refused'
    GROUP BY rr.label
    ORDER BY count DESC
    `,
    sqlParams
  );

  const totalRefus = rowsRefusal.reduce(
    (acc, r) => acc + Number(r.count || 0),
    0
  ) || 1;

  const refusalReasons: RefusalStat[] = rowsRefusal.map((r) => ({
    label: r.label as string,
    percent: Math.round((Number(r.count || 0) / totalRefus) * 100),
  }));

  // 5) appels / heure (approx très simple pour l’instant)
  let callsPerHour = 0;
  if (from && to && totalCalls > 0) {
    const msDiff = to.getTime() - from.getTime();
    const hours = msDiff > 0 ? msDiff / (1000 * 60 * 60) : 1;
    callsPerHour = Math.round(totalCalls / hours);
  }



  return {
    totalCalls,
    refusedPct,
    discussionPct,
    callsPerHour,
    callsPerDay,
    timeSlots,
    refusalReasons,
  };
}






export type CallsStatsByDate = {
  date: string; // YYYY-MM-DD
  total_calls: number;
  discussions: number;
  refusals: number;
};

export async function getRepoCallsStatsByDate(
  userId: number,
  from: string,
  to: string
): Promise<CallsStatsByDate[]> {

  const [rows] = await pool.query<CallsStatsByDate[]>(
    `

    SELECT
      DATE(started_at) AS date,
      COUNT(*) AS total_calls,
      SUM(result IN ('meeting', 'callback')) AS discussions,
      SUM(result = 'refused') AS refusals
    FROM call_logs
    WHERE user_id = ?
      AND started_at BETWEEN ? AND ?
    GROUP BY DATE(started_at)
    ORDER BY date ASC
    `,
    [userId, from, to]
  );

  return rows;
}