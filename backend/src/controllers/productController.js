const { z } = require('zod');
const productService = require('../services/productService');

const imageReferenceSchema = z.string().refine(
    (value) => {
        if (!value) return true;
        if (/^https?:\/\/.+/i.test(value)) return true;
        return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
    },
    'Informe uma URL de imagem ou envie um arquivo de imagem válido'
);

const productSchema = z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(4000).optional(),
    price: z.coerce.number().nonnegative(),
    compare_price: z.coerce.number().nonnegative().optional().nullable(),
    image_url: imageReferenceSchema.optional().or(z.literal('').transform(() => undefined)),
    stock: z.coerce.number().int().nonnegative().default(0),
    category: z.string().max(80).optional(),
    sku: z.string().max(80).optional(),
    free_shipping: z.coerce.boolean().optional(),
    featured: z.coerce.boolean().optional(),
    active: z.coerce.boolean().optional(),
});

async function list(req, res) {
    const { search, category, sellerId, featured, limit, offset } = req.query;
    const items = await productService.listPublic({
        search,
        category,
        sellerId: sellerId ? Number(sellerId) : undefined,
        featured: featured === 'true' || featured === '1',
        limit: limit ? Number(limit) : 24,
        offset: offset ? Number(offset) : 0,
    });
    res.json({ items });
}

async function listCategories(_req, res) {
    const items = await productService.listCategories();
    res.json({ items });
}

async function getOne(req, res) {
    const product = await productService.getById(Number(req.params.id));
    res.json(product);
}

async function listMine(req, res) {
    const items = await productService.listBySellerUserId(req.user.id);
    res.json({ items });
}

async function create(req, res) {
    const data = productSchema.parse(req.body);
    const product = await productService.create(req.user.id, data);
    res.status(201).json(product);
}

async function update(req, res) {
    const data = productSchema.partial().parse(req.body);
    const product = await productService.update(req.user.id, Number(req.params.id), data);
    res.json(product);
}

async function remove(req, res) {
    await productService.remove(req.user.id, Number(req.params.id));
    res.status(204).end();
}

module.exports = { list, listCategories, getOne, listMine, create, update, remove };
