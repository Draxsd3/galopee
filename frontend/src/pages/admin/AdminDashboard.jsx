import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Users, Store, Package, ClipboardList, DollarSign } from 'lucide-react';
import { formatPrice } from '../../utils/format';

function Stat({ icon: Icon, label, value, accent }) {
    return (
        <div className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg grid place-items-center ${accent}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [m, setM] = useState(null);

    useEffect(() => { api.get('/admin/metrics').then(({ data }) => setM(data)); }, []);

    if (!m) return <div className="text-slate-500">Carregando métricas...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Visão geral</h1>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Stat icon={Users}         label="Usuários"      value={m.total_users}    accent="bg-blue-100 text-blue-700" />
                <Stat icon={Store}         label="Vendedores"    value={m.total_sellers}  accent="bg-brand-100 text-brand-700" />
                <Stat icon={Package}       label="Produtos"      value={m.total_products} accent="bg-amber-100 text-amber-700" />
                <Stat icon={ClipboardList} label="Pedidos"       value={m.total_orders}   accent="bg-purple-100 text-purple-700" />
                <Stat icon={DollarSign}    label="GMV"           value={formatPrice(m.gmv)} accent="bg-emerald-100 text-emerald-700" />
            </div>
        </div>
    );
}
