import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice, formatDate, statusLabels, statusBadgeClass } from '../../utils/format';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get('/orders/sales')
            .then(({ data }) => setOrders(data.items || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            toast.success('Status atualizado');
            load();
        } catch {
            toast.error('Falha ao atualizar');
        }
    };

    const setTracking = async (id) => {
        const tracking_code = prompt('Código de rastreio:');
        if (!tracking_code) return;
        try {
            await api.patch(`/orders/${id}/status`, { tracking_code, status: 'shipped' });
            toast.success('Pedido marcado como enviado');
            load();
        } catch { toast.error('Falha ao atualizar'); }
    };

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Pedidos recebidos</h1>

            {loading ? (
                <div className="text-slate-500">Carregando...</div>
            ) : orders.length === 0 ? (
                <div className="card p-12 text-center text-slate-500">Você ainda não recebeu pedidos.</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => (
                        <div key={o.id} className="card p-5">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                <div>
                                    <div className="font-semibold">Pedido #{o.id}</div>
                                    <div className="text-xs text-slate-500">
                                        {formatDate(o.created_at)} · Comprador: {o.buyer_name} ({o.buyer_email})
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={statusBadgeClass(o.status)}>{statusLabels[o.status]}</span>
                                </div>
                                <div className="font-bold text-lg">{formatPrice(o.total_amount)}</div>
                            </div>
                            <div className="border-t pt-3 text-sm space-y-1 mb-3">
                                {(o.items || []).map((it) => (
                                    <div key={it.id} className="flex justify-between">
                                        <span>{it.quantity}× {it.product_name}</span>
                                        <span className="text-slate-600">{formatPrice(it.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                            {o.shipping_address && (
                                <div className="text-xs text-slate-500 mb-3">
                                    Endereço: {o.shipping_address.street}, {o.shipping_address.number || 's/n'} — {o.shipping_address.city}/{o.shipping_address.state}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <select
                                    defaultValue={o.status}
                                    onChange={(e) => updateStatus(o.id, e.target.value)}
                                    className="select max-w-[200px]"
                                >
                                    {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{statusLabels[s]}</option>
                                    ))}
                                </select>
                                <button onClick={() => setTracking(o.id)} className="btn-secondary">
                                    Adicionar rastreio
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
