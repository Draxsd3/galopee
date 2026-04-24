const { ZodError } = require('zod');

class ApiError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

function notFoundHandler(req, res, _next) {
    res.status(404).json({ error: 'NotFound', message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'ValidationError',
            message: 'Dados inválidos',
            details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
    }

    if (err instanceof ApiError) {
        return res.status(err.status).json({
            error: err.name || 'ApiError',
            message: err.message,
            details: err.details,
        });
    }

    // Códigos conhecidos do PostgreSQL
    if (err.code === '23505') {
        return res.status(409).json({ error: 'Conflict', message: 'Registro já existe', details: err.detail });
    }
    if (err.code === '23503') {
        return res.status(400).json({ error: 'BadRequest', message: 'Violação de chave estrangeira', details: err.detail });
    }

    console.error('[api] Erro não tratado:', err);
    res.status(500).json({ error: 'InternalServerError', message: 'Ocorreu um erro inesperado' });
}

module.exports = { errorHandler, notFoundHandler, ApiError };
