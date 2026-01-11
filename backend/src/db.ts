import mysql from "mysql2/promise";
import type {PoolOptions} from "mysql2/promise";
// Variables d'environnement OBLIGATOIRES (sauf password)
const requiredEnv = ["DB_HOST", "DB_USER", "DB_NAME"] as const;

for (const key of requiredEnv) {
  if (process.env[key] === undefined) {
    throw new Error(`Missing env var: ${key}`);
  }
}

const config: PoolOptions = {
  host: process.env.DB_HOST as string,         
  port: Number(process.env.DB_PORT ?? 3306),    
  user: process.env.DB_USER as string,          
  password: process.env.DB_PASSWORD as string,   
  database: process.env.DB_NAME as string,       
  connectionLimit: 10,                           
};
// POOL de connexions réutilisables
export const pool = mysql.createPool(config);     