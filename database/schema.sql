-- ============================================================
-- Galoppe Marketplace - PostgreSQL Schema
-- ============================================================
-- Marketplace genérico (multimercado): 10 categorias diversas,
-- uma loja em cada categoria com produtos representativos.
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
-- Vendedores (role seller) - 10 lojas, uma por categoria
('TechZone Eletrônicos','contato@techzone.com.br',       '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 97777-3333', '11.111.111/0001-11'),
('Trend Modas',         'atendimento@trendmodas.com.br', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 97777-4444', '22.222.222/0001-22'),
('Casa Bonita Decor',   'vendas@casabonitadecor.com.br', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(21) 97777-5555', '33.333.333/0001-33'),
('Glow Beauty',         'sac@glowbeauty.com.br',         '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(31) 97777-6666', '44.444.444/0001-44'),
('Sport Power',         'contato@sportpower.com.br',     '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(41) 97777-7777', '55.555.555/0001-55'),
('Mundo Pet',           'atendimento@mundopet.com.br',   '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 97777-8888', '66.666.666/0001-66'),
('Livraria Páginas',    'contato@livrariapaginas.com.br','$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(51) 97777-9999', '77.777.777/0001-77'),
('Brinque Mais',        'vendas@brinquemais.com.br',     '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(43) 97776-1111', '88.888.888/0001-88'),
('Sabor & Cia',         'contato@saborecia.com.br',      '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(81) 97776-2222', '99.999.999/0001-99'),
('AutoParts Pro',       'comercial@autopartspro.com.br', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(31) 97776-3333', '10.101.010/0001-10');

-- Lojas (sellers)
INSERT INTO sellers (user_id, store_name, store_slug, description, logo_url, banner_url, city, state, verified, rating) VALUES
(5,  'TechZone Eletrônicos','techzone-eletronicos','Eletrônicos, smartphones, notebooks e gadgets das melhores marcas com garantia oficial e entrega rápida.',                            'https://ui-avatars.com/api/?name=TechZone&background=4338ca&color=fff&size=200',     'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200', 'São Paulo',     'SP', TRUE,  4.85),
(6,  'Trend Modas',         'trend-modas',         'Moda feminina, masculina e infantil. Roupas, calçados e acessórios das tendências da estação.',                                       'https://ui-avatars.com/api/?name=Trend+Modas&background=db2777&color=fff&size=200',  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200', 'São Paulo',     'SP', TRUE,  4.72),
(7,  'Casa Bonita Decor',   'casa-bonita-decor',   'Tudo para sua casa: móveis, decoração, organização, utilidades domésticas e iluminação.',                                              'https://ui-avatars.com/api/?name=Casa+Bonita&background=0d9488&color=fff&size=200', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', 'Rio de Janeiro', 'RJ', TRUE,  4.68),
(8,  'Glow Beauty',         'glow-beauty',         'Cosméticos, perfumes, maquiagem, skincare e cuidados pessoais. Marcas nacionais e importadas.',                                       'https://ui-avatars.com/api/?name=Glow+Beauty&background=e11d48&color=fff&size=200', 'https://images.unsplash.com/photo-1522335789203-aaa312bb1c43?w=1200', 'Belo Horizonte','MG', TRUE,  4.90),
(9,  'Sport Power',         'sport-power',         'Artigos esportivos, fitness, suplementação, roupas e calçados para todos os esportes.',                                                 'https://ui-avatars.com/api/?name=Sport+Power&background=ea580c&color=fff&size=200', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200', 'Curitiba',      'PR', TRUE,  4.65),
(10, 'Mundo Pet',           'mundo-pet',           'Pet shop completo: ração, brinquedos, acessórios, banho e tosa, casinhas e cuidados para cães e gatos.',                              'https://ui-avatars.com/api/?name=Mundo+Pet&background=2563eb&color=fff&size=200',   'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200', 'São Paulo',     'SP', TRUE,  4.78),
(11, 'Livraria Páginas',    'livraria-paginas',    'Livros nacionais e importados, mangás, infantis, didáticos e literatura. Frete grátis acima de R$99.',                                'https://ui-avatars.com/api/?name=Paginas&background=78350f&color=fff&size=200',     'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200', 'Porto Alegre',  'RS', TRUE,  4.88),
(12, 'Brinque Mais',        'brinque-mais',        'Brinquedos educativos, jogos de tabuleiro, bonecas, carrinhos e acessórios para todas as idades.',                                     'https://ui-avatars.com/api/?name=Brinque+Mais&background=d97706&color=fff&size=200','https://images.unsplash.com/photo-1558877385-8c1f8b9c2d9d?w=1200', 'Londrina',      'PR', TRUE,  4.55),
(13, 'Sabor & Cia',         'sabor-e-cia',         'Mercearia online: alimentos especiais, bebidas, cestas gourmet, doces e produtos saudáveis.',                                          'https://ui-avatars.com/api/?name=Sabor+Cia&background=059669&color=fff&size=200',   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200', 'Recife',        'PE', TRUE,  4.70),
(14, 'AutoParts Pro',       'autoparts-pro',       'Peças automotivas, acessórios, óleos lubrificantes e itens para som e estética veicular.',                                              'https://ui-avatars.com/api/?name=AutoParts&background=475569&color=fff&size=200',  'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=1200', 'Belo Horizonte','MG', FALSE, 4.45);

-- ============================================================
-- Produtos (~42 produtos distribuídos)
-- ============================================================

-- Seller 1: TechZone Eletrônicos
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(1, 'Smartphone Galaxy A54 128GB',     'Smartphone Android com tela 6.4", câmera tripla 50MP, 8GB RAM e 128GB de armazenamento.',                  1899.00, 2299.00, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600', 35, 'Eletrônicos', TRUE, TRUE),
(1, 'Notebook 15.6" Core i5 8GB SSD',  'Notebook Intel Core i5 11ª geração, 8GB RAM, SSD 512GB e tela full HD 15.6".',                              3299.00, 3899.00, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600', 18, 'Eletrônicos', TRUE, TRUE),
(1, 'Fone Bluetooth Over-Ear ANC',     'Fone de ouvido sem fio com cancelamento de ruído ativo, bateria de 30h e Bluetooth 5.3.',                  649.00,  799.00,  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 80, 'Eletrônicos', TRUE, FALSE),
(1, 'Smart TV 50" 4K UHD',             'Smart TV LED 50 polegadas resolução 4K, HDR, sistema operacional próprio e Wi-Fi integrado.',              2499.00, 2899.00, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600', 22, 'Eletrônicos', FALSE,FALSE),
(1, 'Smartwatch Fitness com GPS',      'Relógio inteligente com monitor cardíaco, GPS integrado, à prova d''água e bateria de 14 dias.',           499.00,  599.00,  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600', 60, 'Eletrônicos', TRUE, FALSE);

-- Seller 2: Trend Modas
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(2, 'Camiseta Básica Premium Algodão', 'Camiseta unissex 100% algodão pima, gola redonda, modelagem regular. Tamanhos P ao GG.',                  79.90,   99.90,   'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 200, 'Moda', TRUE,  TRUE),
(2, 'Calça Jeans Skinny Feminina',     'Calça jeans skinny cintura alta, lavagem escura, com elastano para caimento perfeito.',                    159.90,  199.90,  'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600', 120, 'Moda', TRUE,  FALSE),
(2, 'Tênis Casual Branco Unissex',     'Tênis casual em couro sintético, solado emborrachado e palmilha confortável.',                            249.00,  299.00,  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 90,  'Moda', FALSE, TRUE),
(2, 'Vestido Floral Midi',             'Vestido midi estampa floral, alças finas, tecido fluido e leve para o dia a dia.',                         189.90,  NULL,    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', 75,  'Moda', TRUE,  FALSE),
(2, 'Jaqueta Jeans Oversized',         'Jaqueta jeans modelagem ampla, lavagem média, ideal para compor looks descontraídos.',                    219.00,  259.00,  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600', 65,  'Moda', FALSE, FALSE);

-- Seller 3: Casa Bonita Decor
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(3, 'Sofá 3 Lugares Retrátil Cinza',   'Sofá retrátil e reclinável 3 lugares, tecido suede, espuma D33 e estrutura em madeira maciça.',         2299.00, 2799.00, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600', 12,  'Casa', FALSE, TRUE),
(3, 'Luminária de Mesa LED Articulada','Luminária com braço articulado, LED ajustável (3 temperaturas) e porta USB.',                            189.00,  229.00,  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600', 80,  'Casa', TRUE,  FALSE),
(3, 'Jogo de Cama Queen 200 Fios',     'Jogo de cama queen size 4 peças, percal 200 fios, 100% algodão. Várias estampas.',                       249.90,  299.90,  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600', 100, 'Casa', TRUE,  TRUE),
(3, 'Mesa de Jantar 6 Lugares',        'Mesa de jantar em MDF revestido, tampo de vidro temperado 6mm, pés metálicos.',                           1599.00, NULL,    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=600', 18,  'Casa', FALSE, FALSE),
(3, 'Vaso Decorativo Cerâmica',        'Vaso decorativo grande em cerâmica artesanal, ideal para sala e entrada.',                                149.00,  179.00,  'https://images.unsplash.com/photo-1602874801007-aa53e6d9b246?w=600', 60,  'Casa', TRUE,  FALSE);

-- Seller 4: Glow Beauty
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(4, 'Perfume Floral Importado 100ml',  'Perfume feminino notas florais e amadeiradas, eau de parfum, fixação de até 12h.',                       349.00,  429.00,  'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600', 50,  'Beleza', TRUE,  TRUE),
(4, 'Kit Skincare Anti-idade',         'Kit completo: limpador facial, sérum vitamina C, hidratante e protetor solar FPS50.',                    289.90,  349.90,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600', 80,  'Beleza', TRUE,  TRUE),
(4, 'Paleta de Sombras 24 Cores',      'Paleta de maquiagem profissional com 24 cores opacas e cintilantes, alta pigmentação.',                  159.00,  189.00,  'https://images.unsplash.com/photo-1583241800698-9c2e0044f5cb?w=600', 120, 'Beleza', TRUE,  FALSE),
(4, 'Secador Profissional 2000W',      'Secador de cabelo com íons negativos, 2000W, 3 temperaturas e 2 velocidades.',                            199.00,  259.00,  'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600', 45,  'Beleza', FALSE, FALSE),
(4, 'Batom Líquido Matte Kit 5un',     'Kit com 5 batons líquidos efeito matte, longa duração, fórmula vegana.',                                  129.90,  NULL,    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600', 200, 'Beleza', TRUE,  FALSE);

-- Seller 5: Sport Power
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(5, 'Tênis Running Profissional',      'Tênis para corrida com amortecimento em gel, cabedal respirável e solado durável.',                       499.00,  599.00,  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 70,  'Esportes', TRUE, TRUE),
(5, 'Halteres Ajustáveis 24kg',        'Par de halteres ajustáveis até 24kg cada, com sistema de troca rápida de discos.',                        899.00,  1099.00, 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600', 25,  'Esportes', FALSE,TRUE),
(5, 'Bicicleta Aro 29 21 Marchas',     'Bicicleta MTB aro 29 com 21 marchas Shimano, freio a disco e suspensão dianteira.',                       1799.00, 2099.00, 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600', 14,  'Esportes', FALSE,FALSE),
(5, 'Whey Protein 900g Chocolate',     'Whey protein concentrado, sabor chocolate, 24g de proteína por dose.',                                    189.90,  NULL,    'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600', 150, 'Esportes', TRUE, FALSE),
(5, 'Esteira Elétrica Dobrável',       'Esteira elétrica residencial dobrável, motor 2.5 HP, velocidade até 14km/h.',                              2299.00, 2699.00, 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=600', 8,   'Esportes', FALSE,FALSE);

-- Seller 6: Mundo Pet
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(6, 'Ração Premium Cães Adultos 15kg', 'Ração super premium para cães adultos de raças médias e grandes, sabor frango.',                          229.00,  259.00,  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', 90,  'Pet', TRUE,  TRUE),
(6, 'Caminha Pet Tamanho M',           'Cama acolchoada para pets de porte médio, tecido lavável e antiderrapante.',                              159.00,  199.00,  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600', 60,  'Pet', TRUE,  FALSE),
(6, 'Brinquedo Mordedor Dental',       'Brinquedo de borracha resistente para cães, ajuda na higiene bucal e entretenimento.',                    49.90,   NULL,    'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600', 200, 'Pet', FALSE, FALSE),
(6, 'Areia Higiênica Gatos 12kg',      'Areia sanitária para gatos, granulada, alta absorção e controle de odor por 30 dias.',                    79.90,   89.90,   'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600', 130, 'Pet', TRUE,  TRUE),
(6, 'Coleira com Identificação',       'Coleira ajustável em nylon resistente, com plaquinha personalizada inclusa.',                              59.00,   NULL,    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600', 110, 'Pet', FALSE, FALSE);

-- Seller 7: Livraria Páginas
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(7, 'O Hobbit - J.R.R. Tolkien',       'Edição capa dura ilustrada da clássica obra de fantasia. Tradução revisada.',                              79.90,   99.90,   'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600', 60,  'Livros', TRUE,  TRUE),
(7, 'Box Trilogia Senhor dos Anéis',   'Box com os 3 volumes da saga, capa dura e papel pólen. Edição comemorativa.',                              249.00,  329.00,  'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=600', 30,  'Livros', TRUE,  TRUE),
(7, 'Sapiens - Yuval Noah Harari',     'Uma breve história da humanidade. Bestseller traduzido em mais de 60 idiomas.',                            54.90,   69.90,   'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600', 80,  'Livros', TRUE,  FALSE),
(7, 'Mangá One Piece Vol. 1',          'Primeiro volume da saga mais longa dos mangás, 200+ páginas em alta qualidade.',                          29.90,   NULL,    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600', 150, 'Livros', FALSE, FALSE),
(7, 'Atomic Habits - James Clear',     'Livro de produtividade pessoal com método para construir bons hábitos.',                                   49.90,   59.90,   'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600', 100, 'Livros', TRUE,  FALSE);

-- Seller 8: Brinque Mais
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(8, 'LEGO Classic 484 peças',          'Caixa de LEGO clássico com 484 peças coloridas, estimula a criatividade. 4+ anos.',                       249.00,  299.00,  'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600', 50,  'Brinquedos', TRUE,  TRUE),
(8, 'Boneca Articulada Premium',       'Boneca de 30cm com cabelo escovável, articulações móveis e roupas inclusas.',                              129.00,  159.00,  'https://images.unsplash.com/photo-1558877385-8c1f8b9c2d9d?w=600', 80,  'Brinquedos', TRUE,  FALSE),
(8, 'Carrinho Hot Wheels 10 unid',     'Pacote com 10 carrinhos colecionáveis, escala 1:64. Modelos sortidos.',                                    79.90,   99.90,   'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600', 200, 'Brinquedos', FALSE, TRUE),
(8, 'Jogo de Tabuleiro Estratégia',    'Jogo de estratégia familiar para 2 a 6 jogadores, partidas de 60 minutos.',                                149.90,  179.90,  'https://images.unsplash.com/photo-1585504198199-20277593b94f?w=600', 70,  'Brinquedos', FALSE, FALSE),
(8, 'Pelúcia Urso Gigante 80cm',       'Urso de pelúcia tamanho gigante, ultra macio, recheio antialérgico.',                                      189.00,  219.00,  'https://images.unsplash.com/photo-1582457601528-849c4063d70e?w=600', 35,  'Brinquedos', TRUE,  FALSE);

-- Seller 9: Sabor & Cia
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(9, 'Cesta Gourmet Premium',           'Cesta com 12 itens gourmet selecionados: vinho, queijos, geleias e biscoitos finos.',                     349.00,  429.00,  'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=600', 25,  'Alimentos', FALSE, TRUE),
(9, 'Café Especial Torrado 500g',      'Café 100% arábica, torra média, notas de chocolate e caramelo. Embalagem 500g.',                          39.90,   49.90,   'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600', 150, 'Alimentos', TRUE,  TRUE),
(9, 'Azeite Extra Virgem 500ml',       'Azeite de oliva extra virgem importado, baixa acidez, garrafa de 500ml.',                                 49.90,   NULL,    'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600', 180, 'Alimentos', TRUE,  FALSE),
(9, 'Kit Chocolates Importados',       'Kit com 8 chocolates premium importados, várias intensidades de cacau.',                                  119.00,  149.00,  'https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=600', 80,  'Alimentos', FALSE, FALSE),
(9, 'Mel Orgânico Silvestre 1kg',      'Mel 100% puro orgânico silvestre, embalagem de 1kg, sem aditivos.',                                       69.00,   NULL,    'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600', 90,  'Alimentos', TRUE,  FALSE);

-- Seller 10: AutoParts Pro
INSERT INTO products (seller_id, name, description, price, compare_price, image_url, stock, category, free_shipping, featured) VALUES
(10, 'Óleo Motor 5W30 Sintético 1L',   'Óleo lubrificante sintético 5W30, indicado para motores modernos a gasolina e flex.',                     59.90,   NULL,    'https://images.unsplash.com/photo-1605618826115-fb9ee0e0fbc8?w=600', 200, 'Automotivo', FALSE, FALSE),
(10, 'Bateria Automotiva 60Ah',        'Bateria 60Ah selada, 12 meses de garantia, indicada para veículos populares.',                            459.00,  529.00,  'https://images.unsplash.com/photo-1605618826115-fb9ee0e0fbc8?w=600', 35,  'Automotivo', FALSE, TRUE),
(10, 'Kit Limpeza Automotiva',         'Kit completo: shampoo, cera, pretinho, limpa vidros e flanelas. 5 itens.',                                119.90,  149.90,  'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600', 90,  'Automotivo', TRUE,  TRUE),
(10, 'Pneu Aro 15 195/65',             'Pneu aro 15 medida 195/65 R15, indicado para veículos médios. 5 anos de garantia.',                       349.00,  399.00,  'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600', 60,  'Automotivo', FALSE, FALSE),
(10, 'Central Multimídia 9" Android',  'Central multimídia universal tela 9", Android 11, GPS, Bluetooth e câmera de ré.',                         899.00,  1099.00, 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600', 18,  'Automotivo', TRUE,  FALSE);

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
