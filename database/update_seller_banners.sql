-- ============================================================
-- Atualiza banners (banner_url) das 10 lojas com URLs de marketplace
-- ============================================================
-- Garante que TODAS as lojas tenham uma imagem de capa apropriada
-- a categoria. Pode ser executado mais de uma vez sem efeitos
-- colaterais (UPDATE direto por slug).
--
-- Como rodar:
--   Supabase SQL Editor -> New query -> cola e Run
-- ============================================================

BEGIN;

UPDATE sellers SET banner_url = CASE store_slug
    -- Eletrônicos: setup gamer / mesa de trabalho com gadgets
    WHEN 'techzone-eletronicos'
        THEN 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=1400&q=80'

    -- Moda: arara de roupas em loja
    WHEN 'trend-modas'
        THEN 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1400&q=80'

    -- Casa & Decor: sala de estar moderna
    WHEN 'casa-bonita-decor'
        THEN 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=80'

    -- Beleza: cosméticos / skincare
    WHEN 'glow-beauty'
        THEN 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1400&q=80'

    -- Esportes: corredor / atleta
    WHEN 'sport-power'
        THEN 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=80'

    -- Pet: cachorro feliz
    WHEN 'mundo-pet'
        THEN 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=1400&q=80'

    -- Livros: estante de livraria
    WHEN 'livraria-paginas'
        THEN 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1400&q=80'

    -- Brinquedos: brinquedos coloridos espalhados
    WHEN 'brinque-mais'
        THEN 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1400&q=80'

    -- Alimentos: mercearia gourmet
    WHEN 'sabor-e-cia'
        THEN 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80'

    -- Automotivo: carro / oficina
    WHEN 'autoparts-pro'
        THEN 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1400&q=80'

    ELSE banner_url
END,
updated_at = NOW()
WHERE store_slug IN (
    'techzone-eletronicos',
    'trend-modas',
    'casa-bonita-decor',
    'glow-beauty',
    'sport-power',
    'mundo-pet',
    'livraria-paginas',
    'brinque-mais',
    'sabor-e-cia',
    'autoparts-pro'
);

COMMIT;

-- ============================================================
-- Confere
-- ============================================================
SELECT store_slug, store_name, banner_url FROM sellers ORDER BY id;
