/**
 * Executa o schema.sql contra o banco definido em DATABASE_URL.
 * Uso:
 *   node scripts/migrate.js
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function run() {
    const schemaPath = path.resolve(__dirname, '..', '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
        console.error('Arquivo schema.sql não encontrado em', schemaPath);
        process.exit(1);
    }
    const sql = fs.readFileSync(schemaPath, 'utf8');
    console.log('[migrate] Executando schema.sql...');
    const client = await pool.connect();
    try {
        await client.query(sql);
        console.log('[migrate] OK');
    } catch (err) {
        console.error('[migrate] Falhou:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
