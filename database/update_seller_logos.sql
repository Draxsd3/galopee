-- Atualiza logos das lojas para artes locais e consistentes.
-- Pode ser executado mais de uma vez sem gerar duplicidade.

BEGIN;

UPDATE sellers
SET
    logo_url = CASE
        WHEN store_slug = 'campo-norte-insumos' THEN '/stores/logos/campo-norte-insumos.svg'
        WHEN store_slug = 'terra-viva-sementes' THEN '/stores/logos/terra-viva-sementes.svg'
        WHEN store_slug = 'agropecuaria-horizonte' THEN '/stores/logos/agropecuaria-horizonte.svg'
        WHEN store_slug = 'pivo-certo-irrigacao' THEN '/stores/logos/pivo-certo-irrigacao.svg'
        WHEN store_slug = 'raiz-forte-fertilizantes' THEN '/stores/logos/raiz-forte-fertilizantes.svg'
        WHEN store_slug IN ('fazendoteste', 'fazendo-teste')
            OR LOWER(REGEXP_REPLACE(store_name, '[[:space:]]+', '', 'g')) = 'fazendoteste'
            THEN '/stores/logos/fazendo-teste.svg'
        WHEN logo_url IS NULL
            OR BTRIM(logo_url) = ''
            OR logo_url NOT LIKE '/stores/logos/%'
            THEN '/stores/logos/galopee-store.svg'
        ELSE logo_url
    END,
    updated_at = NOW();

COMMIT;
