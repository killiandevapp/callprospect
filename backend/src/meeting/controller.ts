import type { Request, Response } from "express";
import { findMeetingsByUser } from "./repo";

export async function getMeetings(req: Request, res: Response) {
  const userId = Number(req.user.sub);
  if (!userId) return res.status(400).json({ error: "User ID invalide" });

  try {
    const meetings = await findMeetingsByUser(userId);
    res.json({ meetings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
}
