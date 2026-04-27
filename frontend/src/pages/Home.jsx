import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Flame, MapPin, Package, Star, Store, UserPlus } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import QuickActionCard from '../components/QuickActionCard';
import PromoBanner from '../components/PromoBanner';

const heroBackgrounds = [
    {
        image: '/promos/custom/hero-slide-1.png',
        alt: 'Hero promocional do marketplace Galopee',
    },
    {
        image: '/promos/custom/hero-slide-2.png',
        alt: 'Hero promocional com beneficios do marketplace Galopee',
    },
    {
        image: '/promos/custom/hero-slide-3.png',
        alt: 'Hero promocional com destaque para ofertas',
    },
    {
        image: '/promos/custom/hero-slide-4.png',
        alt: 'Hero promocional com condicoes de pagamento',
    },
];

function sellerInitials(name = '?') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');
}

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

    const toGridFit = (list) => list.slice(0, list.length - (list.length % 4));
    const gridProducts = toGridFit(products);
    const gridFeatured = toGridFit(featured);
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
                    <div className="relative aspect-[16/9] min-h-[280px] overflow-hidden md:aspect-[16/8] lg:min-h-[380px]">
                        {heroBackgrounds.map((bg, index) => (
                            <img
                                key={bg.image}
                                src={bg.image}
                                alt={bg.alt}
                                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out ${index === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                                style={{ transitionProperty: 'opacity, transform' }}
                            />
                        ))}

                        <div className="absolute bottom-4 left-4 z-20 flex flex-col items-start gap-3 md:bottom-5 lg:left-10">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setParam('category', 'Todos')}
                                    className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-accent-600 md:px-5 md:py-2.5 md:text-sm"
                                >
                                    Explorar<span className="hidden sm:inline"> catalogo</span>
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/15 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm transition hover:bg-white/25 md:px-5 md:py-2.5 md:text-sm"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Quero vender</span>
                                </Link>
                            </div>

                            <div className="flex items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
                                {heroBackgrounds.map((bg, index) => (
                                    <button
                                        key={bg.image}
                                        onClick={() => setBgIndex(index)}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${index === bgIndex ? 'w-10 bg-[#f1c56a]' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                                        aria-label={`Ir para imagem ${index + 1}`}
                                    />
                                ))}
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
                            description="As melhores ofertas voce encontra aqui."
                            cta="Ver mais"
                            to="/?featured=true"
                            size="md"
                            bgImage="/promos/custom/hero-card-ofertas.png"
                            artOnly
                        />
                        <QuickActionCard
                            variant="green"
                            title="Tudo em"
                            highlight="eletrônicos"
                            description="Smartphones, notebooks, audio e gadgets."
                            cta="Ver mais"
                            to="/?category=Eletr%C3%B4nicos"
                            size="md"
                            bgImage="/promos/custom/hero-card-agricultura.png"
                            artOnly
                        />
                        <QuickActionCard
                            variant="amber"
                            title="Moda e"
                            highlight="estilo"
                            description="Roupas, calcados e acessorios das tendencias."
                            cta="Ver mais"
                            to="/?category=Moda"
                            size="md"
                            bgImage="/promos/custom/hero-card-maquinas.png"
                            artOnly
                        />
                        <QuickActionCard
                            variant="dark"
                            title="Lojas"
                            highlight="verificadas"
                            description="Vendedores aprovados e com reputacao."
                            cta="Explorar"
                            to="/stores"
                            size="md"
                            bgImage="/promos/custom/hero-card-lojas.png"
                            artOnly
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
                                Selecionamos os destaques de todas as categorias para voce nao perder.
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
                                className="group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[24px] bg-gradient-to-br from-[#818cf8] via-[#6366f1] to-[#4338ca] p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                                        As melhores ofertas voce encontra aqui.
                                    </p>
                                </div>

                                <div className="relative z-10 mt-6">
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-[#4338ca] shadow-lg transition-transform group-hover:translate-x-1">
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
                            <div className="relative min-h-[360px] overflow-hidden lg:min-h-[620px]">
                                <img
                                    src="/promos/custom/hero-card-lojas.png"
                                    alt="Arte promocional de lojas parceiras"
                                    className="absolute inset-0 h-full w-full object-cover"
                                    decoding="async"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent" />
                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">
                                        Lojas parceiras
                                    </p>
                                    <h2 className="mt-3 max-w-sm text-3xl font-extrabold leading-tight">
                                        Vendedores em evidencia dentro da plataforma.
                                    </h2>
                                </div>
                            </div>

                            <div className="p-6 md:p-8">
                                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <span className="section-kicker">
                                            <Store className="h-4 w-4" />
                                            Lojas verificadas
                                        </span>
                                        <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-500">
                                            Lojas com cadastro revisado e historico de vendas. Conheca quem esta por tras de cada produto.
                                        </p>
                                    </div>
                                    <Link
                                        to="/stores"
                                        className="inline-flex items-center gap-2 text-sm font-bold text-brand-700 hover:text-brand-800"
                                    >
                                        Ver todas
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    {sellers.slice(0, 4).map((seller) => {
                                        const rating = Number(seller.rating) || 0;
                                        const productsCount = Number(seller.products_count) || 0;

                                        return (
                                            <Link
                                                key={seller.id}
                                                to={`/store/${seller.store_slug}`}
                                                className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white transition hover:border-brand-300 hover:shadow-md"
                                            >
                                                <div className="relative h-24 overflow-hidden bg-stone-100">
                                                    {seller.banner_url ? (
                                                        <img
                                                            src={seller.banner_url}
                                                            alt={seller.store_name}
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900" />
                                                    )}
                                                    {seller.verified && (
                                                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-brand-700 shadow-sm">
                                                            <Check className="h-3 w-3" strokeWidth={3} />
                                                            Verificada
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="absolute left-4 top-16 z-20 grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-brand-700 text-lg font-extrabold text-white shadow-md">
                                                    {seller.logo_url ? (
                                                        <img
                                                            src={seller.logo_url}
                                                            alt={seller.store_name}
                                                            className="h-full w-full object-contain bg-white p-2"
                                                            onError={(event) => { event.currentTarget.src = '/stores/logos/galopee-store.svg'; }}
                                                        />
                                                    ) : (
                                                        <span>{sellerInitials(seller.store_name) || 'GP'}</span>
                                                    )}
                                                </div>

                                                <div className="flex flex-1 flex-col p-4 pt-14">
                                                    <h3 className="mt-4 line-clamp-1 text-base font-extrabold text-slate-900">
                                                        {seller.store_name}
                                                    </h3>
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="truncate">
                                                            {[seller.city, seller.state].filter(Boolean).join('/')}
                                                        </span>
                                                    </div>

                                                    <div className="mt-4 flex items-center gap-3 rounded-full bg-stone-50 px-3 py-2 text-xs text-slate-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                            <strong className="text-slate-800">{rating.toFixed(1)}</strong>
                                                            avaliacao
                                                        </span>
                                                        <span className="h-4 w-px bg-stone-200" />
                                                        <span className="inline-flex items-center gap-1">
                                                            <Package className="h-3.5 w-3.5 text-brand-700" />
                                                            <strong className="text-slate-800">{productsCount}</strong>
                                                            produtos
                                                        </span>
                                                    </div>

                                                    <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-extrabold text-white transition group-hover:bg-brand-800">
                                                        Ver loja
                                                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
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
                        image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80"
                        title="Quer ser um vendedor no Galopee?"
                        description="Cadastre-se hoje mesmo e comece a vender para todo o Brasil, sem complicacao e com mais visibilidade."
                        cta="Saiba mais"
                        to="/register"
                    />
                </section>
            )}
        </div>
    );
}
                                                                                                                                    