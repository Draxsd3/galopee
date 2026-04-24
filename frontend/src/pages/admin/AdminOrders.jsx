import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatPrice, formatDate, statusLabels, statusBadgeClass } from '../../utils/format';

export default function AdminOrders() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get('/admin/orders').then(({ data }) => setItems(data.items)); }, []);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Todos os pedidos</h1>
            <div className="card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-left">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Comprador</th>
                            <th className="px-4 py-3">Vendedor</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((o) => (
                            <tr key={o.id}>
                                <td className="px-4 py-3 text-slate-400">{o.id}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium">{o.buyer_name}</div>
                                    <div className="text-xs text-slate-500">{o.buyer_email}</div>
                                </td>
                                <td className="px-4 py-3">{o.store_name}</td>
                                <td className="px-4 py-3 font-semibold">{formatPrice(o.total_amount)}</td>
                                <td className="px-4 py-3"><span className={statusBadgeClass(o.status)}>{statusLabels[o.status]}</span></td>
                                <td className="px-4 py-3 text-slate-500">{formatDate(o.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
