import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Flame, Tractor } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import SellerCard from '../components/SellerCard';
import QuickActionCard from '../components/QuickActionCard';
import PromoBanner from '../components/PromoBanner';

const heroBackgrounds = [
    {
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80',
        alt: 'Plantacao em larga escala ao por do sol',
    },
    {
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1800&q=80',
        alt: 'Trator trabalhando no campo',
    },
    {
        image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=80',
        alt: 'Campo de soja verde',
    },
    {
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1800&q=80',
        alt: 'Colheita de graos',
    },
    {
        image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1800&q=80',
        alt: 'Plantacao verde com horizonte',
    },
];

export default function Home() {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'Todos';

    const [products, setProducts] = useState([]);
    const [featured, setFeatured] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bgIndex, setBgIndex] = useState(0);

    const isFiltering = !!search || (category && category !== 'Todos');

    useEffect(() => {
        let active = true;
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (category && category !== 'Todos') params.category = category;

        const jobs = [api.get('/products', { params })];
        if (!isFiltering) {
            jobs.push(api.get('/products', { params: { featured: true, limit: 8 } }));
            jobs.push(api.get('/sellers'));
        }

        Promise.all(jobs)
            .then((responses) => {
                if (!active) return;
                setProducts(responses[0].data.items || []);
                if (!isFiltering) {
                    setFeatured(responses[1].data.items || []);
                    setSellers((responses[2].data.items || []).slice(0, 8));
                }
            })
            .catch(() => {
                if (!active) return;
                setProducts([]);
                if (!isFiltering) {
                    setFeatured([]);
                    setSellers([]);
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [search, category, isFiltering]);

    // Trunca a lista para caber perfeitamente no grid de 4 colunas (sem espaço vazio)
    const toGridFit = (list) => list.slice(0, list.length - (list.length % 4));
    const gridProducts = toGridFit(products);
    const gridFeatured = toGridFit(featured);
    // Ponto de inserção dos banners promocionais: metade arredondada para múltiplo de 4
    const promoSplit = Math.floor(gridProducts.length / 8) * 4;
    const productsBeforePromo = gridProducts.slice(0, promoSplit);
    const productsAfterPromo = gridProducts.slice(promoSplit);

    const setParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (!value || value === 'Todos') next.delete(key);
        else next.set(key, value);
        setSearchParams(next, { replace: true });
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex((current) => (current + 1) % heroBackgrounds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pb-16">
            <section className="container-page pt-5">
                <div className="overflow-hidden rounded-[30px] bg-[#ece9e4] shadow-card">
                    <div className="relative min-h-[380px] overflow-hidden">
                        {heroBackgrounds.map((bg, index) => (
                            <img
                                key={bg.image}
                                src={bg.image}
                                alt={bg.alt}
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${index === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                style={{ transitionProperty: 'opacity, transform' }}
                            />
                        ))}
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/75 via-brand-900/55 to-brand-900/35" />

                        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 lg:left-10 lg:translate-x-0">
                            {heroBackgrounds.map((bg, index) => (
                                <button
                                    key={bg.image}
                                    onClick={() => setBgIndex(index)}
                                    className={`h-1.5 rounded-full transition-all duration-500 ${index === bgIndex ? 'w-10 bg-[#f1c56a]' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                                    aria-label={`Ir para imagem ${index + 1}`}
                                />
                            ))}
                        </div>

                        <div className="relative z-10 flex min-h-[380px] flex-col justify-center px-8 py-10 md:px-14 md:py-12 lg:px-20">
                            <div className="max-w-4xl text-white">
                                <div className="flex items-center gap-3">
                                    <span className="h-px w-8 bg-[#f1c56a]" />
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#f1c56a]">
                                        Marketplace agro
                                    </p>
                                </div>

                                <h1 className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-tight md:text-5xl lg:text-6xl">
                                    Produtos e lojas do agro <span className="italic font-light text-[#f1c56a]">em um so</span> lugar.
                                </h1>

                                <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
                                    Encontre insumos, equipamentos, sementes e vendedores em uma vitrine
                                    pensada para compra e venda com <span className="font-semibold text-white">mais clareza</span>.
                                </p>

                                <div className="mt-7 flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => setParam('category', 'Todos')}
                                        className="btn-accent rounded-xl px-7 py-3.5 text-sm shadow-lg shadow-black/20"
                                    >
                                        Explorar catalogo
                                    </button>
                                    <Link
                                        to="/register"
                                        className="btn rounded-xl border border-white/30 bg-white/5 px-7 py-3.5 text-sm text-white backdrop-blur-sm hover:bg-white/15"
                                    >
                                        Quero vender
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {!isFiltering && (
                <section className="container-page py-6">
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <QuickActionCard
                            variant="greenLight"
                            title="Ofertas"
                            description="As melhores ofertas do agro você encontra aqui."
                            cta="Ver mais"
                            to="/?featured=true"
                            size="md"
                            bgImage="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1100&q=80"
                        />
                        <QuickActionCard
                            variant="green"
                            title="Tudo na"
                            highlight="agricultura"
                            description="Insumos, sementes, fertilizantes e defensivos."
                            cta="Ver mais"
                            to="/?category=Fertilizantes"
                            size="md"
                            bgImage="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1100&q=80"
                        />
                        <QuickActionCard
                            variant="amber"
                            title="Máquinas e"
                            highlight="equipamentos"
                            description="Tratores, implementos e ferramentas."
                            cta="Ver mais"
                            to="/?category=Máquinas"
                            size="md"
                            bgImage="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1100&q=80"
                        />
                        <QuickActionCard
                            variant="dark"
                            title="Lojas"
                            highlight="verificadas"
                            description="Vendedores aprovados e com reputação."
                            cta="Explorar"
                            to="/stores"
                            size="md"
                            bgImage="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1100&q=80"
                        />
                    </div>
                </section>
            )}

            {!isFiltering && featured.length > 0 && (
                <section className="container-page py-8">
                    <div className="mb-6 flex items-end justify-between gap-4">
                        <div>
                            <span className="section-kicker">
                                <Flame className="h-4 w-4" /> Produtos em destaque
                            </span>
                            <h2 className="mt-4 text-3xl font-extrabold text-slate-900">As melhores ofertas do momento</h2>
                            <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                Uma secao forte de vitrine, inspirada em marketplace do agro, mas com leitura mais limpa.
                            </p>
                        </div>
                        <Link to="/" className="hidden items-center gap-2 text-sm font-semibold text-brand-700 md:inline-flex">
                            Ver tudo
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
                        <div className="col-span-2 lg:col-span-1">
                            <Link
                                to="/?featured=true"
                                className="group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-[#8bc34a] via-[#7cb342] to-[#5f8f34] p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div
                                    className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl"
                                    aria-hidden
                                />
                                <div
                                    className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                                    aria-hidden
                                />
                                <svg
                                    className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-white/10"
                                    viewBox="0 0 400 180"
                                    fill="none"
                                    aria-hidden
                                >
                                    <path d="M0 120 Q100 80 200 110 T400 90 L400 180 L0 180 Z" fill="currentColor" />
                                </svg>

                                <div className="relative z-10">
                                    <h3 className="text-4xl font-extrabold leading-none text-white md:text-5xl">
                                        Ofertas
                                    </h3>
                                    <p className="mt-4 max-w-[180px] text-sm leading-6 text-white/90">
                                        As melhores ofertas do agro voce encontra aqui.
                                    </p>
                                </div>

                                <div className="relative z-10 mt-6">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#4a7a1f] shadow-lg transition-transform group-hover:translate-x-1">
                                        Ver mais
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </Link>
                        </div>
                        {gridFeatured.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {!isFiltering && sellers.length > 0 && (
                <section className="container-page py-8">
                    <div className="overflow-hidden rounded-[32px] bg-white shadow-card">
                        <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
                            <div className="relative min-h-[320px]">
                                <img
                                    src="https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&w=1200&q=80"
                                    alt="Produtor rural"
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6 text-white">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Lojas parceiras</p>
                                    <h2 className="mt-3 text-3xl font-extrabold leading-tight">
                                        Vendedores em evidencia dentro da plataforma.
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="mb-6">
                                    <span className="section-kicker">Lojas verificadas</span>
                                    <p className="mt-4 max-w-xl text-sm leading-6 text-slate-500">
                                        Lojas com cadastro revisado e histórico de vendas. Conheça quem está por trás de cada produto.
                                    </p>
                                </div>
                                <div className="grid gap-5 sm:grid-cols-2">
                                    {sellers.slice(0, 4).map((seller) => <SellerCard key={seller.id} seller={seller} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            <section className="container-page py-8">
                <div className="mb-6">
                    <span className="section-kicker">Catalogo</span>
                    <h2 className="mt-4 text-3xl font-extrabold text-slate-900">
                        {search ? `Resultados para "${search}"` : category !== 'Todos' ? `Categoria: ${category}` : 'Todos os produtos'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="card h-80 animate-pulse overflow-hidden">
                                <div className="h-48 bg-stone-200" />
                                <div className="space-y-2 p-5">
                                    <div className="h-4 w-2/3 rounded bg-stone-200" />
                                    <div className="h-8 w-1/2 rounded bg-stone-200" />
                                    <div className="h-4 w-full rounded bg-stone-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="card p-12 text-center text-slate-500">
                        Nenhum produto encontrado. Tente outra busca.
                        <div className="mt-4">
                            <Link to="/" className="btn-primary">Ver catalogo completo</Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                        {productsBeforePromo.map((p) => <ProductCard key={p.id} product={p} />)}
                        {!isFiltering && gridProducts.length >= 4 && (
                            <>
                                <div className="col-span-2">
                                    <PromoBanner variant="points" to="/" />
                                </div>
                                <div className="col-span-2">
                                    <PromoBanner variant="guarantee" to="/" />
                                </div>
                            </>
                        )}
                        {productsAfterPromo.map((p) => <ProductCard key={`after-${p.id}`} product={p} />)}
                    </div>
                )}
            </section>

            {!isFiltering && (
                <section className="container-page pt-8">
                    <PromoBanner
                        variant="green"
                        image="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80"
                        title="Quer ser um vendedor no Galoppe?"
                        description="Cadastre-se hoje mesmo e comece a vender para todo o Brasil, sem complicacao e com mais visibilidade."
                        cta="Saiba mais"
                        to="/register"
                    />
                </section>
            )}
        </div>
    );
}
