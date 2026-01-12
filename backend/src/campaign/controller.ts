// src/campaign/controller.ts
import type { Request, Response } from "express";
import {
  findCampaignsByUser,
  createCampaignRepo,
  saveCampaignSetup,
  insertManualProspects,
} from "./repo";

// -------- GET /api/campaign --------
export async function verifyCampaign(req: Request, res: Response) {
  const userId = Number(req.user.sub);

  const campaigns = await findCampaignsByUser(userId);

  return res.json({ campaigns });
}

// -------- POST /api/campaign --------
export async function createCampaign(req: Request, res: Response) {
  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const { name, source } = body as { name?: unknown; source?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (source !== undefined && typeof source !== "string") {
    return res.status(400).json({ message: "Invalid source" });
  }

  const userId = Number(req.user.sub);
  const id = await createCampaignRepo({
    userId,
    name: name.trim(),
    source: typeof source === "string" ? source.trim() : undefined,
  });

  return res.status(201).json({ id });
}

// -------- POST /api/campaign/setup --------

type SetupBody = {
  campaignId: number;
  source?: string;
  refusalReasons: string[];
};

function validateSetupBody(body: any): body is SetupBody {
  if (!body || typeof body !== "object") return false;

  // campaignId: nombre entier > 0
  if (
    typeof body.campaignId !== "number" ||
    !Number.isInteger(body.campaignId) ||
    body.campaignId <= 0
  ) {
    return false;
  }

  // source optionnelle : string si présente
  if (body.source !== undefined && typeof body.source !== "string") {
    return false;
  }

  // refusalReasons : array non vide de string non vides
  if (!Array.isArray(body.refusalReasons) || body.refusalReasons.length === 0) {
    return false;
  }

  for (const item of body.refusalReasons) {
    if (typeof item !== "string") return false;
    const trimmed = item.trim();
    if (!trimmed || trimmed.length > 190) return false;
  }

  return true;
}

// POST /api/campaign/setup


export async function setupCampaign(req: Request, res: Response) {
  try {
    const userId = Number(req.user.sub);
    const { source, refusalReasons, manualProspects } = req.body;

    // 1) vérifier le payload minimum
    if (!Array.isArray(refusalReasons) || refusalReasons.length === 0) {
      return res.status(400).json({ message: "refusalReasons required" });
    }

    // 2) récupérer la dernière campagne de l'utilisateur
    const campaigns = await findCampaignsByUser(userId);
    if (campaigns.length === 0) {
      return res.status(400).json({ message: "No campaign for user" });
    }
    const latest = campaigns[0];

    // 3) mettre à jour la campagne (source + motifs de refus)
    const cleanedRefusals = refusalReasons
      .map((r: string) => r.trim())
      .filter((r: string) => r.length > 0);

    await saveCampaignSetup({
      userId,
      campaignId: latest.id,
      source: typeof source === "string" ? source.trim() : undefined,
      refusalReasons: cleanedRefusals,
    });

    // 4) insérer les prospects manuels (si il y en a)
    if (Array.isArray(manualProspects) && manualProspects.length > 0) {
      const cleaned = manualProspects
        .map((p: any) => ({
          name: String(p.name || "").trim(),
          phone: String(p.phone || "").trim(),
          notes: p.notes ? String(p.notes) : "",
        }))
        .filter((p) => p.name && p.phone);

      if (cleaned.length > 0) {
        await insertManualProspects({
          campaignId: latest.id,
          prospects: cleaned,
        });
      }
    }

    return res.json({ ok: true, campaignId: latest.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}
