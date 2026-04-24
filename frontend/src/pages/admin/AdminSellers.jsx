import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/format';
import { Check } from 'lucide-react';

export default function AdminSellers() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get('/admin/sellers').then(({ data }) => setItems(data.items)); }, []);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Vendedores</h1>
            <div className="card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-left">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Loja</th>
                            <th className="px-4 py-3">Slug</th>
                            <th className="px-4 py-3">Responsável</th>
                            <th className="px-4 py-3">E-mail</th>
                            <th className="px-4 py-3">Cadastro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((s) => (
                            <tr key={s.id}>
                                <td className="px-4 py-3 text-slate-400">{s.id}</td>
                                <td className="px-4 py-3 font-medium flex items-center gap-1">
                                    {s.store_name} {s.verified && <Check className="w-4 h-4 text-brand-600" strokeWidth={3} />}
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{s.store_slug}</td>
                                <td className="px-4 py-3">{s.user_name}</td>
                                <td className="px-4 py-3">{s.user_email}</td>
                                <td className="px-4 py-3 text-slate-500">{formatDate(s.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
