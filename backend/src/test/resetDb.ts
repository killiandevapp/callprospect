import { pool } from "../db";

export async function resetDb() {
  // ordre important à cause des FK
  await pool.query("SET FOREIGN_KEY_CHECKS=0");
  await pool.query("TRUNCATE TABLE refresh_tokens");
  await pool.query("TRUNCATE TABLE login_attempts");
  await pool.query("TRUNCATE TABLE users");
  await pool.query("SET FOREIGN_KEY_CHECKS=1");
}
