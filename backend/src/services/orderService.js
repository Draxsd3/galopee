const { query, withTransaction } = require('../config/database');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Cria um (ou mais) pedido(s) a partir do carrinho do usuário.
 * Como cada produto pertence a um vendedor e o schema associa pedido→vendedor,
 * agrupamos os itens do carrinho por seller_id e geramos um pedido por vendedor.
 */
async function createFromCart(userId, { shipping_address, notes } = {}) {
    return withTransaction(async (client) => {
        // Carrega itens do carrinho com dados necessários
        const { rows: items } = await client.query(
            `SELECT ci.id AS cart_item_id, ci.quantity,
                    p.id AS product_id, p.name, p.price, p.stock, p.active, p.seller_id
             FROM cart_items ci
             JOIN carts c ON c.id = ci.cart_id
             JOIN products p ON p.id = ci.product_id
             WHERE c.user_id = $1
             FOR UPDATE OF ci, p`,
            [userId]
        );

        if (!items.length) throw new ApiError(400, 'Seu carrinho está vazio');

        // Valida estoque
        for (const it of items) {
            if (!it.active) {
                throw new ApiError(400, `O produto "${it.name}" não está mais disponível`);
            }
            if (it.stock < it.quantity) {
                throw new ApiError(400, `Estoque insuficiente para o produto "${it.name}"`);
            }
        }

        // Agrupa por vendedor
        const bySeller = new Map();
        for (const it of items) {
            if (!bySeller.has(it.seller_id)) bySeller.set(it.seller_id, []);
            bySeller.get(it.seller_id).push(it);
        }

        const createdOrders = [];

        for (const [sellerId, sellerItems] of bySeller.entries()) {
            const total = sellerItems.reduce((acc, it) => acc + Number(it.price) * it.quantity, 0);

            const { rows: orderRows } = await client.query(
                `INSERT INTO orders (buyer_id, seller_id, total_amount, status, payment_status, shipping_address, notes)
                 VALUES ($1, $2, $3, 'pending', 'pending', $4, $5)
                 RETURNING *`,
                [userId, sellerId, total.toFixed(2), shipping_address ? JSON.stringify(shipping_address) : null, notes || null]
            );
            const order = orderRows[0];

            for (const it of sellerItems) {
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
                     VALUES ($1,$2,$3,$4,$5,$6)`,
                    [order.id, it.product_id, it.name, it.quantity, it.price, (Number(it.price) * it.quantity).toFixed(2)]
                );
                // Debita estoque
                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [it.quantity, it.product_id]
                );
            }

            createdOrders.push(order);
        }

        // Limpa carrinho
        await client.query(
            `DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)`,
            [userId]
        );

        return createdOrders;
    });
}

async function listByBuyer(userId) {
    const { rows } = await query(
        `SELECT o.*, s.store_name, s.store_slug,
                (SELECT json_agg(json_build_object(
                    'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
                    'quantity', oi.quantity, 'unit_price', oi.unit_price, 'subtotal', oi.subtotal))
                 FROM order_items oi WHERE oi.order_id = o.id) AS items
         FROM orders o
         JOIN sellers s ON s.id = o.seller_id
         WHERE o.buyer_id = $1
         ORDER BY o.created_at DESC`,
        [userId]
    );
    return rows;
}

async function listBySellerUserId(userId) {
    const { rows } = await query(
        `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email,
                (SELECT json_agg(json_build_object(
                    'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
                    'quantity', oi.quantity, 'unit_price', oi.unit_price, 'subtotal', oi.subtotal))
                 FROM order_items oi WHERE oi.order_id = o.id) AS items
         FROM orders o
         JOIN sellers s ON s.id = o.seller_id
         JOIN users   u ON u.id = o.buyer_id
         WHERE s.user_id = $1
         ORDER BY o.created_at DESC`,
        [userId]
    );
    return rows;
}

async function getById(orderId, requester) {
    const { rows } = await query(
        `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email,
                s.store_name, s.store_slug, s.user_id AS seller_user_id,
                (SELECT json_agg(json_build_object(
                    'id', oi.id, 'product_id', oi.product_id, 'product_name', oi.product_name,
                    'quantity', oi.quantity, 'unit_price', oi.unit_price, 'subtotal', oi.subtotal))
                 FROM order_items oi WHERE oi.order_id = o.id) AS items
         FROM orders o
         JOIN sellers s ON s.id = o.seller_id
         JOIN users   u ON u.id = o.buyer_id
         WHERE o.id = $1`,
        [orderId]
    );
    const order = rows[0];
    if (!order) throw new ApiError(404, 'Pedido não encontrado');

    const isOwner = order.buyer_id === requester.id || order.seller_user_id === requester.id;
    if (requester.role !== 'admin' && !isOwner) {
        throw new ApiError(403, 'Você não tem permissão para ver este pedido');
    }
    return order;
}

async function updateStatus(orderId, requester, { status, tracking_code, payment_status, payment_reference }) {
    // Carrega pedido e valida permissão
    const { rows } = await query('SELECT o.*, s.user_id AS seller_user_id FROM orders o JOIN sellers s ON s.id = o.seller_id WHERE o.id = $1', [orderId]);
    const order = rows[0];
    if (!order) throw new ApiError(404, 'Pedido não encontrado');
    if (requester.role !== 'admin' && order.seller_user_id !== requester.id) {
        throw new ApiError(403, 'Apenas o vendedor ou admin pode atualizar este pedido');
    }

    const fields = [];
    const params = [];
    let idx = 1;
    if (status)            { fields.push(`status = $${idx++}`);            params.push(status); }
    if (tracking_code)     { fields.push(`tracking_code = $${idx++}`);     params.push(tracking_code); }
    if (payment_status)    { fields.push(`payment_status = $${idx++}`);    params.push(payment_status); }
    if (payment_reference) { fields.push(`payment_reference = $${idx++}`); params.push(payment_reference); }
    if (!fields.length) return order;

    params.push(orderId);
    const { rows: upd } = await query(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
        params
    );
    return upd[0];
}

module.exports = { createFromCart, listByBuyer, listBySellerUserId, getById, updateStatus };
