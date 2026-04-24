const jwt = require('jsonwebtoken');
const { ApiError } = require('./errorHandler');
const { query } = require('../config/database');

/**
 * Middleware de autenticação via JWT.
 * Lê o header Authorization: Bearer <token>, valida e anexa req.user.
 */
async function authenticate(req, _res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return next(new ApiError(401, 'Token de autenticação ausente ou malformado'));
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        // Busca dados mínimos do usuário para ter role atualizada
        const { rows } = await query(
            'SELECT id, name, email, role, active FROM users WHERE id = $1',
            [payload.sub]
        );
        const user = rows[0];
        if (!user || !user.active) {
            return next(new ApiError(401, 'Usuário inválido ou desativado'));
        }
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        next();
    } catch (err) {
        next(new ApiError(401, 'Token inválido ou expirado'));
    }
}

/**
 * Middleware de autorização por role(s).
 * Uso: authorize('admin'), authorize('seller','admin')
 */
function authorize(...roles) {
    return (req, _res, next) => {
        if (!req.user) return next(new ApiError(401, 'Não autenticado'));
        if (roles.length === 0 || roles.includes(req.user.role)) return next();
        next(new ApiError(403, 'Acesso negado para o seu perfil'));
    };
}

module.exports = { authenticate, authorize };
