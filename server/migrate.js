import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log("Connecting to MySQL...");
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Feb2024100514',
      multipleStatements: true // This allows running multiple queries at once
    });

    console.log("Connected! Reading SQL file...");
    const sqlPath = path.join(__dirname, '..', 'database', '3kp_dental_laboratory.sql');
    const sqlQuery = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing database migration...");
    await connection.query(sqlQuery);
    
    console.log("Migration completed successfully! The database is now up to date.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
