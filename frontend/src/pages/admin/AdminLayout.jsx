import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Store, ClipboardList } from 'lucide-react';

const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-brand-100 text-brand-800' : 'text-slate-600 hover:bg-slate-100'
    }`;

export default function AdminLayout() {
    return (
        <div className="container-page py-8 grid md:grid-cols-[220px_1fr] gap-6">
            <aside className="card p-3 h-fit sticky top-20">
                <div className="px-3 py-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Administração</div>
                <nav className="space-y-1">
                    <NavLink to="/admin" end className={linkClass}><LayoutDashboard className="w-4 h-4" /> Visão geral</NavLink>
                    <NavLink to="/admin/users" className={linkClass}><Users className="w-4 h-4" /> Usuários</NavLink>
                    <NavLink to="/admin/sellers" className={linkClass}><Store className="w-4 h-4" /> Vendedores</NavLink>
                    <NavLink to="/admin/orders" className={linkClass}><ClipboardList className="w-4 h-4" /> Pedidos</NavLink>
                </nav>
            </aside>
            <section><Outlet /></section>
        </div>
    );
}
