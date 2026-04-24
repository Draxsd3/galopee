const { query } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

async function listPublic({ search, category, sellerId, featured, limit = 24, offset = 0 } = {}) {
    const params = [];
    const where = ['p.active = TRUE'];

    if (search) {
        params.push(`%${search}%`);
        where.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }
    if (category) {
        params.push(category);
        where.push(`p.category = $${params.length}`);
    }
    if (sellerId) {
        params.push(sellerId);
        where.push(`p.seller_id = $${params.length}`);
    }
    if (featured) {
        where.push(`p.featured = TRUE`);
    }

    params.push(Number(limit));
    params.push(Number(offset));

    const sql = `
        SELECT p.id, p.name, p.description, p.price, p.compare_price, p.image_url, p.stock,
               p.category, p.free_shipping, p.featured, p.created_at,
               s.id AS seller_id, s.store_name, s.store_slug, s.city, s.state,
               s.verified AS seller_verified, s.rating AS seller_rating
        FROM products p
        JOIN sellers  s ON s.id = p.seller_id
        WHERE ${where.join(' AND ')}
        ORDER BY p.featured DESC, p.created_at DESC
        LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const { rows } = await query(sql, params);
    return rows;
}

async function listCategories() {
    const { rows } = await query(
        `SELECT category, COUNT(*)::int AS count
         FROM products
         WHERE active = TRUE AND category IS NOT NULL
         GROUP BY category ORDER BY count DESC`
    );
    return rows;
}

async function getById(id) {
    const { rows } = await query(
        `SELECT p.*, s.store_name, s.store_slug, s.city, s.state,
                s.verified AS seller_verified, s.rating AS seller_rating
         FROM products p JOIN sellers s ON s.id = p.seller_id
         WHERE p.id = $1`,
        [id]
    );
    if (!rows[0]) throw new ApiError(404, 'Produto não encontrado');
    return rows[0];
}

async function listBySellerUserId(userId) {
    const { rows } = await query(
        `SELECT p.*
         FROM products p
         JOIN sellers  s ON s.id = p.seller_id
         WHERE s.user_id = $1
         ORDER BY p.created_at DESC`,
        [userId]
    );
    return rows;
}

async function getSellerByUserId(userId) {
    const { rows } = await query('SELECT * FROM sellers WHERE user_id = $1', [userId]);
    return rows[0] || null;
}

async function create(userId, data) {
    const seller = await getSellerByUserId(userId);
    if (!seller) throw new ApiError(403, 'Você precisa ter uma loja cadastrada para criar produtos');

    const { name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured } = data;
    const { rows } = await query(
        `INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [seller.id, name, description || null, price, compare_price || null, image_url || null,
         stock || 0, category || null, sku || null, !!free_shipping, !!featured]
    );
    return rows[0];
}

async function update(userId, productId, data) {
    const seller = await getSellerByUserId(userId);
    if (!seller) throw new ApiError(403, 'Você precisa ser vendedor para editar produtos');

    const existing = await query('SELECT * FROM products WHERE id = $1', [productId]);
    if (!existing.rowCount) throw new ApiError(404, 'Produto não encontrado');
    if (existing.rows[0].seller_id !== seller.id) {
        throw new ApiError(403, 'Este produto não pertence à sua loja');
    }

    const allowed = ['name', 'description', 'price', 'compare_price', 'image_url',
                     'stock', 'category', 'sku', 'active', 'free_shipping', 'featured'];
    const fields = [];
    const params = [];
    let idx = 1;
    for (const key of allowed) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${idx++}`);
            params.push(data[key]);
        }
    }
    if (!fields.length) return existing.rows[0];

    params.push(productId);
    const { rows } = await query(
        `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        params
    );
    return rows[0];
}

async function remove(userId, productId) {
    const seller = await getSellerByUserId(userId);
    if (!seller) throw new ApiError(403, 'Acesso negado');
    const existing = await query('SELECT seller_id FROM products WHERE id = $1', [productId]);
    if (!existing.rowCount) throw new ApiError(404, 'Produto não encontrado');
    if (existing.rows[0].seller_id !== seller.id) {
        throw new ApiError(403, 'Este produto não pertence à sua loja');
    }
    await query('DELETE FROM products WHERE id = $1', [productId]);
    return { deleted: true };
}

module.exports = { listPublic, listCategories, getById, listBySellerUserId, create, update, remove, getSellerByUserId };
