import { useEffect, useState } from 'react';
import api from '../services/api';
import { formatPrice, formatDate, statusLabels, statusBadgeClass, paymentLabels } from '../utils/format';

export default function BuyerOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/mine')
            .then(({ data }) => setOrders(data.items || []))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container-page py-8">
            <h1 className="text-2xl font-bold mb-6">Meus pedidos</h1>

            {loading ? (
                <div className="text-slate-500">Carregando...</div>
            ) : orders.length === 0 ? (
                <div className="card p-12 text-center text-slate-500">Você ainda não possui pedidos.</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((o) => (
                        <div key={o.id} className="card p-5">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                                <div>
                                    <div className="font-semibold">Pedido #{o.id}</div>
                                    <div className="text-xs text-slate-500">{formatDate(o.created_at)} · Vendido por {o.store_name}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={statusBadgeClass(o.status)}>{statusLabels[o.status]}</span>
                                    <span className="badge-slate">Pagamento: {paymentLabels[o.payment_status]}</span>
                                </div>
                                <div className="font-bold text-lg">{formatPrice(o.total_amount)}</div>
                            </div>
                            <div className="border-t pt-3 text-sm space-y-1">
                                {(o.items || []).map((it) => (
                                    <div key={it.id} className="flex justify-between">
                                        <span>{it.quantity}× {it.product_name}</span>
                                        <span className="text-slate-600">{formatPrice(it.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                            {o.tracking_code && (
                                <div className="mt-3 text-sm">
                                    <span className="text-slate-500">Rastreio: </span>
                                    <span className="font-mono font-semibold">{o.tracking_code}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
