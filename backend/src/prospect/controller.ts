// src/prospect/controller.ts
import type { Request, Response } from "express";
import { findProspectsByUser } from "./repo";

// GET /api/prospects
export async function listProspects(req: Request, res: Response) {
  const userId = Number(req.user.sub); // vient de requireAuth

  const prospects = await findProspectsByUser(userId);

  // Le front attend { prospects: [...] }
  return res.json({ prospects });
}
