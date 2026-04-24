import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatDate } from '../../utils/format';

export default function AdminUsers() {
    const [items, setItems] = useState([]);
    useEffect(() => { api.get('/admin/users').then(({ data }) => setItems(data.items)); }, []);

    return (
        <div className="space-y-5">
            <h1 className="text-2xl font-bold">Usuários</h1>
            <div className="card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-left">
                        <tr>
                            <th className="px-4 py-3">#</th>
                            <th className="px-4 py-3">Nome</th>
                            <th className="px-4 py-3">E-mail</th>
                            <th className="px-4 py-3">Papel</th>
                            <th className="px-4 py-3">Cadastro</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((u) => (
                            <tr key={u.id}>
                                <td className="px-4 py-3 text-slate-400">{u.id}</td>
                                <td className="px-4 py-3 font-medium">{u.name}</td>
                                <td className="px-4 py-3">{u.email}</td>
                                <td className="px-4 py-3">
                                    <span className={
                                        u.role === 'admin' ? 'badge-red' :
                                        u.role === 'seller' ? 'badge-blue' : 'badge-green'
                                    }>{u.role}</span>
                                </td>
                                <td className="px-4 py-3 text-slate-500">{formatDate(u.created_at)}</td>
                                <td className="px-4 py-3">
                                    {u.active ? <span className="badge-green">ativo</span> : <span className="badge-slate">inativo</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
