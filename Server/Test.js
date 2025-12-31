import { pool } from "./DB.js";

const result = await pool.query("SELECT * FROM Users");
console.log(result.recordset);
