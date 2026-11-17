const fs = require('fs');
const path = require('path');
const { Pool, Client, types } = require('pg');

// Return DATE columns as plain 'YYYY-MM-DD' strings (avoids timezone shifts)
types.setTypeParser(1082, (v) => v);
// NUMERIC -> JS number
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));
// BIGINT (COUNT(*)) -> JS number
types.setTypeParser(20, (v) => parseInt(v, 10));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env and configure it.');
  process.exit(1);
}

const pool = new Pool({ connectionString, max: 10 });

pool.on('error', (err) => console.error('Unexpected PostgreSQL pool error:', err.message));

/** Create the database if it does not exist yet (needs CREATEDB privilege). */
async function ensureDatabase() {
  const probe = new Client({ connectionString });
  try {
    await probe.connect();
    await probe.end();
    return;
  } catch (err) {
    if (err.code !== '3D000') throw err; // 3D000 = invalid_catalog_name (db missing)
  }

  const url = new URL(connectionString);
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error(`Refusing to auto-create database with unusual name "${dbName}"`);
  }
  url.pathname = '/postgres';
  const admin = new Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE "${dbName}"`);
    console.log(`Created database "${dbName}"`);
  } finally {
    await admin.end();
  }
}

async function init() {
  await ensureDatabase();
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
}

module.exports = { pool, init };
