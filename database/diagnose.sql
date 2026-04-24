-- ============================================================
-- Galoppe - Diagnostico de dados
-- ============================================================
-- Rode cada bloco para ver o que existe no banco e descobrir
-- por que os produtos nao aparecem no catalogo.
--
-- Funciona em qualquer cliente SQL (psql, pgAdmin, DBeaver,
-- Supabase SQL editor, etc).
-- ============================================================


-- ---------- 1) Usuarios esperados pela seed ----------
-- FALTANDO = voce ainda nao criou esse usuario manualmente.
-- Sem o usuario, a seed pula a loja e os produtos dele.
SELECT
    CASE WHEN u.id IS NULL THEN 'FALTANDO' ELSE 'OK' END AS status,
    e.email_esperado,
    u.id   AS user_id,
    u.name,
    u.role
FROM (VALUES
    ('campo.norte@teste.com'),
    ('terra.viva@teste.com'),
    ('horizonte@teste.com'),
    ('pivo.certo@teste.com'),
    ('raiz.forte@teste.com')
) AS e(email_esperado)
LEFT JOIN users u ON u.email = e.email_esperado
ORDER BY e.email_esperado;


-- ---------- 2) Totais no banco ----------
SELECT
    (SELECT COUNT(*) FROM users)                              AS total_users,
    (SELECT COUNT(*) FROM sellers)                            AS total_sellers,
    (SELECT COUNT(*) FROM products)                           AS total_products,
    (SELECT COUNT(*) FROM products WHERE active = TRUE)       AS produtos_ativos;


-- ---------- 3) Lojas cadastradas ----------
SELECT id, user_id, store_name, store_slug, verified, rating
FROM sellers
ORDER BY id;


-- ---------- 4) Produtos por loja (somente ativos) ----------
SELECT
    s.store_name,
    p.id   AS product_id,
    p.name,
    p.category,
    p.price,
    p.stock,
    p.active,
    p.featured
FROM products p
JOIN sellers s ON s.id = p.seller_id
WHERE p.active = TRUE
ORDER BY s.store_name, p.id;


-- ---------- 5) Categorias encontradas ----------
-- Compare com o que o frontend espera:
-- Sementes, Grãos, Ração, Fertilizantes, Defensivos,
-- Irrigação, Máquinas, Ferramentas, EPI, Veterinária
SELECT category, COUNT(*) AS total
FROM products
WHERE active = TRUE
GROUP BY category
ORDER BY category;


-- ---------- 6) O que a API GET /api/products retorna ----------
SELECT p.id, p.name, p.category, s.store_name, s.verified
FROM products p
JOIN sellers s ON s.id = p.seller_id
WHERE p.active = TRUE
ORDER BY p.featured DESC, p.created_at DESC
LIMIT 24;
