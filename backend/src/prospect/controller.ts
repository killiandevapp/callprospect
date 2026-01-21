// src/prospect/controller.ts
import type { Request, Response } from "express";
import { findProspectsByUser } from "./repo";
import { findProspectsByUserHistory } from "./repo.js";

// GET /api/prospects
export async function listProspects(req: Request, res: Response) {
  const userId = Number(req.user.sub); // vient de requireAuth

  const prospects = await findProspectsByUser(userId);

  // Le front attend { prospects: [...] }
  return res.json({ prospects });
}


export async function listProspectsHistory(req: Request, res: Response) {
  const userId = Number(req.user.sub); // vient de requireAuth

  const prospects = await findProspectsByUserHistory(userId);

  // Le front attend { prospects: [...] }
  return res.json({ prospects });
}
