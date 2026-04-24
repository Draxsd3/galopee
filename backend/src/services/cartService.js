const { query, withTransaction } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

async function getOrCreateCartId(userId, client) {
    const runner = client || { query };
    const existing = await runner.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (existing.rowCount) return existing.rows[0].id;
    const created = await runner.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
        [userId]
    );
    return created.rows[0].id;
}

async function getCart(userId, client) {
    const runner = client || { query };
    const cartId = await getOrCreateCartId(userId, client);
    const { rows } = await runner.query(
        `SELECT ci.id, ci.quantity,
                p.id AS product_id, p.name, p.price, p.image_url, p.stock, p.active,
                s.id AS seller_id, s.store_name, s.store_slug
         FROM cart_items ci
         JOIN products   p ON p.id = ci.product_id
         JOIN sellers    s ON s.id = p.seller_id
         WHERE ci.cart_id = $1
         ORDER BY ci.created_at ASC`,
        [cartId]
    );
    const items = rows.map((r) => ({
        id: r.id,
        quantity: r.quantity,
        product: {
            id: r.product_id,
            name: r.name,
            price: Number(r.price),
            image_url: r.image_url,
            stock: r.stock,
            active: r.active,
            seller: { id: r.seller_id, store_name: r.store_name, store_slug: r.store_slug },
        },
        subtotal: Number(r.price) * r.quantity,
    }));
    const total = items.reduce((acc, it) => acc + it.subtotal, 0);
    return { cart_id: cartId, items, total: Number(total.toFixed(2)) };
}

async function addItem(userId, productId, quantity = 1) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ApiError(400, 'Quantidade inválida');
    }

    return withTransaction(async (client) => {
        const prod = await client.query(
            'SELECT id, stock, active FROM products WHERE id = $1 FOR UPDATE',
            [productId]
        );
        if (!prod.rowCount || !prod.rows[0].active) throw new ApiError(404, 'Produto indisponível');

        const cartId = await getOrCreateCartId(userId, client);
        const current = await client.query(
            'SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2 FOR UPDATE',
            [cartId, productId]
        );
        const currentQuantity = current.rows[0]?.quantity || 0;
        const nextQuantity = currentQuantity + quantity;

        if (prod.rows[0].stock < nextQuantity) {
            throw new ApiError(400, `Estoque insuficiente. Disponível: ${prod.rows[0].stock}`);
        }

        await client.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (cart_id, product_id)
             DO UPDATE SET quantity = EXCLUDED.quantity`,
            [cartId, productId, nextQuantity]
        );
        return getCart(userId, client);
    });
}

async function updateItem(userId, itemId, quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new ApiError(400, 'Quantidade inválida');
    }

    return withTransaction(async (client) => {
        const cartId = await getOrCreateCartId(userId, client);
        const item = await client.query(
            `SELECT ci.id, p.stock, p.active
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.id = $1 AND ci.cart_id = $2
             FOR UPDATE OF ci, p`,
            [itemId, cartId]
        );

        if (!item.rowCount) throw new ApiError(404, 'Item do carrinho não encontrado');
        if (!item.rows[0].active) throw new ApiError(400, 'Produto indisponível');
        if (item.rows[0].stock < quantity) {
            throw new ApiError(400, `Estoque insuficiente. Disponível: ${item.rows[0].stock}`);
        }

        await client.query(
            'UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3',
            [quantity, itemId, cartId]
        );
        return getCart(userId, client);
    });
}

async function removeItem(userId, itemId) {
    const cartId = await getOrCreateCartId(userId);
    const { rowCount } = await query(
        'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2',
        [itemId, cartId]
    );
    if (!rowCount) throw new ApiError(404, 'Item do carrinho não encontrado');
    return getCart(userId);
}

async function clear(userId) {
    const cartId = await getOrCreateCartId(userId);
    await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    return { cart_id: cartId, items: [], total: 0 };
}

module.exports = { getCart, addItem, updateItem, removeItem, clear, getOrCreateCartId };
