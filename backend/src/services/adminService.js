const { query } = require('../config/database');

async function listUsers() {
    const { rows } = await query(
        `SELECT id, name, email, role, phone, active, created_at
         FROM users ORDER BY created_at DESC`
    );
    return rows;
}

async function listSellers() {
    const { rows } = await query(
        `SELECT s.*, u.name AS user_name, u.email AS user_email, u.active AS user_active
         FROM sellers s JOIN users u ON u.id = s.user_id
         ORDER BY s.created_at DESC`
    );
    return rows;
}

async function listOrders() {
    const { rows } = await query(
        `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email,
                s.store_name, s.store_slug
         FROM orders o
         JOIN users   u ON u.id = o.buyer_id
         JOIN sellers s ON s.id = o.seller_id
         ORDER BY o.created_at DESC`
    );
    return rows;
}

async function metrics() {
    const { rows } = await query(
        `SELECT
            (SELECT COUNT(*) FROM users)                        AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'buyer')   AS total_buyers,
            (SELECT COUNT(*) FROM sellers)                      AS total_sellers,
            (SELECT COUNT(*) FROM products)                     AS total_products,
            (SELECT COUNT(*) FROM orders)                       AS total_orders,
            (SELECT COALESCE(SUM(total_amount),0) FROM orders)  AS gmv`
    );
    return rows[0];
}

module.exports = { listUsers, listSellers, listOrders, metrics };
