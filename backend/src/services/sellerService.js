const { query } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');
const { slugify } = require('../utils/slugify');

async function listAll() {
    const { rows } = await query(
        `SELECT s.*, u.name AS user_name, u.email AS user_email, u.active AS user_active,
                (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.id) AS products_count
         FROM sellers s
         JOIN users   u ON u.id = s.user_id
         ORDER BY s.created_at DESC`
    );
    return rows;
}

async function getBySlug(slug) {
    const { rows } = await query(
        `SELECT s.*, u.name AS user_name, u.email AS user_email
         FROM sellers s JOIN users u ON u.id = s.user_id
         WHERE s.store_slug = $1`,
        [slug]
    );
    if (!rows[0]) throw new ApiError(404, 'Loja não encontrada');
    return rows[0];
}

async function getMyStore(userId) {
    const { rows } = await query('SELECT * FROM sellers WHERE user_id = $1', [userId]);
    return rows[0] || null;
}

async function updateMyStore(userId, data) {
    const store = await getMyStore(userId);
    if (!store) throw new ApiError(404, 'Você ainda não possui uma loja');

    const allowed = ['store_name', 'description', 'logo_url', 'banner_url'];
    const fields = [];
    const params = [];
    let idx = 1;

    for (const key of allowed) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${idx++}`);
            params.push(data[key]);
        }
    }

    // Se mudou o nome, regenera slug (garantindo unicidade)
    if (data.store_name && data.store_name !== store.store_name) {
        let baseSlug = slugify(data.store_name) || `loja-${store.id}`;
        let slug = baseSlug;
        let attempt = 0;
        while (true) {
            const dup = await query('SELECT 1 FROM sellers WHERE store_slug = $1 AND id <> $2', [slug, store.id]);
            if (dup.rowCount === 0) break;
            attempt++;
            slug = `${baseSlug}-${attempt}`;
        }
        fields.push(`store_slug = $${idx++}`);
        params.push(slug);
    }

    if (!fields.length) return store;
    params.push(store.id);
    const { rows } = await query(
        `UPDATE sellers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        params
    );
    return rows[0];
}

module.exports = { listAll, getBySlug, getMyStore, updateMyStore };
