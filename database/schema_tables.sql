-- ============================================================
-- Galoppe Marketplace - Schema (somente estrutura)
-- ============================================================
-- Cria tabelas, tipos (ENUMs), indices, triggers e view publica.
-- NAO insere nenhum dado de seed.
--
-- Ordem recomendada de execucao:
--   1) database/schema_tables.sql      (este arquivo - estrutura)
--   2) database/seed_users.sql         (usuarios de teste)
--   3) database/seed_stores_products.sql (lojas e produtos)
--
-- Como rodar:
--   psql -U <usuario> -d <banco> -f database/schema_tables.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ------------------------------------------------------------
-- Limpeza (somente em dev - remove tudo antes de recriar)
-- ------------------------------------------------------------
DROP VIEW  IF EXISTS v_products_public CASCADE;
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
CREATE TYPE user_role      AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE order_status   AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
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
CREATE INDEX idx_products_seller    ON products(seller_id);
CREATE INDEX idx_products_active    ON products(active);
CREATE INDEX idx_products_category  ON products(category);
CREATE INDEX idx_products_featured  ON products(featured);
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
-- Trigger: atualizar coluna updated_at
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

-- ------------------------------------------------------------
-- View publica de produtos (com dados da loja)
-- ------------------------------------------------------------
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
