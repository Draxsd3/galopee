const adminService = require('../services/adminService');

async function users(_req, res) {
    const items = await adminService.listUsers();
    res.json({ items });
}

async function sellers(_req, res) {
    const items = await adminService.listSellers();
    res.json({ items });
}

async function orders(_req, res) {
    const items = await adminService.listOrders();
    res.json({ items });
}

async function metrics(_req, res) {
    const data = await adminService.metrics();
    res.json(data);
}

module.exports = { users, sellers, orders, metrics };
