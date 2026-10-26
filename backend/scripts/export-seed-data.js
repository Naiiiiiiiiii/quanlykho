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

// Exact foreign-key dependency order for clean import without constraint violations
const TABLE_DEPENDENCY_ORDER = [
  // 1. Core Users & Roles
  'roles',
  'employees',
  'user_accounts',
  'user_sessions',

  // 2. Warehouses & Spatial Locations
  'warehouses',
  'warehouse_zones',
  'racks',
  'storage_locations',

  // 3. Products & Variants
  'categories',
  'products',
  'colors',
  'sizes',
  'product_variants',

  // 4. Quality & Inventory Lots
  'quality_statuses',
  'lots',
  'inventory_locations',
  'quality_checks',

  // 5. Receipts & Inbound/Outbound Details
  'import_receipts',
  'import_details',
  'export_receipts',
  'export_details',
  'deliveries',
  'delivery_details',

  // 6. Facilities & Incidents
  'facility_incidents',

  // 7. Contracts
  'rental_contracts',

  // 8. Communication
  'conversations',
  'conversation_participants',
  'messages',

  // 9. HR & Tasks
  'salary_records',
  'work_tasks',

  // 10. System Administration
  'backup_logs',
  'system_error_logs',
  'storage_specifications',
  'variant_storage_specifications',
];

async function exportSeedData() {
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');

  const outDir = path.resolve(__dirname, '../../database');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const allData = {};
  let sqlContent = `-- =============================================================================
-- HỆ THỐNG QUẢN LÝ KHO QUẦN ÁO - TẬP LỆNH DỮ LIỆU MẪU ĐỘC LẬP (SEED DATA)
-- Mô tả: File SQL độc lập chứa toàn bộ dữ liệu mẫu phục vụ kiểm thử và vận hành
-- Hỗ trợ đầy đủ: 23 Use Cases (UC01 -> UC23)
-- Thời gian xuất: ${new Date().toLocaleString('vi-VN')}
-- Cách dùng: psql -U postgres -d quanlykho -f seed-data.sql
-- =============================================================================

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

`;

  // Fetch real tables in public schema
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  const existingTables = new Set(tablesRes.rows.map((r) => r.table_name));

  // Sort tables: defined topological order first, then any extra tables
  const sortedTables = [];
  for (const t of TABLE_DEPENDENCY_ORDER) {
    if (existingTables.has(t)) {
      sortedTables.push(t);
    }
  }
  for (const t of existingTables) {
    if (!sortedTables.includes(t)) {
      sortedTables.push(t);
    }
  }

  console.log('Dang xuat du lieu theo thu tu rang buoc khoa ngoai:');
  for (const table of sortedTables) {
    const rowsRes = await client.query(`SELECT * FROM "${table}" ORDER BY 1 ASC;`);
    const rows = rowsRes.rows;
    allData[table] = rows;
    console.log(`- ${table}: ${rows.length} ban ghi`);

    if (rows.length > 0) {
      sqlContent += `-- -----------------------------------------------------------------------------\n`;
      sqlContent += `-- Bang: "${table}" (${rows.length} ban ghi)\n`;
      sqlContent += `-- -----------------------------------------------------------------------------\n`;

      const columns = Object.keys(rows[0]);
      const colListStr = columns.map((c) => `"${c}"`).join(', ');

      for (const row of rows) {
        const valList = columns.map((col) => {
          const val = row[col];
          if (val === null || val === undefined) {
            return 'NULL';
          }
          if (typeof val === 'boolean') {
            return val ? 'TRUE' : 'FALSE';
          }
          if (typeof val === 'number') {
            return val;
          }
          if (val instanceof Date) {
            return `'${val.toISOString()}'`;
          }
          if (typeof val === 'object') {
            return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          }
          const escaped = String(val).replace(/'/g, "''");
          return `'${escaped}'`;
        });

        sqlContent += `INSERT INTO "${table}" (${colListStr}) VALUES (${valList.join(', ')}) ON CONFLICT DO NOTHING;\n`;
      }
      sqlContent += `\n`;
    }
  }

  // Update sequences dynamically
  const seqRes = await client.query(`
    SELECT table_name, column_name, pg_get_serial_sequence(quote_ident(table_name), column_name) as seq_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_default LIKE 'nextval%'
  `);

  sqlContent += `-- =============================================================================\n`;
  sqlContent += `-- DONG BO LAI CAC SEQUENCE TU DONG TANG CUA POSTGRESQL\n`;
  sqlContent += `-- =============================================================================\n`;

  for (const r of seqRes.rows) {
    if (r.seq_name) {
      sqlContent += `SELECT setval('${r.seq_name}', COALESCE((SELECT MAX("${r.column_name}") FROM "${r.table_name}"), 1));\n`;
    }
  }

  const sqlPath = path.join(outDir, 'seed-data.sql');
  const jsonPath = path.join(outDir, 'seed-data.json');

  fs.writeFileSync(sqlPath, sqlContent, 'utf8');
  fs.writeFileSync(jsonPath, JSON.stringify(allData, null, 2), 'utf8');

  console.log(`\nDa xuat thanh cong:`);
  console.log(`1. SQL Script doc lap: ${sqlPath}`);
  console.log(`2. JSON Dataset doc lap: ${jsonPath}`);

  await client.end();
}

exportSeedData().catch((err) => {
  console.error('Loi khi xuat seed data:', err);
  process.exit(1);
});
