// src/campaign/controller.ts
import type { Request, Response } from "express";
import { z } from "zod";
import { findCampaignsByUser, createCampaignRepo } from "./repo";

const createSchema = z.object({
  name: z.string().min(1),
  source: z.string().optional(),
});

// GET /api/campaign
export async function verifyCampaign(req: Request, res: Response) {
  const userId = Number(req.user.sub);

  const campaigns = await findCampaignsByUser(userId);

  return res.json({ campaigns });
}

// POST /api/campaign
export async function createCampaign(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const userId = Number(req.user.sub);
  const { name, source } = parsed.data;

  const id = await createCampaignRepo({ userId, name, source });

  return res.status(201).json({ id });
}
