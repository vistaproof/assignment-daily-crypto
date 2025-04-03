const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function runMigrations() {
  try {
    // Read migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log('Running migrations...');

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Executing migration: ${file}`);
      await pool.query(sql);
      console.log(`Migration completed: ${file}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await pool.end();
  }
}

runMigrations(); 