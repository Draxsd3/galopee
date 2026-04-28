import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';
import { getProductFallback, getProductImage } from '../utils/productImage';
import ProductCard from '../components/ProductCard';
import {
    Check,
    Store,
    ShoppingCart,
    Minus,
    Plus,
    Truck,
    MapPin,
    Star,
    MessageSquare,
    Package,
    RotateCcw,
    CreditCard,
} from 'lucide-react';

const REVIEWS_STORAGE_PREFIX = 'galoppe.reviews.';

function loadReviews(productId) {
    try {
        const raw = localStorage.getItem(REVIEWS_STORAGE_PREFIX + productId);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function persistReviews(productId, reviews) {
    try {
        localStorage.setItem(REVIEWS_STORAGE_PREFIX + productId, JSON.stringify(reviews));
    } catch {
        /* storage indisponivel */
    }
}

function dedupeProducts(items, currentId) {
    const seen = new Set([currentId]);
    const result = [];

    for (const item of items) {
        if (!item || seen.has(item.id)) continue;
        seen.add(item.id);
        result.push(item);
    }

    return result;
}

function StarRating({ value = 0, onChange, size = 5 }) {
    const interactive = typeof onChange === 'function';
    return (
        <div className="inline-flex items-center gap-0.5">
            {Array.from({ length: size }).map((_, i) => {
                const idx = i + 1;
                const filled = idx <= Math.round(value);
                const Element = interactive ? 'button' : 'span';

                return (
                    <Element
                        key={idx}
                        type={interactive ? 'button' : undefined}
                        onClick={interactive ? () => onChange(idx) : undefined}
                        className={interactive ? 'cursor-pointer' : ''}
                        aria-label={interactive ? `Avaliar com ${idx} estrelas` : undefined}
                    >
                        <Star
                            className={`h-5 w-5 ${filled ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                        />
                    </Element>
                );
            })}
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [seller, setSeller] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [adding, setAdding] = useState(false);
    const [related, setRelated] = useState([]);
    const [sameStore, setSameStore] = useState([]);
    const [productImageSrc, setProductImageSrc] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewText, setReviewText] = useState('');

    const { addItem } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        setQty(1);
        api.get(`/products/${id}`)
            .then(({ data }) => setProduct(data))
            .catch(() => setProduct(null))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        setReviews(loadReviews(id));
        setReviewText('');
        setReviewRating(5);
    }, [id]);

    useEffect(() => {
        if (!product) {
            setProductImageSrc('');
            return;
        }

        setProductImageSrc(getProductImage(product));
    }, [product]);

    useEffect(() => {
        if (!product?.store_slug) {
            setSeller(null);
            return;
        }

        let active = true;

        api.get(`/sellers/${product.store_slug}`)
            .then(({ data }) => {
                if (active) setSeller(data);
            })
            .catch(() => {
                if (active) setSeller(null);
            });

        return () => {
            active = false;
        };
    }, [product?.store_slug]);

    useEffect(() => {
        if (!product) return;
        let active = true;

        const jobs = [
            api.get('/products', { params: { limit: 24 } })
                .then((res) => ({ kind: 'catalog', items: res.data.items || [] })),
        ];

        if (product.category) {
            jobs.push(
                api.get('/products', { params: { category: product.category, limit: 16 } })
                    .then((res) => ({ kind: 'related', items: res.data.items || [] }))
            );
        }

        if (product.seller_id) {
            jobs.push(
                api.get('/products', { params: { sellerId: product.seller_id, limit: 16 } })
                    .then((res) => ({ kind: 'sameStore', items: res.data.items || [] }))
            );
        }

        Promise.all(jobs)
            .then((results) => {
                if (!active) return;

                let relatedItems = [];
                let sameStoreItems = [];
                let catalogItems = [];

                for (const result of results) {
                    if (result.kind === 'related') relatedItems = result.items;
                    if (result.kind === 'sameStore') sameStoreItems = result.items;
                    if (result.kind === 'catalog') catalogItems = result.items;
                }

                const uniqueSameStore = dedupeProducts(sameStoreItems, product.id).slice(0, 8);
                const uniqueRelated = dedupeProducts(
                    [
                        ...relatedItems,
                        ...catalogItems.filter((item) => item.seller_id !== product.seller_id),
                    ],
                    product.id
                ).slice(0, 8);

                setSameStore(uniqueSameStore);
                setRelated(uniqueRelated);
            })
            .catch(() => {
                if (!active) return;
                setRelated([]);
                setSameStore([]);
            });

        return () => {
            active = false;
        };
    }, [product]);

    const avgRating = useMemo(() => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
        return sum / reviews.length;
    }, [reviews]);

    const handleAdd = async () => {
        if (!user) {
            toast('Faca login para adicionar ao carrinho');
            navigate(`/login?next=/product/${id}`);
            return;
        }

        if (!['buyer', 'seller'].includes(user.role)) {
            toast.error('Este perfil nao pode adicionar itens ao carrinho');
            return;
        }

        try {
            setAdding(true);
            await addItem(product.id, qty);
            toast.success('Produto adicionado ao carrinho!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao adicionar');
        } finally {
            setAdding(false);
        }
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();
        const text = reviewText.trim();

        if (!text) {
            toast.error('Escreva um comentario antes de enviar.');
            return;
        }

        const newReview = {
            id: `r_${Date.now()}`,
            rating: reviewRating,
            text,
            author: user?.name || 'Visitante',
            created_at: new Date().toISOString(),
        };

        const next = [newReview, ...reviews];
        setReviews(next);
        persistReviews(id, next);
        setReviewText('');
        setReviewRating(5);
        toast.success('Avaliacao enviada!');
    };

    if (loading) {
        return <div className="container-page py-12 text-center text-slate-500">Carregando...</div>;
    }

    if (!product) {
        return (
            <div className="container-page py-12 text-center">
                <p className="text-slate-500">Produto nao encontrado.</p>
                <Link to="/" className="btn-primary mt-4">Voltar a loja</Link>
            </div>
        );
    }

    const maxStock = Math.max(0, Number(product.stock || 0));
    const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
    const discountPct = hasDiscount
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;
    const storeLink = product.store_slug ? `/store/${product.store_slug}` : '/';
    const installments = Math.max(1, Math.round(Number(product.price || 0) / 50));
    const installmentValue = Number(product.price || 0) / Math.min(12, installments || 1);
    const productFallback = getProductFallback(product.category);
    const displaySeller = seller || {
        store_name: product.store_name,
        store_slug: product.store_slug,
        city: product.city,
        state: product.state,
        rating: product.seller_rating,
        verified: product.seller_verified,
    };
    const sellerProductCount = Math.max(sameStore.length + 1, 1);

    return (
        <div className="container-page py-8">
            <div className="mb-4 text-center text-sm text-slate-500 md:text-left">
                <Link to="/" className="hover:text-brand-700">Marketplace</Link>
                <span className="mx-2">/</span>
                {product.category && (
                    <>
                        <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-brand-700">
                            {product.category}
                        </Link>
                        <span className="mx-2">/</span>
                    </>
                )}
                <span className="text-slate-700">{product.name}</span>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <div className="card overflow-hidden">
                    <div className="relative aspect-square bg-white">
                        {productImageSrc ? (
                            <img
                                src={productImageSrc}
                                alt={product.name}
                                className="h-full w-full object-contain p-4 md:p-6"
                                decoding="async"
                                style={{ imageRendering: 'auto' }}
                                onError={() => {
                                    if (productImageSrc !== productFallback) {
                                        setProductImageSrc(productFallback);
                                    }
                                }}
                            />
                        ) : (
                            <div className="grid h-full w-full place-items-center text-slate-400">Sem imagem</div>
                        )}
                        {hasDiscount && (
                            <span className="absolute left-4 top-4 rounded-full bg-accent-500 px-3 py-1 text-sm font-bold text-white shadow">
                                -{discountPct}% OFF
                            </span>
                        )}
                    </div>
                </div>

                <div className="space-y-5 text-center md:text-left">
                    {product.category && (
                        <span className="badge-slate">{product.category}</span>
                    )}

                    <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>

                    <div className="flex items-center justify-center gap-3 text-sm md:justify-start">
                        <StarRating value={avgRating} />
                        <span className="font-semibold text-slate-700">
                            {avgRating ? avgRating.toFixed(1) : '-'}
                        </span>
                        <span className="text-slate-500">
                            ({reviews.length} {reviews.length === 1 ? 'avaliacao' : 'avaliacoes'})
                        </span>
                    </div>

                    <div>
                        {hasDiscount && (
                            <div className="text-sm text-slate-400 line-through">
                                {formatPrice(product.compare_price)}
                            </div>
                        )}
                        <div className="text-4xl font-extrabold text-slate-900">{formatPrice(product.price)}</div>
                        <div className="mt-1 flex items-center justify-center gap-1 text-sm text-brand-700 md:justify-start">
                            <CreditCard className="h-4 w-4" />
                            Em ate 12x de <strong className="mx-1">{formatPrice(installmentValue)}</strong> sem juros
                        </div>
                    </div>

                    <p className="leading-relaxed text-slate-600">
                        {product.description || 'Sem descricao disponivel.'}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                        <div className="inline-flex items-center rounded-lg border border-slate-200">
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="px-3 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={qty <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 px-4 text-center font-semibold">{qty}</span>
                            <button
                                onClick={() => setQty(Math.min(maxStock, qty + 1))}
                                className="px-3 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                disabled={qty >= maxStock}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                        <span className="text-sm text-slate-500">
                            {maxStock > 0 ? `${maxStock} em estoque` : 'Esgotado'}
                        </span>
                    </div>

                    <button
                        disabled={adding || maxStock === 0}
                        onClick={handleAdd}
                        className="btn-primary w-full py-3 text-base"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {maxStock === 0 ? 'Indisponivel' : adding ? 'Adicionando...' : 'Adicionar ao carrinho'}
                    </button>

                    <div className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-3">
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 md:justify-start">
                            <Check className="h-5 w-5 text-brand-600" strokeWidth={3} />
                            Compra protegida
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 md:justify-start">
                            <Truck className="h-5 w-5 text-brand-600" />
                            {product.free_shipping ? 'Frete gratis' : 'Envio Brasil'}
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-600 md:justify-start">
                            <RotateCcw className="h-5 w-5 text-brand-600" />
                            Troca em 7 dias
                        </div>
                    </div>
                </div>
            </div>

            <section className="mt-10">
                <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
                    <div className="relative h-32 overflow-hidden md:h-40">
                        {displaySeller?.banner_url ? (
                            <img
                                src={displaySeller.banner_url}
                                alt={displaySeller.store_name || 'Loja'}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-gradient-to-r from-brand-800 via-brand-700 to-brand-600" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/55 via-slate-950/20 to-transparent" />
                    </div>

                    <div className="p-6">
                        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                            <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-start md:text-left">
                                <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-[24px] border-4 border-white bg-white text-brand-700 shadow-lg">
                                    {displaySeller?.logo_url ? (
                                        <img
                                            src={displaySeller.logo_url}
                                            alt={displaySeller.store_name || 'Loja'}
                                            className="h-full w-full object-contain p-2"
                                            onError={(event) => { event.currentTarget.src = '/stores/logos/galopee-store.svg'; }}
                                        />
                                    ) : (
                                        <Store className="h-10 w-10" />
                                    )}
                                </div>

                                <div className="pt-2">
                                    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                                        <span className="text-xl font-bold text-slate-900">
                                            {displaySeller?.store_name || 'Loja Galopee'}
                                        </span>
                                        {displaySeller?.verified ? (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700">
                                                <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                                Verificada
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-slate-500 md:justify-start">
                                        {displaySeller?.rating && Number(displaySeller.rating) > 0 ? (
                                            <span className="inline-flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                {Number(displaySeller.rating).toFixed(1)} de reputacao
                                            </span>
                                        ) : null}
                                        {(displaySeller?.city || displaySeller?.state) && (
                                            <span className="inline-flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                {[displaySeller.city, displaySeller.state].filter(Boolean).join(' / ')}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1">
                                            <Package className="h-4 w-4 text-brand-700" />
                                            {sellerProductCount} produto{sellerProductCount > 1 ? 's' : ''} na loja
                                        </span>
                                    </div>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                        {displaySeller?.description || 'Loja parceira do Galopee com produtos selecionados.'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 sm:flex-row">
                                <Link
                                    to={storeLink}
                                    className="btn rounded-xl border border-brand-200 bg-brand-50 px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-100"
                                >
                                    Visitar loja
                                </Link>
                                <Link
                                    to={storeLink}
                                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800"
                                >
                                    Ver todos os produtos
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-10">
                <h2 className="mb-4 text-center text-2xl font-bold text-slate-900 md:text-left">
                    Informacoes do produto
                </h2>
                <div className="card p-6">
                    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                        {product.sku && (
                            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                <dt className="font-semibold text-slate-500">SKU</dt>
                                <dd className="text-slate-800">{product.sku}</dd>
                            </div>
                        )}
                        {product.category && (
                            <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                                <dt className="font-semibold text-slate-500">Categoria</dt>
                                <dd className="text-slate-800">{product.category}</dd>
                            </div>
                        )}
                        <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                            <dt className="font-semibold text-slate-500">Estoque</dt>
                            <dd className="text-slate-800">{maxStock > 0 ? `${maxStock} unidades` : 'Esgotado'}</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                            <dt className="font-semibold text-slate-500">Envio</dt>
                            <dd className="text-slate-800">
                                {product.free_shipping ? 'Frete gratis' : 'Calculado no checkout'}
                            </dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                            <dt className="font-semibold text-slate-500">Parcelamento</dt>
                            <dd className="text-slate-800">Ate 12x sem juros</dd>
                        </div>
                        <div className="flex justify-between gap-4 border-b border-slate-100 pb-3">
                            <dt className="font-semibold text-slate-500">Vendido por</dt>
                            <dd className="text-slate-800">{displaySeller?.store_name || 'Galopee'}</dd>
                        </div>
                    </dl>
                </div>
            </section>

            {sameStore.length > 0 && (
                <section className="mt-12">
                    <div className="mb-5 flex flex-col items-center justify-between gap-2 md:flex-row md:items-end">
                        <div className="text-center md:text-left">
                            <span className="section-kicker">
                                <Package className="h-4 w-4" />
                                Mesma loja
                            </span>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">
                                Mais produtos de {displaySeller?.store_name}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Continue comprando com a mesma loja e descubra mais itens do vendedor.
                            </p>
                        </div>
                        <Link to={storeLink} className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                            Ver tudo da loja →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {sameStore.map((item) => <ProductCard key={item.id} product={item} />)}
                    </div>
                </section>
            )}

            {related.length > 0 && (
                <section className="mt-12">
                    <div className="mb-5 text-center md:text-left">
                        <span className="section-kicker">Recomendados para voce</span>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Produtos semelhantes</h2>
                        <p className="text-sm text-slate-500">
                            Selecionados pela mesma categoria e pelo restante do catalogo.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {related.map((item) => <ProductCard key={item.id} product={item} />)}
                    </div>
                </section>
            )}

            <section className="mt-12">
                <div className="mb-5 text-center md:text-left">
                    <span className="section-kicker">
                        <MessageSquare className="h-4 w-4" />
                        Avaliacoes
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">
                        O que dizem sobre este produto
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-sm md:justify-start">
                        <StarRating value={avgRating} />
                        <span className="font-semibold text-slate-700">
                            {avgRating ? avgRating.toFixed(1) : 'Sem nota ainda'}
                        </span>
                        <span className="text-slate-500">
                            ({reviews.length} {reviews.length === 1 ? 'comentario' : 'comentarios'})
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmitReview}
                    className="card mb-6 space-y-4 p-6 text-center md:text-left"
                >
                    <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
                        <span className="text-sm font-semibold text-slate-700">Sua nota:</span>
                        <StarRating value={reviewRating} onChange={setReviewRating} />
                    </div>
                    <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        placeholder="Conte como foi a sua experiencia com este produto..."
                        className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                    <div className="flex flex-col items-center justify-end gap-2 sm:flex-row">
                        <button
                            type="submit"
                            className="btn-primary rounded-xl px-6 py-2.5"
                        >
                            Publicar avaliacao
                        </button>
                    </div>
                </form>

                {reviews.length === 0 ? (
                    <div className="card p-8 text-center text-slate-500">
                        Ainda nao ha avaliacoes para este produto.
                        <br />
                        Seja o primeiro a comentar.
                    </div>
                ) : (
                    <ul className="space-y-4">
                        {reviews.map((review) => (
                            <li key={review.id} className="card p-5 text-center md:text-left">
                                <div className="flex flex-col items-center justify-between gap-2 md:flex-row md:items-start">
                                    <div>
                                        <div className="font-semibold text-slate-900">{review.author}</div>
                                        <div className="mt-1">
                                            <StarRating value={review.rating} />
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <p className="mt-3 text-sm leading-relaxed text-slate-700">{review.text}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
