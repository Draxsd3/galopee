import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatPrice } from '../utils/format';
import { getProductImage } from '../utils/productImage';
import toast from 'react-hot-toast';

export default function Cart() {
    const { cart, loading, updateItem, removeItem, clear } = useCart();
    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [clearing, setClearing] = useState(false);
    const navigate = useNavigate();

    const hasUnavailableItems = cart.items.some((item) => (
        item.product.active === false ||
        Number(item.product.stock || 0) <= 0 ||
        item.quantity > Number(item.product.stock || 0)
    ));

    const setQty = async (item, next) => {
        const stock = Number(item.product.stock || 0);
        if (next < 1 || updatingItemId) return;
        if (next > stock) {
            toast.error(`Estoque disponível: ${stock}`);
            return;
        }

        setUpdatingItemId(item.id);
        try {
            await updateItem(item.id, next);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao atualizar');
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleRemove = async (item) => {
        if (updatingItemId) return;
        setUpdatingItemId(item.id);
        try {
            await removeItem(item.id);
            toast.success('Item removido');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao remover');
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleClear = async () => {
        if (clearing || cart.items.length === 0) return;
        setClearing(true);
        try {
            await clear();
            toast.success('Carrinho limpo');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao limpar carrinho');
        } finally {
            setClearing(false);
        }
    };

    return (
        <div className="container-page py-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Carrinho</p>
                    <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Seu carrinho</h1>
                </div>
                {cart.items.length > 0 && (
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={clearing}
                        className="btn-ghost w-fit border border-stone-200 bg-white px-4"
                    >
                        {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Limpar
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex items-center gap-3 rounded-[24px] border border-stone-200 bg-white p-6 text-slate-500 shadow-card">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-700" />
                    Carregando carrinho...
                </div>
            ) : cart.items.length === 0 ? (
                <div className="rounded-[28px] border border-white bg-white p-12 text-center shadow-card">
                    <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p className="text-slate-600">Seu carrinho está vazio.</p>
                    <Link to="/" className="btn-primary mt-4">Voltar à loja</Link>
                </div>
            ) : (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-3">
                        {cart.items.map((item) => {
                            const stock = Number(item.product.stock || 0);
                            const unavailable = item.product.active === false || stock <= 0;
                            const overStock = item.quantity > stock;
                            const rowBusy = updatingItemId === item.id;
                            const canDecrease = item.quantity > 1 && !rowBusy;
                            const canIncrease = !unavailable && item.quantity < stock && !rowBusy;
                            const imageSrc = getProductImage(item.product);

                            return (
                                <div
                                    key={item.id}
                                    className={`rounded-[24px] border bg-white p-4 shadow-card transition ${
                                        unavailable || overStock ? 'border-amber-200' : 'border-white'
                                    }`}
                                >
                                    <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[96px_minmax(0,1fr)_142px_112px_44px] lg:items-center">
                                        <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-[18px] bg-white">
                                            {imageSrc ? (
                                                <img
                                                    src={imageSrc}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-contain p-2"
                                                />
                                            ) : (
                                                <ShoppingBag className="h-8 w-8 text-slate-300" />
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="truncate text-lg font-extrabold text-slate-950">{item.product.name}</div>
                                            <div className="mt-1 text-sm text-slate-500">{item.product.seller?.store_name}</div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="font-extrabold text-slate-900">{formatPrice(item.product.price)}</span>
                                                {unavailable ? (
                                                    <span className="badge-yellow">Indisponível</span>
                                                ) : overStock ? (
                                                    <span className="badge-yellow">Estoque: {stock}</span>
                                                ) : (
                                                    <span className="badge-slate">Estoque: {stock}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="inline-flex h-11 w-fit items-center overflow-hidden rounded-full border border-stone-200 bg-stone-50">
                                            <button
                                                type="button"
                                                onClick={() => setQty(item, item.quantity - 1)}
                                                disabled={!canDecrease}
                                                className="grid h-11 w-11 place-items-center text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Diminuir quantidade"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="grid h-11 w-12 place-items-center text-sm font-extrabold text-slate-900">
                                                {rowBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setQty(item, item.quantity + 1)}
                                                disabled={!canIncrease}
                                                className="grid h-11 w-11 place-items-center text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                                aria-label="Aumentar quantidade"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <div className="text-left lg:text-right">
                                            <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Subtotal</div>
                                            <div className="mt-1 font-extrabold text-slate-950">{formatPrice(item.subtotal)}</div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleRemove(item)}
                                            disabled={rowBusy}
                                            className="grid h-11 w-11 place-items-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label="Remover item"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <aside className="h-fit rounded-[24px] border border-white bg-white p-6 shadow-card lg:sticky lg:top-24">
                        <h2 className="text-lg font-extrabold text-slate-950">Resumo do pedido</h2>
                        <div className="mt-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Itens</span>
                                <span className="font-bold">{cart.items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-bold">{formatPrice(cart.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Frete</span>
                                <span className="text-slate-500">a calcular</span>
                            </div>
                        </div>

                        {hasUnavailableItems && (
                            <div className="mt-5 flex gap-2 rounded-[18px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                Ajuste ou remova itens indisponíveis antes de finalizar.
                            </div>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4">
                            <span className="font-extrabold text-slate-950">Total</span>
                            <span className="text-2xl font-extrabold text-slate-950">{formatPrice(cart.total)}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/checkout')}
                            disabled={hasUnavailableItems || loading || clearing}
                            className="btn-primary mt-6 w-full py-3 text-base"
                        >
                            Finalizar compra
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
}
