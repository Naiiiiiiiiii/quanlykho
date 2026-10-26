const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'quanlykho',
});

async function importSeedData() {
  const sqlFile = path.resolve(__dirname, '../../database/seed-data.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`Khong tim thay file SQL: ${sqlFile}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Ket noi co so du lieu de nap seed-data.sql...');
  await client.connect();

  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Nap du lieu mau tu file seed-data.sql thanh cong!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Loi khi nap seed data:', err.message);
  } finally {
    await client.end();
  }
}

importSeedData();
