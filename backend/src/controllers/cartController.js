const { z } = require('zod');
const cartService = require('../services/cartService');

const addSchema = z.object({
    product_id: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive().default(1),
});

const updateSchema = z.object({
    quantity: z.coerce.number().int().positive(),
});

async function get(req, res) {
    const cart = await cartService.getCart(req.user.id);
    res.json(cart);
}

async function add(req, res) {
    const { product_id, quantity } = addSchema.parse(req.body);
    const cart = await cartService.addItem(req.user.id, product_id, quantity);
    res.status(201).json(cart);
}

async function update(req, res) {
    const { quantity } = updateSchema.parse(req.body);
    const cart = await cartService.updateItem(req.user.id, Number(req.params.itemId), quantity);
    res.json(cart);
}

async function remove(req, res) {
    const cart = await cartService.removeItem(req.user.id, Number(req.params.itemId));
    res.json(cart);
}

async function clear(req, res) {
    const cart = await cartService.clear(req.user.id);
    res.json(cart);
}

module.exports = { get, add, update, remove, clear };
