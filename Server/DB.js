import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();

let pool;

export async function getPool() {
  if (pool) return pool;

  pool = await sql.connect({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: { trustServerCertificate: true }
  });

  console.log("Connected to MSSQL");
  return pool;
}
