const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, withTransaction } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const { slugify } = require('../utils/slugify');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

function signToken(user) {
    return jwt.sign(
        { sub: user.id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

function toPublicUser(u) {
    return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        created_at: u.created_at,
    };
}

async function register({ name, email, password, phone }) {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
        throw new ApiError(409, 'Já existe uma conta cadastrada com este e-mail');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    return withTransaction(async (client) => {
        const { rows: userRows } = await client.query(
            `INSERT INTO users (name, email, password_hash, role, phone)
             VALUES ($1, $2, $3, 'buyer', $4)
             RETURNING id, name, email, role, phone, created_at`,
            [name, email, passwordHash, phone || null]
        );
        const user = userRows[0];

        await client.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);

        const token = signToken(user);
        return { token, user: toPublicUser(user) };
    });
}

async function login({ email, password }) {
    const { rows } = await query(
        'SELECT id, name, email, role, phone, password_hash, active, created_at FROM users WHERE email = $1',
        [email]
    );
    const user = rows[0];
    if (!user) throw new ApiError(401, 'Credenciais inválidas');
    if (!user.active) throw new ApiError(403, 'Conta desativada');

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new ApiError(401, 'Credenciais inválidas');

    if (user.role === 'buyer' || user.role === 'seller') {
        await query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);
    }

    const token = signToken(user);
    return { token, user: toPublicUser(user) };
}

async function me(userId) {
    const { rows } = await query(
        `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                s.id AS seller_id, s.store_name, s.store_slug, s.description AS store_description
         FROM users u
         LEFT JOIN sellers s ON s.user_id = u.id
         WHERE u.id = $1`,
        [userId]
    );
    return rows[0] || null;
}

async function updateProfile(userId, { name, phone }) {
    const fields = [];
    const params = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name = $${idx++}`); params.push(name); }
    if (phone !== undefined) { fields.push(`phone = $${idx++}`); params.push(phone || null); }
    if (!fields.length) return me(userId);

    params.push(userId);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}`, params);
    return me(userId);
}

async function becomeSeller(userId, { storeName, storeDescription }) {
    return withTransaction(async (client) => {
        const userRes = await client.query(
            'SELECT id, name, role FROM users WHERE id = $1 FOR UPDATE',
            [userId]
        );
        const user = userRes.rows[0];
        if (!user) throw new ApiError(404, 'Usuário não encontrado');
        if (user.role === 'admin') {
            throw new ApiError(400, 'Admins não podem virar vendedores por este fluxo');
        }

        const existing = await client.query('SELECT id FROM sellers WHERE user_id = $1', [userId]);
        if (existing.rowCount > 0) {
            if (user.role !== 'seller') {
                await client.query('UPDATE users SET role = $1 WHERE id = $2', ['seller', userId]);
            }
        } else {
            const desiredName = storeName && storeName.trim() ? storeName.trim() : `${user.name} Store`;
            const baseSlug = slugify(desiredName) || `loja-${userId}`;
            let slug = baseSlug;
            let attempt = 0;

            while (true) {
                const dup = await client.query('SELECT 1 FROM sellers WHERE store_slug = $1', [slug]);
                if (dup.rowCount === 0) break;
                attempt += 1;
                slug = `${baseSlug}-${attempt}`;
            }

            await client.query(
                `INSERT INTO sellers (user_id, store_name, store_slug, description)
                 VALUES ($1, $2, $3, $4)`,
                [userId, desiredName, slug, storeDescription || null]
            );
            await client.query('UPDATE users SET role = $1 WHERE id = $2', ['seller', userId]);
        }

        await client.query('INSERT INTO carts (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [userId]);

        const fullRes = await client.query(
            `SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,
                    s.id AS seller_id, s.store_name, s.store_slug, s.description AS store_description
             FROM users u
             LEFT JOIN sellers s ON s.user_id = u.id
             WHERE u.id = $1`,
            [userId]
        );
        const fullUser = fullRes.rows[0];
        const token = signToken(fullUser);
        return { token, user: fullUser };
    });
}

module.exports = { register, login, me, signToken, updateProfile, becomeSeller };
