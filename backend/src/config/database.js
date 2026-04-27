const dns = require('dns');
const { Pool } = require('pg');

// Força resolução DNS em IPv4 primeiro (Node 18+).
dns.setDefaultResultOrder('ipv4first');

const useSSL = String(process.env.DATABASE_SSL || 'false').toLowerCase() === 'true';

if (!process.env.DATABASE_URL) {
    throw new Error('[db] DATABASE_URL não definida');
}

/**
 * Parseia DATABASE_URL e força conexão por IPv4.
 *
 * Em ambientes sem rota IPv6 de saída (ex.: Render free tier), conectar a um
 * host que resolve para IPv6 dispara ENETUNREACH. Aqui resolvemos o host pra
 * IPv4 explicitamente antes de passar pro pg, e mantemos `servername` no SSL
 * pra que a verificação TLS continue contra o hostname original.
 */
function buildPoolConfig(databaseUrl) {
    const u = new URL(databaseUrl);
    const host = u.hostname;
    const port = Number(u.port || 5432);
    const user = decodeURIComponent(u.username);
    const password = decodeURIComponent(u.password);
    const database = (u.pathname || '/postgres').replace(/^\//, '') || 'postgres';

    return new Promise((resolve, reject) => {
        dns.resolve4(host, (err, addresses) => {
            if (err) {
                return reject(
                    new Error(
                        '[db] Falha ao resolver IPv4 para "' + host + '": ' + (err.code || err.message) + '. ' +
                        'Esse host pode ser IPv6-only. Use a string do Supavisor (Transaction pooler), ' +
                        'que tem registro IPv4: aws-<n>-<regiao>.pooler.supabase.com:6543.'
                    )
                );
            }
            if (!addresses || addresses.length === 0) {
                return reject(new Error('[db] Nenhum IPv4 encontrado para "' + host + '"'));
            }
            const ipv4 = addresses[0];
            console.log('[db] Conectando via IPv4 ' + ipv4 + ' (host=' + host + ')');

            const ssl = useSSL
                ? { rejectUnauthorized: false, servername: host }
                : false;

            resolve({
                host: ipv4,
                port,
                user,
                password,
                database,
                ssl,
                max: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000,
                keepAlive: true,
            });
        });
    });
}

let _pool = null;
let _poolReady = null;

function getPool() {
    if (_pool) return Promise.resolve(_pool);
    if (!_poolReady) {
        _poolReady = buildPoolConfig(process.env.DATABASE_URL).then((cfg) => {
            _pool = new Pool(cfg);
            _pool.on('error', (err) => {
                console.error('[pg] erro inesperado no pool de conexoes:', err);
            });
            return _pool;
        });
    }
    return _poolReady;
}

async function query(text, params) {
    const pool = await getPool();
    const start = Date.now();
    const res = await pool.query(text, params);
    if (process.env.NODE_ENV !== 'production') {
        const duration = Date.now() - start;
        console.log('[sql]', { text: text.replace(/\s+/g, ' ').trim().slice(0, 120), duration, rows: res.rowCount });
    }
    return res;
}

async function withTransaction(fn) {
    const pool = await getPool();
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

// Proxy lazy: mantem compatibilidade com `const { pool } = require(...)`
const pool = new Proxy(
    {},
    {
        get(_target, prop) {
            return async (...args) => {
                const p = await getPool();
                const v = p[prop];
                return typeof v === 'function' ? v.apply(p, args) : v;
            };
        },
    }
);

module.exports = { pool, query, withTransaction, getPool };
