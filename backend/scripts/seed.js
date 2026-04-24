/**
 * Executa os seeds SQL mantidos em database/.
 *
 * Uso:
 *   npm run db:seed
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

const seedFiles = [
    'seed_users.sql',
    'seed_stores_products.sql',
];

async function run() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const file of seedFiles) {
            const seedPath = path.resolve(__dirname, '..', '..', 'database', file);
            if (!fs.existsSync(seedPath)) {
                throw new Error(`Arquivo de seed nao encontrado: ${seedPath}`);
            }

            console.log(`[seed] Executando database/${file}...`);
            await client.query(fs.readFileSync(seedPath, 'utf8'));
        }

        await client.query('COMMIT');
        console.log('[seed] OK: usuarios, empresas e produtos de teste criados/atualizados.');
        console.log('[seed] Senha padrao dos usuarios: senha123');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[seed] Falhou:', err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

run();
