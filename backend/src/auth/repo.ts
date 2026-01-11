import { pool } from "../db";

// Structure des lignes "users" en base
export type UserRow = {
  id: number;
  email: string;
  password_hash: string;
  failed_login_count: number;
  lock_until: Date | null;
};

// Structure des lignes "refresh_tokens" en base
export type RefreshRow = {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  replaced_by_hash: string | null;
  user_agent: string | null;
  ip: string | null;
};

// Trouve un utilisateur par email
export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const [rows] = await pool.query<any[]>("SELECT * FROM users WHERE email=? LIMIT 1", [email]);
  return (rows[0] as UserRow) || null;
}

// Crée un nouvel utilisateur
export async function createUser(email: string, passwordHash: string): Promise<number> {
  const [r] = await pool.query<any>("INSERT INTO users(email,password_hash) VALUES(?,?)", [email, passwordHash]);
  return r.insertId as number;
}

// Incrémente les échecs de connexion
export async function incFailed(email: string): Promise<void> {
  await pool.query("UPDATE users SET failed_login_count = failed_login_count + 1 WHERE email=?", [email]);
}

// Reset les échecs + déverrouille
export async function resetFailed(email: string): Promise<void> {
  await pool.query("UPDATE users SET failed_login_count=0, lock_until=NULL WHERE email=?", [email]);
}

// Verrouille l'utilisateur X minutes
export async function lockUser(email: string, minutes: number): Promise<void> {
  await pool.query("UPDATE users SET lock_until = DATE_ADD(NOW(), INTERVAL ? MINUTE) WHERE email=?", [minutes, email]);
}

// Log une tentative de connexion
export async function logAttempt(params: { email?: string | null; ip?: string | null; success: boolean }): Promise<void> {
  await pool.query("INSERT INTO login_attempts(email, ip, success) VALUES(?,?,?)", [
    params.email || null,
    params.ip || null,
    params.success ? 1 : 0,
  ]);
}

// Crée un refresh token
export async function insertRefresh(params: {
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<void> {
  await pool.query(
    "INSERT INTO refresh_tokens(user_id, token_hash, expires_at, user_agent, ip) VALUES(?,?,?,?,?)",
    [params.userId, params.tokenHash, params.expiresAt, params.userAgent || null, params.ip || null]
  );
}

// Trouve un refresh token par hash
export async function findRefreshByHash(hash: string): Promise<RefreshRow | null> {
  const [rows] = await pool.query<any[]>("SELECT * FROM refresh_tokens WHERE token_hash=? LIMIT 1", [hash]);
  return (rows[0] as RefreshRow) || null;
}

// Révoque un refresh token
export async function revokeRefresh(hash: string, replacedBy: string | null = null): Promise<void> {
  await pool.query(
    "UPDATE refresh_tokens SET revoked_at=NOW(), replaced_by_hash=? WHERE token_hash=? AND revoked_at IS NULL",
    [replacedBy, hash]
  );
}
