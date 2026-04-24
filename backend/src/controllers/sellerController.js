const { z } = require('zod');
const sellerService = require('../services/sellerService');

const imageReferenceSchema = z.string().refine(
    (value) => {
        if (!value) return true;
        if (/^https?:\/\/.+/i.test(value)) return true;
        return /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value);
    },
    'Informe uma URL de imagem ou envie um arquivo de imagem válido'
);

const updateStoreSchema = z.object({
    store_name: z.string().min(2).max(150).optional(),
    description: z.string().max(2000).optional(),
    logo_url: imageReferenceSchema.optional().or(z.literal('').transform(() => undefined)),
    banner_url: imageReferenceSchema.optional().or(z.literal('').transform(() => undefined)),
});

async function listAll(_req, res) {
    const items = await sellerService.listAll();
    res.json({ items });
}

async function getBySlug(req, res) {
    const store = await sellerService.getBySlug(req.params.slug);
    res.json(store);
}

async function myStore(req, res) {
    const store = await sellerService.getMyStore(req.user.id);
    res.json(store);
}

async function updateMyStore(req, res) {
    const data = updateStoreSchema.parse(req.body);
    const store = await sellerService.updateMyStore(req.user.id, data);
    res.json(store);
}

module.exports = { listAll, getBySlug, myStore, updateMyStore };
