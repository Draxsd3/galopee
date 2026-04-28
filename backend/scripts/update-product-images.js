/**
 * Executa database/update_product_images.sql contra o banco definido em DATABASE_URL.
 *
 * Uso:
 *   npm run db:update-images
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function run() {
    const updatePath = path.resolve(__dirname, '..', '..', 'database', 'update_product_images.sql');

    if (!fs.existsSync(updatePath)) {
        console.error('Arquivo update_product_images.sql nao encontrado em', updatePath);
        process.exit(1);
    }

    const sql = fs.readFileSync(updatePath, 'utf8');
    console.log('[update-images] Executando database/update_product_images.sql...');

    const client = await pool.connect();
    try {
        await client.query(sql);
        console.log('[update-images] OK');
    } catch (err) {
        console.error('[update-images] Falhou:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
