// src/api/stats.ts
import { api } from "./axios";

export type DayStat = {
  day: string;
  count: number;
};

export type SlotStat = {
  label: string;
  percent: number;
};

export type RefusalStat = {
  label: string;
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

export async function fetchStatsOverview() {
  const res = await api.get<StatsOverview>("/stats/overview");
  return res.data;
}
