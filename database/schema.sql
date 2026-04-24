-- ============================================================
-- Galoppe Marketplace - PostgreSQL Schema
-- ============================================================
-- Script de criação completa das tabelas, relacionamentos,
-- índices, triggers e seed data para o marketplace.
-- Estilo TodoAgro: múltiplas empresas, catálogo amplo.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- Limpeza (somente em dev)
-- ------------------------------------------------------------
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS sellers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- ------------------------------------------------------------
-- Tipos (ENUMs)
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'approved', 'refused', 'refunded');

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    email           VARCHAR(160) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            user_role NOT NULL DEFAULT 'buyer',
    phone           VARCHAR(30),
    document        VARCHAR(30),
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ------------------------------------------------------------
-- sellers
-- ------------------------------------------------------------
CREATE TABLE sellers (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    store_name      VARCHAR(150) NOT NULL,
    store_slug      VARCHAR(160) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        TEXT,
    banner_url      TEXT,
    city            VARCHAR(80),
    state           VARCHAR(2),
    rating          NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    verified        BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sellers_slug ON sellers(store_slug);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    seller_id       INTEGER NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    compare_price   NUMERIC(12,2),
    image_url       TEXT,
    stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category        VARCHAR(80),
    sku             VARCHAR(80),
    free_shipping   BOOLEAN NOT NULL DEFAULT FALSE,
    featured        BOOLEAN NOT NULL DEFAULT FALSE,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_seller   ON products(seller_id);
CREATE INDEX idx_products_active   ON products(active);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- ------------------------------------------------------------
-- carts / cart_items
-- ------------------------------------------------------------
CREATE TABLE carts (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
    id              SERIAL PRIMARY KEY,
    cart_id         INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, product_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ------------------------------------------------------------
-- orders / order_items
-- ------------------------------------------------------------
CREATE TABLE orders (
    id                  SERIAL PRIMARY KEY,
    buyer_id            INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id           INTEGER NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    total_amount        NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status              order_status NOT NULL DEFAULT 'pending',
    payment_status      payment_status NOT NULL DEFAULT 'pending',
    payment_provider    VARCHAR(50),
    payment_reference   VARCHAR(200),
    shipping_address    JSONB,
    tracking_code       VARCHAR(100),
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_orders_buyer   ON orders(buyer_id);
CREATE INDEX idx_orders_seller  ON orders(seller_id);
CREATE INDEX idx_orders_status  ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

CREATE TABLE order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name    VARCHAR(200) NOT NULL,
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal        NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------
-- Trigger: updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated      BEFORE UPDATE ON users      FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
CREATE TRIGGER trg_sellers_updated    BEFORE UPDATE ON sellers    FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
CREATE TRIGGER trg_products_updated   BEFORE UPDATE ON products   FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
CREATE TRIGGER trg_carts_updated      BEFORE UPDATE ON carts      FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
CREATE TRIGGER trg_cart_items_updated BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();
CREATE TRIGGER trg_orders_updated     BEFORE UPDATE ON orders     FOR EACH ROW EXECUTE PROCEDURE touch_updated_at();

-- ============================================================
-- SEED DATA
-- Senha padrão de todos os seeds: "senha123"
-- ============================================================

-- Usuários (admins, compradores, vendedores)
INSERT INTO users (name, email, password_hash, role, phone, document) VALUES
('Admin Galoppe',       'admin@galoppe.com',       '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'admin',  '(11) 99999-0000', NULL),
('João Silva',          'joao@email.com',          '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'buyer',  '(11) 98888-1111', '111.222.333-44'),
('Maria Oliveira',      'maria@email.com',         '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'buyer',  '(11) 98888-2222', '222.333.444-55'),
('Carlos Mendes',       'carlos@email.com',        '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'buyer',  '(62) 98888-3333', '333.444.555-66'),
-- Vendedores (role seller) - 10 empresas
('Fazenda do Vale',     'contato@fazendadovale.com',     '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 97777-3333', '11.111.111/0001-11'),
('AgroLoja',            'contato@agroloja.com',          '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 97777-4444', '22.222.222/0001-22'),
('Sementes Brasil',     'vendas@sementesbrasil.com',     '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(62) 97777-5555', '33.333.333/0001-33'),
('Máquinas do Campo',   'comercial@maqcampo.com',        '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(34) 97777-6666', '44.444.444/0001-44'),
('Defensivos Premium',  'vendas@defensivospremium.com',  '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(44) 97777-7777', '55.555.555/0001-55'),
('Ração Forte',         'contato@racaoforte.com',        '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 97777-8888', '66.666.666/0001-66'),
('Veterinária Rural',   'contato@vetrural.com',          '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(62) 97777-9999', '77.777.777/0001-77'),
('Irrigação Total',     'vendas@irrigacaototal.com',     '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(43) 97776-1111', '88.888.888/0001-88'),
('Adubos & Cia',        'contato@adubosecia.com',        '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(65) 97776-2222', '99.999.999/0001-99'),
('Ferramentas Agro',    'contato@ferramentasagro.com',   '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(31) 97776-3333', '10.101.010/0001-10');

-- Lojas (sellers)
INSERT INTO sellers (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating) VALUES
(5,  'Fazenda do Vale',    'fazenda-do-vale',    'Produtor rural desde 1980. Grãos, ração e insumos direto do produtor para o produtor.',                     'https://ui-avatars.com/api/?name=Fazenda+Vale&background=16a34a&color=fff&size=200', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200', 'Ribeirão Preto',  'SP', TRUE,  4.80),
(6,  'AgroLoja',           'agroloja',           'Loja completa para o agronegócio. Equipamentos, ferramentas e insumos com entrega para todo o Brasil.',      'https://ui-avatars.com/api/?name=Agro+Loja&background=15803d&color=fff&size=200',    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1200', 'Uberlândia',      'MG', TRUE,  4.70),
(7,  'Sementes Brasil',    'sementes-brasil',    'Sementes certificadas de alta produtividade. Soja, milho, algodão e pastagens.',                              'https://ui-avatars.com/api/?name=Sementes+Brasil&background=ea580c&color=fff&size=200','https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200', 'Goiânia',         'GO', TRUE,  4.90),
(8,  'Máquinas do Campo',  'maquinas-do-campo',  'Tratores, colheitadeiras e implementos novos e usados com garantia de fábrica.',                              'https://ui-avatars.com/api/?name=Maquinas+Campo&background=b45309&color=fff&size=200', 'https://images.unsplash.com/photo-1591462391731-3b18adc94077?w=1200', 'Uberaba',         'MG', TRUE,  4.60),
(9,  'Defensivos Premium', 'defensivos-premium', 'Defensivos agrícolas registrados no MAPA. Consultoria técnica inclusa.',                                        'https://ui-avatars.com/api/?name=Defensivos+Premium&background=b91c1c&color=fff&size=200','https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200', 'Maringá',         'PR', TRUE,  4.75),
(10, 'Ração Forte',        'racao-forte',        'Ração de alta performance para bovinos, equinos, suínos e aves.',                                              'https://ui-avatars.com/api/?name=Racao+Forte&background=7c3aed&color=fff&size=200',   'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200', 'São Paulo',       'SP', TRUE,  4.55),
(11, 'Veterinária Rural',  'veterinaria-rural',  'Medicamentos veterinários, vacinas e suplementação animal.',                                                   'https://ui-avatars.com/api/?name=Vet+Rural&background=0891b2&color=fff&size=200',    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200', 'Anápolis',        'GO', TRUE,  4.85),
(12, 'Irrigação Total',    'irrigacao-total',    'Soluções completas em irrigação: pivôs, gotejamento e aspersão.',                                              'https://ui-avatars.com/api/?name=Irrigacao+Total&background=0284c7&color=fff&size=200','https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200', 'Londrina',        'PR', FALSE, 4.40),
(13, 'Adubos & Cia',       'adubos-cia',         'Fertilizantes, adubos orgânicos e corretivos de solo.',                                                         'https://ui-avatars.com/api/?name=Adubos+Cia&background=059669&color=fff&size=200',   'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=1200', 'Cuiabá',          'MT', TRUE,  4.65),
(14, 'Ferramentas Agro',   'ferramentas-agro',   'Ferramentas manuais e elétricas para o trabalho rural.',                                                        'https://ui-avatars.com/api/?name=Ferramentas+Agro&background=64748b&color=fff&size=200','https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200', 'Belo Horizonte',  'MG', FALSE, 4.30);

-- ============================================================
-- Produtos (catálogo amplo - ~42 produtos distribuídos)
-- ============================================================

-- Seller 1: Fazenda do Vale (grãos/ração/insumos)
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(1, 'Saco de Milho 50kg',          'Milho em grão selecionado para ração animal. Sacos de 50kg, safra atual.',                               129.90,  149.90, 'https://images.unsplash.com/photo-1601593768799-76d3ca1f3b82?w=600', 250, 'Grãos',   TRUE,  TRUE),
(1, 'Soja em Grão 60kg',           'Soja em grão, ideal para processamento e ração. Sacos de 60kg.',                                          210.00,  NULL,   'https://images.unsplash.com/photo-1580420876508-84a3b6b5be91?w=600', 180, 'Grãos',   TRUE,  FALSE),
(1, 'Adubo Orgânico 25kg',         'Adubo orgânico composto, rico em nutrientes. Ideal para hortas e pomares.',                                89.50,   NULL,   'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 120, 'Insumos', FALSE, FALSE),
(1, 'Feno de Tifton 20kg',         'Feno de Tifton 85 de alta qualidade. Fardo de 20kg.',                                                      79.90,   89.90,  'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?w=600', 90,  'Ração',   TRUE,  TRUE);

-- Seller 2: AgroLoja (ferramentas/equipamentos)
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(2, 'Pulverizador Costal 20L',     'Pulverizador manual para aplicação de defensivos. Reservatório de 20 litros.',                            249.90,  299.90, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600', 60, 'Equipamentos', TRUE,  TRUE),
(2, 'Kit Ferramentas Agro',        'Kit com enxada, foice, pá e ancinho em aço carbono.',                                                      189.00,  NULL,   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600', 80, 'Ferramentas',  FALSE, FALSE),
(2, 'Botina de Segurança',         'Botina de couro com biqueira de aço, certificada CA. Tamanhos 38 a 46.',                                  219.90,  249.90, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 150,'EPI',          TRUE,  FALSE),
(2, 'Cortador de Grama 1500W',     'Cortador de grama elétrico 1500W com coletor de 50L.',                                                     599.00,  799.00, 'https://images.unsplash.com/photo-1610878180933-1165c7e05b17?w=600', 25, 'Equipamentos', FALSE, TRUE);

-- Seller 3: Sementes Brasil
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(3, 'Semente de Soja 20kg',        'Sementes de soja certificadas, alta produtividade. Variedade BRS 8391.',                                   399.90,  459.90, 'https://images.unsplash.com/photo-1580420876508-84a3b6b5be91?w=600', 120, 'Sementes', TRUE, TRUE),
(3, 'Semente de Milho Híbrido 20kg','Milho híbrido alta performance, resistente a pragas.',                                                    520.00,  NULL,   'https://images.unsplash.com/photo-1601593768799-76d3ca1f3b82?w=600', 100, 'Sementes', TRUE, TRUE),
(3, 'Semente de Brachiaria 20kg',  'Semente de pastagem Brachiaria brizantha, alta germinação.',                                                289.90,  NULL,   'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=600',  85, 'Sementes', FALSE, FALSE),
(3, 'Semente de Algodão 15kg',     'Algodão variedade BRS 368, resistente ao bicudo.',                                                          349.00,  399.00, 'https://images.unsplash.com/photo-1561023367-50a6e2b4c4b7?w=600',     50, 'Sementes', FALSE, FALSE),
(3, 'Semente de Feijão Carioca 10kg','Feijão carioca selecionado, ciclo curto.',                                                                 149.90,  NULL,   'https://images.unsplash.com/photo-1599401492055-97a3ccb2c1a8?w=600',  75, 'Sementes', TRUE, FALSE);

-- Seller 4: Máquinas do Campo
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(4, 'Motosserra 62cc Profissional','Motosserra a gasolina 62cc, sabre de 20\", uso profissional.',                                            1890.00, 2190.00, 'https://images.unsplash.com/photo-1617170788617-7e9c17e7ea12?w=600', 15, 'Máquinas', FALSE, TRUE),
(4, 'Roçadeira 43cc',              'Roçadeira lateral a gasolina 43cc com arnês profissional.',                                               1290.00, 1490.00, 'https://images.unsplash.com/photo-1598512199776-e0e136c4356b?w=600', 20, 'Máquinas', FALSE, FALSE),
(4, 'Gerador a Diesel 5kVA',       'Gerador trifásico a diesel 5kVA com partida elétrica.',                                                   6490.00, NULL,    'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?w=600',  8, 'Máquinas', FALSE, TRUE),
(4, 'Microtrator 12CV',            'Microtrator a diesel 12CV com enxada rotativa inclusa.',                                                  9990.00, NULL,    'https://images.unsplash.com/photo-1591462391731-3b18adc94077?w=600',  5, 'Máquinas', FALSE, FALSE),
(4, 'Carreta Basculante 1000kg',   'Carreta agrícola basculante, capacidade 1000kg.',                                                         2890.00, 3290.00, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',  12,'Máquinas', FALSE, FALSE);

-- Seller 5: Defensivos Premium
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(5, 'Herbicida Glifosato 20L',     'Herbicida sistêmico não seletivo, ação total. Embalagem 20L.',                                            449.00,  499.00, 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600', 200, 'Defensivos', TRUE, TRUE),
(5, 'Fungicida Sistêmico 5L',      'Controle de ferrugem asiática e doenças foliares. 5 litros.',                                             689.00,  NULL,   'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 150, 'Defensivos', TRUE, FALSE),
(5, 'Inseticida Piretróide 1L',    'Controle de pragas em lavouras de grãos e hortaliças.',                                                  259.90,  299.90, 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=600', 240, 'Defensivos', FALSE, FALSE),
(5, 'Adjuvante Óleo Vegetal 20L',  'Óleo vegetal emulsionável para aplicação com defensivos.',                                                189.90,  NULL,   'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600',  90, 'Defensivos', TRUE, FALSE);

-- Seller 6: Ração Forte
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(6, 'Ração Bovina Premium 40kg',   'Ração de alta performance para bovinos de corte e leite.',                                                 210.00,  240.00, 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600', 120, 'Ração', TRUE, TRUE),
(6, 'Ração Equina 30kg',           'Ração completa para equinos adultos. 30kg.',                                                              179.00,  199.00, 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=600',  85, 'Ração', TRUE, FALSE),
(6, 'Ração Suínos Crescimento 25kg','Ração balanceada para suínos em crescimento.',                                                           139.90,  NULL,    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600', 100, 'Ração', FALSE, FALSE),
(6, 'Ração Aves Postura 25kg',     'Ração para galinhas poedeiras, rica em cálcio.',                                                          119.00,  NULL,    'https://images.unsplash.com/photo-1551199769-7e0b91d70d1c?w=600',   90, 'Ração', FALSE, TRUE),
(6, 'Sal Mineral Bovino 30kg',     'Suplemento mineral para gado de corte e leite.',                                                          159.00,  NULL,    'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600', 140, 'Ração', TRUE,  FALSE);

-- Seller 7: Veterinária Rural
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(7, 'Vermífugo Bovino 1L',         'Vermífugo de amplo espectro para bovinos. 1 litro trata 50 animais.',                                      289.00,  329.00, 'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 60, 'Veterinária', TRUE, TRUE),
(7, 'Vacina Aftosa 500ml',         'Vacina contra febre aftosa, aplicação obrigatória.',                                                     149.90,  NULL,   'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', 80, 'Veterinária', TRUE, FALSE),
(7, 'Antibiótico Injetável 250ml', 'Antibiótico de amplo espectro para uso veterinário.',                                                    229.00,  269.00, 'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 55, 'Veterinária', FALSE, FALSE),
(7, 'Kit Seringas Automáticas',    'Kit 3 seringas automáticas de 2ml, 5ml e 10ml.',                                                          349.00,  NULL,   'https://images.unsplash.com/photo-1632053002431-b66b7d30fe28?w=600', 40, 'Veterinária', TRUE, FALSE);

-- Seller 8: Irrigação Total
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(8, 'Kit Irrigação Gotejamento 100m','Kit completo para irrigação por gotejamento até 100m de linha.',                                         599.00,  699.00, 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600', 30, 'Irrigação', FALSE, TRUE),
(8, 'Aspersor Setorial 3/4\"',     'Aspersor setorial de 3/4 polegadas, alcance 12m.',                                                         49.90,   NULL,   'https://images.unsplash.com/photo-1508504311323-1d3c22a8f9b4?w=600', 200, 'Irrigação', TRUE,  FALSE),
(8, 'Bomba Submersa 1CV',          'Bomba submersa 1CV monofásica, vazão até 3000L/h.',                                                       1290.00, 1490.00, 'https://images.unsplash.com/photo-1626001554762-60da8d36e5db?w=600', 18, 'Irrigação', FALSE, FALSE),
(8, 'Mangueira Agrícola 100m',     'Mangueira flexível 1\" para irrigação, rolo de 100m.',                                                    389.00,  NULL,   'https://images.unsplash.com/photo-1508504311323-1d3c22a8f9b4?w=600',  45, 'Irrigação', TRUE,  FALSE);

-- Seller 9: Adubos & Cia
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(9, 'NPK 20-05-20 50kg',           'Fertilizante NPK balanceado para grãos e pastagens.',                                                      289.00,  329.00, 'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 300, 'Fertilizantes', TRUE, TRUE),
(9, 'Ureia 50kg',                  'Fertilizante nitrogenado de alta concentração.',                                                          199.00,  NULL,    'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 250, 'Fertilizantes', TRUE, FALSE),
(9, 'Calcário Dolomítico 30kg',    'Corretivo de solo, neutraliza acidez e fornece cálcio/magnésio.',                                         59.00,   NULL,    'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 400, 'Fertilizantes', FALSE, FALSE),
(9, 'Húmus de Minhoca 20kg',       'Adubo orgânico premium, 100% natural.',                                                                    89.90,   109.90,  'https://images.unsplash.com/photo-1628352081500-01a91a3d8eab?w=600', 150, 'Fertilizantes', TRUE, TRUE);

-- Seller 10: Ferramentas Agro
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(10, 'Enxada Larga 26cm',           'Enxada larga em aço carbono, cabo de madeira 1,50m.',                                                     79.90,   NULL,   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600', 180, 'Ferramentas', FALSE, FALSE),
(10, 'Foice Roçadeira',             'Foice em aço temperado para roçar mato alto.',                                                           59.00,   69.00,  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600', 120, 'Ferramentas', TRUE,  FALSE),
(10, 'Carrinho de Mão 65L',         'Carrinho de mão reforçado, caçamba de 65 litros.',                                                       179.00,  209.00, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',  80, 'Ferramentas', FALSE, TRUE),
(10, 'Tesoura de Poda Profissional','Tesoura de poda com lâminas em aço inox.',                                                               129.90,  NULL,   'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',  95, 'Ferramentas', TRUE,  FALSE);

-- Carrinhos dos compradores
INSERT INTO carts (user_id) VALUES (2), (3), (4);

-- ============================================================
-- View pública de produtos (com dados da loja)
-- ============================================================
CREATE OR REPLACE VIEW v_products_public AS
SELECT
    p.id, p.name, p.description, p.price, p.compare_price, p.image_url, p.stock,
    p.category, p.free_shipping, p.featured, p.active, p.created_at,
    s.id   AS seller_id, s.store_name, s.store_slug, s.city, s.state,
    s.verified AS seller_verified, s.rating AS seller_rating
FROM products p
JOIN sellers  s ON s.id = p.seller_id
WHERE p.active = TRUE;

-- ============================================================
-- Fim do schema
-- ============================================================
