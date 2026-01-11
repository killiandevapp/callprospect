import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { sha256Hex, cookieOptions, genCsrfToken, sleep, uaHash } from "../security";
import { signAccess, signRefresh, verifyRefresh } from "./tokens";
import {
  findUserByEmail,
  createUser,
  incFailed,
  resetFailed,
  lockUser,
  logAttempt,
  insertRefresh,
  findRefreshByHash,
  revokeRefresh,
} from "./repo";

const REFRESH_COOKIE = "refresh_token";
const CSRF_COOKIE = "csrf_token";

// Validation des données (email + mdp ≥6)
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Délai aléatoire anti-timing attacks
function jitterMs() {
  return 220 + Math.floor(Math.random() * 200);
}

// INSCRIPTION
export async function register(req: Request, res: Response) {
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ message: "Invalid payload" });

  const { email, password } = p.data;
  const existing = await findUserByEmail(email);
  if (existing) return res.status(409).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 12);  // Hash mdp
  const id = await createUser(email, hash);      // Crée user
  return res.status(201).json({ userId: id });
}

// CONNEXION (sécurisée anti-brute force)
export async function login(req: Request, res: Response) {
  const p = schema.safeParse(req.body);
  if (!p.success) return res.status(400).json({ message: "Invalid payload" });

  const { email, password } = p.data;
  const ua = req.headers["user-agent"];
  const ip = req.ip;

  const user = await findUserByEmail(email);

  // Anti-énumération : même temps de calcul même si user n'existe pas
  const fakeHash = "$2b$12$C9Sg0qgR8c6u2Cw8Kq8S3e7p0c5y7QvR1f3l9G5y0v5i9m0uXbQ3y";
  const hashToCheck = user ? user.password_hash : fakeHash;

  // Vérifie si verrouillé
  if (user?.lock_until && new Date(user.lock_until).getTime() > Date.now()) {
    await sleep(jitterMs());
    await logAttempt({ email, ip, success: false });
    return res.status(429).json({ message: "Account locked. Try later." });
  }

  const ok = await bcrypt.compare(password, hashToCheck);
  await sleep(jitterMs());

  // ÉCHEC : log + inc échoué + lock si trop d'essais
  if (!user || !ok) {
    await logAttempt({ email, ip, success: false });

    if (user) {
      await incFailed(email);
      const updated = await findUserByEmail(email);
      if (updated && updated.failed_login_count >= 5) {
        await lockUser(email, 15);  // Lock 15min
        return res.status(429).json({ message: "Too many attempts. Locked 15min." });
      }
    }
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // SUCCÈS : reset + log + tokens
  await resetFailed(email);
  await logAttempt({ email, ip, success: true });

  const accessToken = signAccess({ sub: String(user.id), email: user.email });
  const refreshToken = signRefresh({ sub: String(user.id) });
  const refreshHash = sha256Hex(refreshToken);
  const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TTL_DAYS || 7) * 86400000);

  await insertRefresh({
    userId: user.id,
    tokenHash: refreshHash,
    expiresAt,
    userAgent: uaHash(ua),
    ip,
  });

  const csrf = genCsrfToken();

  // Set cookies
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions({ maxAgeMs: expiresAt.getTime() - Date.now(), httpOnly: true }));
  res.cookie(CSRF_COOKIE, csrf, cookieOptions({ maxAgeMs: 86400000, httpOnly: false }));

  return res.json({ accessToken });
}

// REFRESH TOKEN (rotation)
export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies?.[REFRESH_COOKIE];
  if (!refreshToken) return res.status(401).json({ message: "Missing refresh" });

  let decoded: any;
  try {
    decoded = verifyRefresh(refreshToken);
  } catch {
    return res.status(401).json({ message: "Invalid refresh" });
  }

  const oldHash = sha256Hex(refreshToken);
  const stored = await findRefreshByHash(oldHash);

  if (!stored || stored.revoked_at || new Date(stored.expires_at).getTime() < Date.now()) {
    return res.status(401).json({ message: "Refresh not valid" });
  }

  // Anti-vol : vérifie user-agent
  const currentUaHash = uaHash(req.headers["user-agent"]);
  if (stored.user_agent && stored.user_agent !== currentUaHash) {
    await revokeRefresh(oldHash, null);
    return res.status(401).json({ message: "Session risk detected" });
  }

  // NOUVEAU refresh token (rotation)
  const newRefresh = signRefresh({ sub: decoded.sub });
  const newHash = sha256Hex(newRefresh);
  const expiresAt = new Date(Date.now() + Number(process.env.REFRESH_TTL_DAYS || 7) * 86400000);

  await revokeRefresh(oldHash, newHash);  // Ancien → révoqué
  await insertRefresh({
    userId: Number(decoded.sub),
    tokenHash: newHash,
    expiresAt,
    userAgent: currentUaHash,
    ip: req.ip,
  });

  const accessToken = signAccess({ sub: decoded.sub });
  const csrf = genCsrfToken();

  res.cookie(REFRESH_COOKIE, newRefresh, cookieOptions({ maxAgeMs: expiresAt.getTime() - Date.now(), httpOnly: true }));
  res.cookie(CSRF_COOKIE, csrf, cookieOptions({ maxAgeMs: 86400000, httpOnly: false }));

  return res.json({ accessToken });
}

// LOGOUT
export async function logout(req: Request, res: Response) {
  const t = req.cookies?.[REFRESH_COOKIE];
  if (t) await revokeRefresh(sha256Hex(t));  // Révoque token DB

  res.clearCookie(REFRESH_COOKIE, cookieOptions({ maxAgeMs: 0, httpOnly: true }));
  res.clearCookie(CSRF_COOKIE, cookieOptions({ maxAgeMs: 0, httpOnly: false }));
  return res.json({ ok: true });
}
