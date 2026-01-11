import express from "express";
import rateLimit from "express-rate-limit";
import { register, login, refresh, logout } from "./auth/controller";
import { requireAuth, requireCsrf } from "./auth/middleware";
import { verifyCampaign, createCampaign } from "./campaign/controller";


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

// campagne
router.get("/campaign", requireAuth, verifyCampaign);
router.post("/campaign", requireAuth, requireCsrf, createCampaign);

// Routes PROTÉGÉES (nécessitent auth)
router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));
router.post("/secure-action", requireAuth, requireCsrf, (_req, res) => res.json({ ok: true }));

export default router;