-- ============================================================
-- Galoppe Marketplace - Update de fotos reais dos produtos
-- ============================================================
-- Objetivo:
--   Remover imagens geradas/ilustradas do catalogo e apontar os
--   produtos seedados para fotos reais, em estilo marketplace.
--
-- Como rodar:
--   psql -U <usuario> -d <banco> -f database/update_product_images.sql
--
-- Observacoes:
--   1) O script e idempotente.
--   2) Os produtos sao atualizados pelo nome usado nos seeds.
--   3) As URLs abaixo sao fotos raster remotas, nao SVG/data URI.
-- ============================================================

BEGIN;

UPDATE products
SET image_url = CASE
    -- Eletronicos
    WHEN name = 'Smartphone Galaxy A54 128GB' THEN 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Notebook 15.6" Core i5 8GB SSD' THEN 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Fone Bluetooth Over-Ear ANC' THEN 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Smart TV 50" 4K UHD' THEN 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Smartwatch Fitness com GPS' THEN 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80'

    -- Moda
    WHEN name = 'Camiseta Básica Premium Algodão' THEN 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Calça Jeans Skinny Feminina' THEN 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Tênis Casual Branco Unissex' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Vestido Floral Midi' THEN 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Jaqueta Jeans Oversized' THEN 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80'

    -- Casa
    WHEN name = 'Sofá 3 Lugares Retrátil Cinza' THEN 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Luminária de Mesa LED Articulada' THEN 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Jogo de Cama Queen 200 Fios' THEN 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Mesa de Jantar 6 Lugares' THEN 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Vaso Decorativo Cerâmica' THEN 'https://images.unsplash.com/photo-1602874801007-aa53e6d9b246?auto=format&fit=crop&w=900&q=80'

    -- Beleza
    WHEN name = 'Perfume Floral Importado 100ml' THEN 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Kit Skincare Anti-idade' THEN 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Paleta de Sombras 24 Cores' THEN 'https://images.unsplash.com/photo-1583241800698-9c2e0044f5cb?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Secador Profissional 2000W' THEN 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Batom Líquido Matte Kit 5un' THEN 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=900&q=80'

    -- Esportes
    WHEN name = 'Tênis Running Profissional' THEN 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Halteres Ajustáveis 24kg' THEN 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Bicicleta Aro 29 21 Marchas' THEN 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Whey Protein 900g Chocolate' THEN 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Esteira Elétrica Dobrável' THEN 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=900&q=80'

    -- Pet
    WHEN name = 'Ração Premium Cães Adultos 15kg' THEN 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Caminha Pet Tamanho M' THEN 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Brinquedo Mordedor Dental' THEN 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Areia Higiênica Gatos 12kg' THEN 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Coleira com Identificação' THEN 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=900&q=80'

    -- Livros
    WHEN name = 'O Hobbit - J.R.R. Tolkien' THEN 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Box Trilogia Senhor dos Anéis' THEN 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Sapiens - Yuval Noah Harari' THEN 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Mangá One Piece Vol. 1' THEN 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Atomic Habits - James Clear' THEN 'https://images.unsplash.com/photo-1589998059171-988d887df646?auto=format&fit=crop&w=900&q=80'

    -- Brinquedos
    WHEN name = 'LEGO Classic 484 peças' THEN 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Boneca Articulada Premium' THEN 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Carrinho Hot Wheels 10 unid' THEN 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Jogo de Tabuleiro Estratégia' THEN 'https://images.unsplash.com/photo-1585504198199-20277593b94f?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Pelúcia Urso Gigante 80cm' THEN 'https://images.unsplash.com/photo-1582457601528-849c4063d70e?auto=format&fit=crop&w=900&q=80'

    -- Alimentos
    WHEN name = 'Cesta Gourmet Premium' THEN 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Café Especial Torrado 500g' THEN 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Azeite Extra Virgem 500ml' THEN 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Kit Chocolates Importados' THEN 'https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Mel Orgânico Silvestre 1kg' THEN 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80'

    -- Automotivo
    WHEN name = 'Óleo Motor 5W30 Sintético 1L' THEN 'https://images.unsplash.com/photo-1605618826115-fb9ee0e0fbc8?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Bateria Automotiva 60Ah' THEN 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Kit Limpeza Automotiva' THEN 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Pneu Aro 15 195/65' THEN 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=900&q=80'
    WHEN name = 'Central Multimídia 9" Android' THEN 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=900&q=80'

    ELSE image_url
END
WHERE name IN (
    'Smartphone Galaxy A54 128GB',
    'Notebook 15.6" Core i5 8GB SSD',
    'Fone Bluetooth Over-Ear ANC',
    'Smart TV 50" 4K UHD',
    'Smartwatch Fitness com GPS',
    'Camiseta Básica Premium Algodão',
    'Calça Jeans Skinny Feminina',
    'Tênis Casual Branco Unissex',
    'Vestido Floral Midi',
    'Jaqueta Jeans Oversized',
    'Sofá 3 Lugares Retrátil Cinza',
    'Luminária de Mesa LED Articulada',
    'Jogo de Cama Queen 200 Fios',
    'Mesa de Jantar 6 Lugares',
    'Vaso Decorativo Cerâmica',
    'Perfume Floral Importado 100ml',
    'Kit Skincare Anti-idade',
    'Paleta de Sombras 24 Cores',
    'Secador Profissional 2000W',
    'Batom Líquido Matte Kit 5un',
    'Tênis Running Profissional',
    'Halteres Ajustáveis 24kg',
    'Bicicleta Aro 29 21 Marchas',
    'Whey Protein 900g Chocolate',
    'Esteira Elétrica Dobrável',
    'Ração Premium Cães Adultos 15kg',
    'Caminha Pet Tamanho M',
    'Brinquedo Mordedor Dental',
    'Areia Higiênica Gatos 12kg',
    'Coleira com Identificação',
    'O Hobbit - J.R.R. Tolkien',
    'Box Trilogia Senhor dos Anéis',
    'Sapiens - Yuval Noah Harari',
    'Mangá One Piece Vol. 1',
    'Atomic Habits - James Clear',
    'LEGO Classic 484 peças',
    'Boneca Articulada Premium',
    'Carrinho Hot Wheels 10 unid',
    'Jogo de Tabuleiro Estratégia',
    'Pelúcia Urso Gigante 80cm',
    'Cesta Gourmet Premium',
    'Café Especial Torrado 500g',
    'Azeite Extra Virgem 500ml',
    'Kit Chocolates Importados',
    'Mel Orgânico Silvestre 1kg',
    'Óleo Motor 5W30 Sintético 1L',
    'Bateria Automotiva 60Ah',
    'Kit Limpeza Automotiva',
    'Pneu Aro 15 195/65',
    'Central Multimídia 9" Android'
);

COMMIT;

SELECT name, image_url
FROM products
WHERE image_url LIKE 'https://images.unsplash.com/%'
ORDER BY id;

-- ============================================================
-- Fim do update
-- ============================================================
