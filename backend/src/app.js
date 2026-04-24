const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const sellerRoutes  = require('./routes/sellerRoutes');
const cartRoutes    = require('./routes/cartRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const adminRoutes   = require('./routes/adminRoutes');

const app = express();

// ------------------------------------------------------------
// Middlewares globais
// ------------------------------------------------------------
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

function isLocalDevelopmentOrigin(origin) {
    if (process.env.NODE_ENV === 'production') return false;
    try {
        const url = new URL(origin);
        return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
    } catch {
        return false;
    }
}

app.use(
    cors({
        origin: (origin, cb) => {
            if (!origin) return cb(null, true);
            if (allowedOrigins.length === 0 || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
                return cb(null, true);
            }
            return cb(new Error(`Origin ${origin} não permitida pelo CORS`));
        },
        credentials: true,
    })
);

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ------------------------------------------------------------
// Rotas
// ------------------------------------------------------------
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'galoppe-api', time: new Date().toISOString() });
});

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sellers',  sellerRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);

// 404 e error handler sempre no final
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
