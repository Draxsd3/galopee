-- ============================================================
-- Galoppe Marketplace - Seed de Lojas e Produtos
-- ============================================================
-- Este script cria/atualiza apenas as LOJAS (sellers) e os
-- PRODUTOS dos vendedores de teste.
--
-- Os USUARIOS sao criados pelo arquivo database/seed_users.sql.
-- Rode esse arquivo antes deste seed de lojas/produtos.
--
-- E-mails esperados (devem existir em users):
--   1. campo.norte@teste.com    -> Campo Norte Insumos
--   2. terra.viva@teste.com     -> Terra Viva Sementes
--   3. horizonte@teste.com      -> Agropecuaria Horizonte
--   4. pivo.certo@teste.com     -> Pivo Certo Irrigacao
--   5. raiz.forte@teste.com     -> Raiz Forte Fertilizantes
--
-- Como rodar:
--   psql -U <usuario> -d <banco> -f database/seed_users.sql
--   psql -U <usuario> -d <banco> -f database/seed_stores_products.sql
--
-- O script e idempotente: pode ser executado varias vezes sem
-- duplicar dados. Lojas sao atualizadas via ON CONFLICT (user_id).
-- Produtos sao inseridos apenas se (seller_id, sku) ainda nao existe.
-- ============================================================

DO $$
DECLARE
    v_user_id   INTEGER;
    v_seller_id INTEGER;
BEGIN
    ---------------------------------------------------------
    -- 1) Campo Norte Insumos
    ---------------------------------------------------------
    SELECT id INTO v_user_id FROM users WHERE email = 'campo.norte@teste.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario campo.norte@teste.com nao encontrado. Crie-o manualmente antes.';
    ELSE
        INSERT INTO sellers
            (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating)
        VALUES (
            v_user_id,
            'Campo Norte Insumos',
            'campo-norte-insumos',
            'Empresa de teste focada em defensivos, sementes e insumos para grandes culturas.',
            '/stores/logos/campo-norte-insumos.svg',
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
            'Sorriso',
            'MT',
            TRUE,
            4.86
        )
        ON CONFLICT (user_id) DO UPDATE SET
            store_name  = EXCLUDED.store_name,
            store_slug  = EXCLUDED.store_slug,
            description = EXCLUDED.description,
            logo_url    = EXCLUDED.logo_url,
            banner_url  = EXCLUDED.banner_url,
            city        = EXCLUDED.city,
            state       = EXCLUDED.state,
            verified    = TRUE,
            rating      = EXCLUDED.rating
        RETURNING id INTO v_seller_id;

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Herbicida Teste Campo Norte 20L',
            'Produto de teste para validar fluxo de catalogo, carrinho e checkout.',
            459.90, 499.90,
            '/products/test/detonamato-herbicida.webp',
            80, 'Defensivos', 'TEST-CN-GLIFOSATO-20L', TRUE, TRUE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-CN-GLIFOSATO-20L'
        );

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Semente de Soja Teste 20kg',
            'Semente certificada ficticia para ambientes de desenvolvimento.',
            389.90, 429.90,
            '/products/test/cab-fertilizante.webp',
            120, 'Sementes', 'TEST-CN-SEMENTE-SOJA', TRUE, FALSE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-CN-SEMENTE-SOJA'
        );

        RAISE NOTICE '[seed] Campo Norte Insumos pronta (seller_id=%)', v_seller_id;
    END IF;

    ---------------------------------------------------------
    -- 2) Terra Viva Sementes
    ---------------------------------------------------------
    SELECT id INTO v_user_id FROM users WHERE email = 'terra.viva@teste.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario terra.viva@teste.com nao encontrado. Crie-o manualmente antes.';
    ELSE
        INSERT INTO sellers
            (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating)
        VALUES (
            v_user_id,
            'Terra Viva Sementes',
            'terra-viva-sementes',
            'Empresa de teste para sementes, pastagens e variedades de alta produtividade.',
            '/stores/logos/terra-viva-sementes.svg',
            'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80',
            'Rio Verde',
            'GO',
            TRUE,
            4.72
        )
        ON CONFLICT (user_id) DO UPDATE SET
            store_name  = EXCLUDED.store_name,
            store_slug  = EXCLUDED.store_slug,
            description = EXCLUDED.description,
            logo_url    = EXCLUDED.logo_url,
            banner_url  = EXCLUDED.banner_url,
            city        = EXCLUDED.city,
            state       = EXCLUDED.state,
            verified    = TRUE,
            rating      = EXCLUDED.rating
        RETURNING id INTO v_seller_id;

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Milho Hibrido Teste 20kg',
            'Produto ficticio para testes de vitrine e compra.',
            519.00, 559.00,
            '/products/test/cab-fertilizante.webp',
            90, 'Sementes', 'TEST-TV-MILHO-HIBRIDO', TRUE, TRUE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-TV-MILHO-HIBRIDO'
        );

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Brachiaria Teste 20kg',
            'Produto de teste para compra recorrente de pastagem.',
            279.90, NULL,
            '/products/test/grao-verde-formicida.webp',
            70, 'Sementes', 'TEST-TV-BRACHIARIA', FALSE, FALSE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-TV-BRACHIARIA'
        );

        RAISE NOTICE '[seed] Terra Viva Sementes pronta (seller_id=%)', v_seller_id;
    END IF;

    ---------------------------------------------------------
    -- 3) Agropecuaria Horizonte
    ---------------------------------------------------------
    SELECT id INTO v_user_id FROM users WHERE email = 'horizonte@teste.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario horizonte@teste.com nao encontrado. Crie-o manualmente antes.';
    ELSE
        INSERT INTO sellers
            (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating)
        VALUES (
            v_user_id,
            'Agropecuaria Horizonte',
            'agropecuaria-horizonte',
            'Empresa de teste com racoes, suplementos e itens para pecuaria.',
            '/stores/logos/agropecuaria-horizonte.svg',
            'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1200&q=80',
            'Uberaba',
            'MG',
            TRUE,
            4.61
        )
        ON CONFLICT (user_id) DO UPDATE SET
            store_name  = EXCLUDED.store_name,
            store_slug  = EXCLUDED.store_slug,
            description = EXCLUDED.description,
            logo_url    = EXCLUDED.logo_url,
            banner_url  = EXCLUDED.banner_url,
            city        = EXCLUDED.city,
            state       = EXCLUDED.state,
            verified    = TRUE,
            rating      = EXCLUDED.rating
        RETURNING id INTO v_seller_id;

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Racao Bovina Teste 40kg',
            'Racao ficticia para validar estoque, carrinho e pedidos.',
            209.00, 239.00,
            '/products/test/detonamato-herbicida.webp',
            110, 'Ração', 'TEST-AH-RACAO-BOVINA', TRUE, TRUE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-AH-RACAO-BOVINA'
        );

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Sal Mineral Teste 30kg',
            'Suplemento ficticio para simulacao de pedidos.',
            154.90, NULL,
            '/products/test/redut-ph-adjuvante.webp',
            140, 'Ração', 'TEST-AH-SAL-MINERAL', TRUE, FALSE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-AH-SAL-MINERAL'
        );

        RAISE NOTICE '[seed] Agropecuaria Horizonte pronta (seller_id=%)', v_seller_id;
    END IF;

    ---------------------------------------------------------
    -- 4) Pivo Certo Irrigacao
    ---------------------------------------------------------
    SELECT id INTO v_user_id FROM users WHERE email = 'pivo.certo@teste.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario pivo.certo@teste.com nao encontrado. Crie-o manualmente antes.';
    ELSE
        INSERT INTO sellers
            (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating)
        VALUES (
            v_user_id,
            'Pivo Certo Irrigacao',
            'pivo-certo-irrigacao',
            'Empresa de teste especializada em irrigacao, bombas e kits de gotejamento.',
            '/stores/logos/pivo-certo-irrigacao.svg',
            'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80',
            'Londrina',
            'PR',
            TRUE,
            4.48
        )
        ON CONFLICT (user_id) DO UPDATE SET
            store_name  = EXCLUDED.store_name,
            store_slug  = EXCLUDED.store_slug,
            description = EXCLUDED.description,
            logo_url    = EXCLUDED.logo_url,
            banner_url  = EXCLUDED.banner_url,
            city        = EXCLUDED.city,
            state       = EXCLUDED.state,
            verified    = TRUE,
            rating      = EXCLUDED.rating
        RETURNING id INTO v_seller_id;

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Kit Gotejamento Teste 100m',
            'Kit ficticio para testar produtos de ticket medio.',
            599.00, 689.00,
            '/products/test/redut-ph-adjuvante.webp',
            35, 'Irrigação', 'TEST-PC-GOTEJAMENTO-100M', FALSE, TRUE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-PC-GOTEJAMENTO-100M'
        );

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Aspersor Teste 3/4',
            'Produto ficticio para validar itens de baixo valor no carrinho.',
            49.90, NULL,
            '/products/test/akb-herbicida.webp',
            200, 'Irrigação', 'TEST-PC-ASPERSOR', TRUE, FALSE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-PC-ASPERSOR'
        );

        RAISE NOTICE '[seed] Pivo Certo Irrigacao pronta (seller_id=%)', v_seller_id;
    END IF;

    ---------------------------------------------------------
    -- 5) Raiz Forte Fertilizantes
    ---------------------------------------------------------
    SELECT id INTO v_user_id FROM users WHERE email = 'raiz.forte@teste.com';

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'Usuario raiz.forte@teste.com nao encontrado. Crie-o manualmente antes.';
    ELSE
        INSERT INTO sellers
            (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating)
        VALUES (
            v_user_id,
            'Raiz Forte Fertilizantes',
            'raiz-forte-fertilizantes',
            'Empresa de teste para fertilizantes, corretivos e nutricao de solo.',
            '/stores/logos/raiz-forte-fertilizantes.svg',
            'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?auto=format&fit=crop&w=1200&q=80',
            'Ribeirao Preto',
            'SP',
            TRUE,
            4.79
        )
        ON CONFLICT (user_id) DO UPDATE SET
            store_name  = EXCLUDED.store_name,
            store_slug  = EXCLUDED.store_slug,
            description = EXCLUDED.description,
            logo_url    = EXCLUDED.logo_url,
            banner_url  = EXCLUDED.banner_url,
            city        = EXCLUDED.city,
            state       = EXCLUDED.state,
            verified    = TRUE,
            rating      = EXCLUDED.rating
        RETURNING id INTO v_seller_id;

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'NPK Teste 20-05-20 50kg',
            'Fertilizante ficticio para validacao de catalogo e checkout.',
            289.00, 329.00,
            '/products/test/cab-fertilizante.webp',
            180, 'Fertilizantes', 'TEST-RF-NPK', TRUE, TRUE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-RF-NPK'
        );

        INSERT INTO products
            (seller_id, name, description, price, compare_price, image_url, stock, category, sku, free_shipping, featured, active)
        SELECT
            v_seller_id,
            'Calcario Teste 30kg',
            'Corretivo ficticio para fluxo de compra com varias unidades.',
            59.00, NULL,
            '/products/test/redut-ph-adjuvante.webp',
            260, 'Fertilizantes', 'TEST-RF-CALCARIO', FALSE, FALSE, TRUE
        WHERE NOT EXISTS (
            SELECT 1 FROM products WHERE seller_id = v_seller_id AND sku = 'TEST-RF-CALCARIO'
        );

        RAISE NOTICE '[seed] Raiz Forte Fertilizantes pronta (seller_id=%)', v_seller_id;
    END IF;

    RAISE NOTICE '[seed] Concluido: lojas e produtos sincronizados.';
END $$;

-- ============================================================
-- Fim do seed de lojas e produtos
-- ============================================================
