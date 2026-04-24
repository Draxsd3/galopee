const { Pool } = require('pg');

const useSSL = String(process.env.DATABASE_SSL || 'false').toLowerCase() === 'true';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('[pg] erro inesperado no pool de conexões:', err);
});

/**
 * Executa uma query simples retornando as linhas.
 */
async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    if (process.env.NODE_ENV !== 'production') {
        const duration = Date.now() - start;
        console.log('[sql]', { text: text.replace(/\s+/g, ' ').trim().slice(0, 120), duration, rows: res.rowCount });
    }
    return res;
}

/**
 * Executa uma função recebendo um client dedicado dentro de uma transação.
 * Garante BEGIN / COMMIT / ROLLBACK automaticamente.
 */
async function withTransaction(fn) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await fn(client);
        await client.query('COMMIT');
        return result;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

module.exports = { pool, query, withTransaction };
