// src/stats/controller.ts
import type { Request, Response } from "express";
import { getStatsOverviewRepo , callsStatsByDay } from "./repo";



export async function getStatsOverview(req: Request, res: Response) {
  try {
    const userId = Number(req.user.sub);

    const fromParam = req.query.from as string | undefined;
    const toParam = req.query.to as string | undefined;

    let from: Date | null = null;
    let to: Date | null = null;

    if (fromParam && toParam) {
      const d1 = new Date(fromParam);
      const d2 = new Date(toParam);

      if (!Number.isNaN(d1.getTime()) && !Number.isNaN(d2.getTime())) {
        from = d1;
        to = d2;
      }
    }

    // par défaut : dernière semaine si rien passé
    if (!from || !to) {
      const now = new Date();
      to = now;
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const stats = await getStatsOverviewRepo({
      userId,
      from,
      to,
    });

    return res.json(stats);
  } catch (err) {
    console.error("getStatsOverview error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}




export async function getCallsStatsByDay(req: Request, res: Response) {
  const data = await callsStatsByDay();
  res.json(data);
}