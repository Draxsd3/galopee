require('dotenv').config();
const app = require('./src/app');
const { pool } = require('./src/config/database');

const PORT = process.env.PORT || 4000;

async function start() {
    try {
        // Testa conexão com o banco antes de subir o servidor
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as now');
        client.release();
        console.log(`[db] Conectado ao PostgreSQL em ${result.rows[0].now}`);

        app.listen(PORT, () => {
            console.log(`[api] Galoppe Marketplace rodando em http://localhost:${PORT}`);
            console.log(`[api] Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error('[startup] Falha ao iniciar a aplicação:', err.message);
        process.exit(1);
    }
}

start();

process.on('unhandledRejection', (reason) => {
    console.error('[unhandledRejection]', reason);
});
