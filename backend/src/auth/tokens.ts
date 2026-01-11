import jwt from "jsonwebtoken";
import type {JwtPayload} from "jsonwebtoken";

// Types des payloads JWT
type AccessPayload = { sub: string; email?: string };  // Token court (15min)
type RefreshPayload = { sub: string };                 // Token long (7 jours)

function mustGetEnv(name: string, fallback?: string): string {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// Clés secrètes JWT générées (a remplacer par tes vraies clés en prod)
const ACCESS_SECRET = mustGetEnv("ACCESS_TOKEN_SECRET");
const REFRESH_SECRET = mustGetEnv("REFRESH_TOKEN_SECRET");


export function signAccess(payload: AccessPayload): string {
  const ttl = Number(process.env.ACCESS_TTL_MIN || 15);  // 15min par défaut
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: `${ttl}m` });
}

export function signRefresh(payload: RefreshPayload): string {
  const days = Number(process.env.REFRESH_TTL_DAYS || 7);  // 7 jours par défaut
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: `${days}d` });
}

export function verifyAccess(token: string): JwtPayload & AccessPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload & AccessPayload;
}

export function verifyRefresh(token: string): JwtPayload & RefreshPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload & RefreshPayload;
}
