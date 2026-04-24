const { z } = require('zod');
const orderService = require('../services/orderService');

const createSchema = z.object({
    shipping_address: z.object({
        street: z.string().min(2),
        number: z.string().optional(),
        complement: z.string().optional(),
        district: z.string().optional(),
        city: z.string().min(2),
        state: z.string().min(2),
        zip: z.string().min(5),
    }).optional(),
    notes: z.string().max(1000).optional(),
});

const updateStatusSchema = z.object({
    status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']).optional(),
    payment_status: z.enum(['pending', 'processing', 'approved', 'refused', 'refunded']).optional(),
    tracking_code: z.string().max(100).optional(),
    payment_reference: z.string().max(200).optional(),
});

async function create(req, res) {
    const data = createSchema.parse(req.body);
    const orders = await orderService.createFromCart(req.user.id, data);
    res.status(201).json({ orders });
}

async function listMyPurchases(req, res) {
    const items = await orderService.listByBuyer(req.user.id);
    res.json({ items });
}

async function listMySales(req, res) {
    const items = await orderService.listBySellerUserId(req.user.id);
    res.json({ items });
}

async function getOne(req, res) {
    const order = await orderService.getById(Number(req.params.id), req.user);
    res.json(order);
}

async function updateStatus(req, res) {
    const data = updateStatusSchema.parse(req.body);
    const order = await orderService.updateStatus(Number(req.params.id), req.user, data);
    res.json(order);
}

module.exports = { create, listMyPurchases, listMySales, getOne, updateStatus };
