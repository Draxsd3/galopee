import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatPrice } from '../../utils/format';

function Stat({ label, value }) {
    return (
        <div className="rounded-[22px] border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
            <div className="mt-2 text-2xl font-extrabold text-slate-950">{value}</div>
        </div>
    );
}

export default function SellerDashboard() {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        setLoading(true);
        Promise.all([
            api.get('/products/mine'),
            api.get('/orders/sales'),
            api.get('/sellers/me'),
        ])
            .then(([productsRes, ordersRes, storeRes]) => {
                if (!active) return;
                const products = productsRes.data.items || [];
                const orders = ordersRes.data.items || [];
                const revenue = orders.reduce((acc, it) => acc + Number(it.total_amount), 0);
                setStats({ products: products.length, orders: orders.length, revenue });
                setStore(storeRes.data);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Painel da loja</p>
                <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
                    {store?.store_name || 'Sua loja'}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                    Cadastre produtos, acompanhe pedidos e mantenha sua loja atualizada.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <Stat label="Produtos" value={loading ? '...' : stats.products} />
                <Stat label="Pedidos" value={loading ? '...' : stats.orders} />
                <Stat label="Faturamento" value={loading ? '...' : formatPrice(stats.revenue)} />
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-950">O que você quer fazer?</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <Link to="/seller/products/new" className="rounded-[20px] border border-stone-200 p-5 transition hover:border-brand-300 hover:bg-brand-50">
                        <span className="block text-base font-extrabold text-slate-950">Criar produto</span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">Adicione preço, estoque, categoria e imagem.</span>
                    </Link>
                    <Link to="/seller/products" className="rounded-[20px] border border-stone-200 p-5 transition hover:border-brand-300 hover:bg-brand-50">
                        <span className="block text-base font-extrabold text-slate-950">Gerenciar produtos</span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">Edite, ative, desative ou remova itens.</span>
                    </Link>
                    <Link to="/seller/store" className="rounded-[20px] border border-stone-200 p-5 transition hover:border-brand-300 hover:bg-brand-50">
                        <span className="block text-base font-extrabold text-slate-950">Atualizar loja</span>
                        <span className="mt-2 block text-sm leading-6 text-slate-500">Altere nome, descrição, logo e banner.</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
