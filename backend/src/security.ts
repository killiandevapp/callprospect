import crypto from "crypto";
import type { CookieOptions } from "express";

// Hash SHA256 d'une chaine (sécurité mots de passe, etc.)
export function sha256Hex(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex");
}

// Génère un token CSRF aléatoire (anti-CSRF attacks)
export function genCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Pause (tests, delays)
export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Hash de l'User-Agent 
export function uaHash(ua: string | undefined | null): string {
  return sha256Hex(String(ua || "").slice(0, 255));
}

// Options de cookies sécurisé
export function cookieOptions(params: { maxAgeMs: number; httpOnly: boolean }): CookieOptions {
  const sameSite = String(process.env.COOKIE_SAMESITE || "lax").toLowerCase() as
    | "lax"
    | "strict"
    | "none";

  return {
    httpOnly: params.httpOnly,           // Invisible au JS (anti-XSS)
    secure: process.env.COOKIE_SECURE === "true",  // HTTPS only
    sameSite,                            // Anti-CSRF
    path: "/",                           // Accessible partout
    maxAge: params.maxAgeMs,             // Durée de vie
  };
}
