const { z } = require('zod');
const authService = require('../services/authService');

const registerSchema = z.object({
    name: z.string().min(2, 'Nome muito curto').max(120),
    email: z.string().email('E-mail inválido').max(160),
    password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres').max(100),
    phone: z.string().max(30).optional(),
});

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
});

const updateProfileSchema = z.object({
    name: z.string().min(2).max(120).optional(),
    phone: z.string().max(30).optional().or(z.literal('')),
});

const becomeSellerSchema = z.object({
    storeName: z.string().min(2, 'Nome da loja muito curto').max(150),
    storeDescription: z.string().max(2000).optional(),
});

async function register(req, res) {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(result);
}

async function login(req, res) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.json(result);
}

async function me(req, res) {
    const user = await authService.me(req.user.id);
    res.json(user);
}

async function updateMe(req, res) {
    const data = updateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user.id, data);
    res.json(user);
}

async function becomeSeller(req, res) {
    const data = becomeSellerSchema.parse(req.body);
    const result = await authService.becomeSeller(req.user.id, data);
    res.json(result);
}

module.exports = { register, login, me, updateMe, becomeSeller };
