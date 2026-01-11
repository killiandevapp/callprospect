import type { NextFunction, Request, Response } from "express";
import { verifyAccess } from "./tokens";

// AJOUTE "user" à req (TypeScript ne le connait pas nativement)
declare global {
  namespace Express {
    interface Request {
      user?: any;  // Stocke l'utilisateur décodé du token
    }
  }
}

// MIDDLEWARE : Vérifie le token JWT
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";           // Récupère "Authorization" header
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;  // Extrait token
  
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = verifyAccess(token);  // Décode token → utilisateur
    return next();                   // OK → passe à la route
  } catch {
    return res.status(401).json({ message: "Invalid token" });  // Token faux/expiré
  }
}

// MIDDLEWARE : Vérifie CSRF token
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const h = req.headers["x-csrf-token"];  // Token CSRF depuis header
  const c = req.cookies?.["csrf_token"];  // Token CSRF depuis cookie
  
  if (!h || !c || h !== c) return res.status(403).json({ message: "CSRF failed" });
  return next();  // Les 2 tokens matchent → OK
}
