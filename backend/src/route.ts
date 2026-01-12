import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, refresh, logout } from "./auth/controller";
import { requireAuth, requireCsrf } from "./auth/middleware";
import { verifyCampaign, createCampaign, setupCampaign } from "./campaign/controller";
import { listProspects } from "./prospect/controller";

const router = express.Router();

// Limite 10 login/minute (anti-brute force)
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,              // 10 tentatives max
});

router.post("/auth/register", register);        // Inscription
router.post("/auth/login", loginLimiter, login); // Connexion (protégée)
router.post("/auth/refresh", refresh);          // Rafraîchir token
router.post("/auth/logout", logout);            // Déconnexion

// CAMPAIGN
router.get("/campaign", requireAuth, verifyCampaign);
router.post("/campaign", requireAuth, requireCsrf, createCampaign);
router.post(
  "/campaign/setup",
  requireAuth,
  requireCsrf,
  setupCampaign
);

// PROSPECTS
router.get("/prospects", requireAuth, listProspects);

// Routes PROTÉGÉES (nécessitent auth)
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
router.post("/secure-action", requireAuth, requireCsrf, (_req, res) => res.json({ ok: true }));

export default router;