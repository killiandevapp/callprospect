// src/call/controller.ts
import type { Request, Response } from "express";
import { insertCallLog, type CallResult } from "./repo";

const ALLOWED_RESULTS: CallResult[] = [
  "meeting",
  "refused",
  "no_answer",
  "callback",
];

export async function logCall(req: Request, res: Response) {
  const userId = Number(req.user.sub); // vient de requireAuth

  const { prospectId, result, durationSec, refusalReasonId } = req.body || {};

  // validations simples
  if (typeof prospectId !== "number" || prospectId <= 0) {
    return res.status(400).json({ message: "prospectId invalide" });
  }

  if (!ALLOWED_RESULTS.includes(result)) {
    return res.status(400).json({ message: "result invalide" });
  }

  let duration: number | null = null;
  if (typeof durationSec === "number" && durationSec >= 0) {
    duration = durationSec;
  }

  let refusalId: number | null = null;
  if (refusalReasonId !== undefined && refusalReasonId !== null) {
    const n = Number(refusalReasonId);
    if (!Number.isNaN(n) && n > 0) {
      refusalId = n;
    }
  }

  try {
    await insertCallLog({
      userId,
      prospectId,
      result,
      durationSec: duration,
      refusalReasonId: refusalId,
    });

    return res.status(201).json({ ok: true });
  } catch (err: any) {
    console.error("logCall error:", err);

    if (err instanceof Error && err.message === "PROSPECT_NOT_FOUND") {
      return res.status(404).json({ message: "Prospect introuvable" });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }
}
