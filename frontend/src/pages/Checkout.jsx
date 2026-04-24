import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/format';

export default function Checkout() {
    const { cart, loading: cartLoading, reload } = useCart();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [form, setForm] = useState({
        street: '',
        number: '',
        complement: '',
        district: '',
        city: '',
        state: '',
        zip: '',
        notes: '',
    });

    const hasUnavailableItems = cart.items.some((item) => (
        item.product.active === false ||
        Number(item.product.stock || 0) <= 0 ||
        item.quantity > Number(item.product.stock || 0)
    ));

    const onChange = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!cart.items.length) {
            toast.error('Carrinho vazio');
            navigate('/');
            return;
        }
        if (hasUnavailableItems) {
            toast.error('Revise os itens do carrinho antes de finalizar');
            navigate('/cart');
            return;
        }

        setProcessing(true);
        try {
            const { notes, ...shipping } = form;
            await api.post('/orders', { shipping_address: shipping, notes });
            await reload();
            toast.success('Pedido criado! Você pode acompanhá-lo em "Meus pedidos".');
            navigate('/orders');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao finalizar o pedido');
        } finally {
            setProcessing(false);
        }
    };

    if (cartLoading) {
        return (
            <div className="container-page py-12">
                <div className="flex items-center gap-3 rounded-[24px] border border-stone-200 bg-white p-6 text-slate-500 shadow-card">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-700" />
                    Carregando carrinho...
                </div>
            </div>
        );
    }

    if (!cart.items.length) {
        return (
            <div className="container-page py-12 text-center">
                <p className="text-slate-600">Seu carrinho está vazio.</p>
                <button className="btn-primary mt-4" onClick={() => navigate('/')}>Voltar à loja</button>
            </div>
        );
    }

    return (
        <div className="container-page grid gap-6 py-8 md:grid-cols-3">
            <form onSubmit={handleSubmit} className="card space-y-4 p-6 md:col-span-2">
                <h1 className="text-xl font-bold">Endereço de entrega</h1>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                        <label className="label">Rua</label>
                        <input name="street" className="input" required value={form.street} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Número</label>
                        <input name="number" className="input" value={form.number} onChange={onChange} />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label">Complemento</label>
                        <input name="complement" className="input" value={form.complement} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Bairro</label>
                        <input name="district" className="input" value={form.district} onChange={onChange} />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                        <label className="label">Cidade</label>
                        <input name="city" className="input" required value={form.city} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Estado</label>
                        <input
                            name="state"
                            className="input uppercase"
                            required
                            maxLength={2}
                            value={form.state}
                            onChange={(e) => setForm((current) => ({ ...current, state: e.target.value.toUpperCase() }))}
                        />
                    </div>
                </div>
                <div>
                    <label className="label">CEP</label>
                    <input name="zip" className="input" required value={form.zip} onChange={onChange} />
                </div>
                <div>
                    <label className="label">Observações</label>
                    <textarea name="notes" rows={3} className="textarea rounded-[22px]" value={form.notes} onChange={onChange} />
                </div>

                <div className="border-t pt-2">
                    <h2 className="mb-2 font-semibold">Pagamento</h2>
                    <div className="rounded-[20px] border border-stone-200 bg-slate-50 p-4 text-sm text-slate-600">
                        O pedido será criado com status <span className="badge-yellow ml-1">pendente</span>.
                        A confirmação de pagamento será registrada assim que a transação for aprovada.
                    </div>
                </div>

                {hasUnavailableItems && (
                    <div className="flex gap-2 rounded-[18px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        Ajuste ou remova itens indisponíveis no carrinho antes de finalizar.
                    </div>
                )}

                <button type="submit" disabled={processing || hasUnavailableItems} className="btn-primary w-full py-3 text-base">
                    {processing ? 'Processando...' : `Confirmar pedido · ${formatPrice(cart.total)}`}
                </button>
            </form>

            <div className="card h-fit p-6">
                <h2 className="mb-4 font-semibold">Resumo</h2>
                <div className="space-y-2 text-sm">
                    {cart.items.map((item) => (
                        <div key={item.id} className="flex justify-between gap-3">
                            <span className="min-w-0 truncate">{item.quantity}× {item.product.name}</span>
                            <span className="shrink-0 font-semibold">{formatPrice(item.subtotal)}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-between border-t pt-3">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">{formatPrice(cart.total)}</span>
                </div>
            </div>
        </div>
    );
}
