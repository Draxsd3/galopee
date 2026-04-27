-- ============================================================
-- Galoppe Marketplace - Update de Imagens dos Produtos
-- ============================================================
-- Objetivo:
-- Corrigir imagens incoerentes dos produtos seedados, em especial
-- os produtos de teste, usando referencias visuais mais compativeis
-- com agroquimicos, fertilizantes, irrigacao, sementes e racao.
--
-- Como rodar:
--   psql -U <usuario> -d <banco> -f database/update_product_images.sql
--
-- Observacoes:
-- 1) O script e idempotente.
-- 2) Os produtos de teste sao atualizados por SKU.
-- 3) As imagens passam a usar arquivos locais servidos pelo frontend.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- Produtos de teste (database/seed_stores_products.sql)
-- ------------------------------------------------------------
UPDATE products
SET image_url = CASE sku
    WHEN 'TEST-CN-GLIFOSATO-20L' THEN '/products/test/detonamato-herbicida.webp'
    WHEN 'TEST-CN-SEMENTE-SOJA' THEN '/products/test/cab-fertilizante.webp'
    WHEN 'TEST-TV-MILHO-HIBRIDO' THEN '/products/test/cab-fertilizante.webp'
    WHEN 'TEST-TV-BRACHIARIA' THEN '/products/test/grao-verde-formicida.webp'
    WHEN 'TEST-AH-RACAO-BOVINA' THEN '/products/test/detonamato-herbicida.webp'
    WHEN 'TEST-AH-SAL-MINERAL' THEN '/products/test/redut-ph-adjuvante.webp'
    WHEN 'TEST-PC-GOTEJAMENTO-100M' THEN '/products/test/redut-ph-adjuvante.webp'
    WHEN 'TEST-PC-ASPERSOR' THEN '/products/test/akb-herbicida.webp'
    WHEN 'TEST-RF-NPK' THEN '/products/test/cab-fertilizante.webp'
    WHEN 'TEST-RF-CALCARIO' THEN '/products/test/redut-ph-adjuvante.webp'
    ELSE image_url
END
WHERE sku IN (
    'TEST-CN-GLIFOSATO-20L',
    'TEST-CN-SEMENTE-SOJA',
    'TEST-TV-MILHO-HIBRIDO',
    'TEST-TV-BRACHIARIA',
    'TEST-AH-RACAO-BOVINA',
    'TEST-AH-SAL-MINERAL',
    'TEST-PC-GOTEJAMENTO-100M',
    'TEST-PC-ASPERSOR',
    'TEST-RF-NPK',
    'TEST-RF-CALCARIO'
);

COMMIT;

-- ============================================================
-- Fim do update
-- ============================================================
