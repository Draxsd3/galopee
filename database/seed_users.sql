-- ============================================================
-- Galoppe Marketplace - Seed de Usuarios
-- ============================================================
-- Cria/atualiza usuarios de teste usados pelos seeds de lojas
-- e produtos.
--
-- Senha padrao de todos os usuarios: senha123
--
-- Ordem recomendada:
--   1) database/schema_tables.sql
--   2) database/seed_users.sql
--   3) database/seed_stores_products.sql
-- ============================================================

INSERT INTO users (name, email, password_hash, role, phone, document, active) VALUES
    ('Admin Galoppe', 'admin@galoppe.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'admin', '(11) 99999-0000', NULL, TRUE),
    ('Joao Silva', 'joao@email.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'buyer', '(11) 98888-1111', '111.222.333-44', TRUE),
    ('Maria Oliveira', 'maria@email.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'buyer', '(11) 98888-2222', '222.333.444-55', TRUE),
    ('Carlos Mendes', 'carlos@email.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'buyer', '(62) 98888-3333', '333.444.555-66', TRUE),
    ('Campo Norte Insumos', 'campo.norte@teste.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(65) 98800-1001', '20.100.100/0001-01', TRUE),
    ('Terra Viva Sementes', 'terra.viva@teste.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(62) 98800-1002', '20.100.100/0001-02', TRUE),
    ('Agropecuaria Horizonte', 'horizonte@teste.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(34) 98800-1003', '20.100.100/0001-03', TRUE),
    ('Pivo Certo Irrigacao', 'pivo.certo@teste.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(43) 98800-1004', '20.100.100/0001-04', TRUE),
    ('Raiz Forte Fertilizantes', 'raiz.forte@teste.com', '$2b$10$1aK/fAM1FcoYKao7vMmsiervn9DtXZqr/BlkCk/3X4t8hQmLkdVfy', 'seller', '(11) 98800-1005', '20.100.100/0001-05', TRUE)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    document = EXCLUDED.document,
    active = TRUE;

INSERT INTO carts (user_id)
SELECT id
FROM users
WHERE role = 'buyer'
ON CONFLICT (user_id) DO NOTHING;
