import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import SellerCard from '../components/SellerCard';

/*
 * Catálogo de lojas. Lista todos os vendedores cadastrados com busca por nome
 * e filtros simples (estado e apenas verificadas). A filtragem é feita no
 * cliente — o endpoint /sellers não paginava quando esta tela foi feita.
 */
export default function Stores() {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const q = searchParams.get('q') || '';
    const state = searchParams.get('state') || '';
    const onlyVerified = searchParams.get('verified') === '1';
    const sort = searchParams.get('sort') || 'relevance';

    const [localQuery, setLocalQuery] = useState(q);

    // Debounce do input de busca
    useEffect(() => {
        const id = setTimeout(() => {
            if (localQuery !== q) setParam('q', localQuery);
        }, 250);
        return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localQuery]);

    useEffect(() => {
        let active = true;
        setLoading(true);
        api.get('/sellers')
            .then(({ data }) => { if (active) setSellers(data.items || []); })
            .catch(() => { if (active) setSellers([]); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    function setParam(key, value) {
        const next = new URLSearchParams(searchParams);
        if (!value) next.delete(key);
        else next.set(key, value);
        setSearchParams(next, { replace: true });
    }

    const states = useMemo(() => {
        const set = new Set(
            sellers.map((s) => (s.state || '').toUpperCase()).filter(Boolean)
        );
        return Array.from(set).sort();
    }, [sellers]);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        let list = sellers.slice();

        if (term) {
            list = list.filter((s) => {
                const haystack = [
                    s.store_name || '',
                    s.store_slug || '',
                    s.description || '',
                    s.city || '',
                    s.state || '',
                ].join(' ').toLowerCase();
                return haystack.includes(term);
            });
        }

        if (state) {
            list = list.filter((s) => (s.state || '').toUpperCase() === state);
        }

        if (onlyVerified) {
            list = list.filter((s) => s.verified);
        }

        switch (sort) {
            case 'rating':
                list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
                break;
            case 'products':
                list.sort((a, b) => (Number(b.products_count) || 0) - (Number(a.products_count) || 0));
                break;
            case 'name':
                list.sort((a, b) => (a.store_name || '').localeCompare(b.store_name || '', 'pt-BR'));
                break;
            default:
                // "relevance" — verified first, then rating desc, then name
                list.sort((a, b) => {
                    const v = Number(Boolean(b.verified)) - Number(Boolean(a.verified));
                    if (v !== 0) return v;
                    const r = (Number(b.rating) || 0) - (Number(a.rating) || 0);
                    if (r !== 0) return r;
                    return (a.store_name || '').localeCompare(b.store_name || '', 'pt-BR');
                });
        }

        return list;
    }, [sellers, q, state, onlyVerified, sort]);

    const activeFilters = (q ? 1 : 0) + (state ? 1 : 0) + (onlyVerified ? 1 : 0);

    const clearAll = () => {
        setLocalQuery('');
        setSearchParams({}, { replace: true });
    };

    return (
        <div className="bg-stone-50/70 pb-16">
            {/* Hero */}
            <section className="container-page pt-6">
                <div className="relative overflow-hidden rounded-[28px] bg-[#ece9e4] shadow-card">
                    <img
                        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1800&q=80"
                        alt="Vitrine de lojas Galopee"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-900/85 via-brand-900/55 to-brand-900/25" />
                    <div className="relative px-8 py-12 md:px-14 md:py-14">
                        <div className="flex items-center gap-3 text-white/80">
                            <span className="h-px w-8 bg-[#f1c56a]" />
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#f1c56a]">
                                Lojas parceiras
                            </span>
                        </div>
                        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl">
                            Encontre a loja certa para o seu negócio.
                        </h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 md:text-base">
                            Busque por nome, filtre por estado e compare avaliações de vendedores
                            cadastrados no Galopee.
                        </p>

                        {/* Search inline no hero */}
                        <div className="mt-7 max-w-2xl">
                            <div className="flex items-stretch overflow-hidden rounded-2xl bg-white shadow-lg">
                                <input
                                    value={localQuery}
                                    onChange={(e) => setLocalQuery(e.target.value)}
                                    placeholder="Buscar por loja, cidade ou produto..."
                                    className="min-w-0 flex-1 px-5 py-3.5 text-base text-slate-800 outline-none"
                                    aria-label="Buscar lojas"
                                />
                                <button
                                    type="button"
                                    onClick={() => setParam('q', localQuery)}
                                    className="bg-[#f1c56a] px-6 font-bold text-[#3b2a06] transition hover:bg-[#f5d28a]"
                                >
                                    Buscar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Toolbar de filtros */}
            <section className="container-page py-6">
                <div className="card flex flex-wrap items-center gap-3 p-4 md:p-5">
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterChip
                            active={!state}
                            onClick={() => setParam('state', '')}
                        >
                            Todos os estados
                        </FilterChip>
                        {states.map((uf) => (
                            <FilterChip
                                key={uf}
                                active={state === uf}
                                onClick={() => setParam('state', state === uf ? '' : uf)}
                            >
                                {uf}
                            </FilterChip>
                        ))}
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-3">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={onlyVerified}
                                onChange={(e) => setParam('verified', e.target.checked ? '1' : '')}
                                className="h-4 w-4 accent-brand-700"
                            />
                            Apenas verificadas
                        </label>

                        <div className="inline-flex items-center gap-2 text-sm text-slate-600">
                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Ordenar
                            </span>
                            <select
                                value={sort}
                                onChange={(e) => setParam('sort', e.target.value === 'relevance' ? '' : e.target.value)}
                                className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-brand-400"
                            >
                                <option value="relevance">Relevância</option>
                                <option value="rating">Melhor avaliadas</option>
                                <option value="products">Mais produtos</option>
                                <option value="name">Ordem alfabética</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resultados */}
            <section className="container-page">
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm text-slate-500">
                            {loading
                                ? 'Carregando lojas...'
                                : `${filtered.length} ${filtered.length === 1 ? 'loja encontrada' : 'lojas encontradas'}`}
                            {activeFilters > 0 && !loading && (
                                <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                                    {activeFilters} filtro{activeFilters > 1 ? 's' : ''} ativo{activeFilters > 1 ? 's' : ''}
                                </span>
                            )}
                        </p>
                    </div>
                    {activeFilters > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-sm font-bold text-brand-700 hover:text-brand-800"
                        >
                            Limpar filtros
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card h-80 animate-pulse overflow-hidden">
                                <div className="h-28 bg-stone-200" />
                                <div className="space-y-2 p-5">
                                    <div className="h-4 w-2/3 rounded bg-stone-200" />
                                    <div className="h-3 w-1/3 rounded bg-stone-100" />
                                    <div className="h-10 w-full rounded bg-stone-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card p-12 text-center">
                        <p className="text-lg font-extrabold text-slate-900">
                            Nenhuma loja encontrada
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                            Tente ajustar a busca ou limpar os filtros.
                        </p>
                        {activeFilters > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="btn-primary mt-5 rounded-xl px-6 py-2.5"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {filtered.map((seller) => (
                            <SellerCard key={seller.id} seller={seller} />
                        ))}
                    </div>
                )}
            </section>

            {/* Banner inferior */}
            <section className="container-page pt-12">
                <div className="overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white shadow-card md:p-10">
                    <div className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f1c56a]">
                                É produtor ou revendedor?
                            </p>
                            <h2 className="mt-3 text-3xl font-extrabold leading-tight">
                                Abra sua loja no Galopee.
                            </h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-white/85">
                                Cadastre seus produtos e apareça nesta lista para milhares de compradores.
                            </p>
                        </div>
                        <Link
                            to="/register"
                            className="rounded-xl bg-[#f1c56a] px-6 py-3 text-sm font-extrabold text-[#3b2a06] transition hover:bg-[#f5d28a]"
                        >
                            Quero vender
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FilterChip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
                active
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
            }`}
        >
            {children}
        </button>
    );
}
