import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SellerProducts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        api.get('/products/mine')
            .then(({ data }) => setItems(data.items || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Remover este produto?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Produto removido');
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao remover');
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Meus produtos</h1>
                <Link to="/seller/products/new" className="btn-primary">
                    <Plus className="w-4 h-4" /> Novo produto
                </Link>
            </div>

            {loading ? (
                <div className="text-slate-500">Carregando...</div>
            ) : items.length === 0 ? (
                <div className="card p-12 text-center text-slate-500">
                    Você ainda não cadastrou produtos.
                    <div className="mt-4">
                        <Link to="/seller/products/new" className="btn-primary">Cadastrar o primeiro</Link>
                    </div>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-600 text-left">
                            <tr>
                                <th className="px-4 py-3">Produto</th>
                                <th className="px-4 py-3">Categoria</th>
                                <th className="px-4 py-3">Preço</th>
                                <th className="px-4 py-3">Estoque</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden shrink-0">
                                                {p.image_url && <img src={p.image_url} alt="" className="w-full h-full object-cover" />}
                                            </div>
                                            <div className="font-medium">{p.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{p.category || '—'}</td>
                                    <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}</td>
                                    <td className="px-4 py-3">{p.stock}</td>
                                    <td className="px-4 py-3">
                                        {p.active ? <span className="badge-green">ativo</span> : <span className="badge-slate">inativo</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link to={`/seller/products/${p.id}/edit`} className="btn-ghost">
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(p.id)} className="btn-ghost text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
