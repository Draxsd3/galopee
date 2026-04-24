import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useEffect, useRef, useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { itemCount } = useCart();
    const [query, setQuery] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function onClick(e) {
            if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
        }
        if (menuOpen) document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [menuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = query.trim();
        navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
    };

    const sellHref = !user
        ? '/register'
        : user.role === 'buyer'
            ? '/profile?tab=seller'
            : user.role === 'seller'
                ? '/seller'
                : '/admin';
    const sellLabel = user?.role === 'seller'
        ? 'Minha loja'
        : user?.role === 'admin'
            ? 'Admin'
            : 'Vender';

    return (
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white shadow-sm">
            <div className="container-page py-3">
                <div className="flex flex-col gap-4">
                    <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:items-center">
                        <Link to="/" className="flex items-center justify-center gap-3 text-brand-900 xl:justify-start">
                            <div className="text-center xl:text-left">
                                <div className="font-display text-4xl leading-none text-brand-700">Galoppe</div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Marketplace agro</div>
                            </div>
                        </Link>

                        <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-[760px] overflow-hidden rounded-2xl border border-accent-400 bg-white">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="min-w-0 flex-1 px-5 py-3 text-base text-slate-800 outline-none"
                                placeholder="Encontre produtos, marcas e muito mais..."
                            />
                            <button
                                type="submit"
                                className="inline-flex w-16 items-center justify-center bg-accent-500 text-white transition-colors hover:bg-accent-600"
                                aria-label="Buscar"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-brand-700 xl:flex-nowrap xl:justify-end">
                            {!user ? (
                                <>
                                    <Link to="/register" className="font-bold whitespace-nowrap hover:text-brand-800">
                                        Cadastre-se
                                    </Link>
                                    <Link to="/login" className="font-bold whitespace-nowrap hover:text-brand-800">
                                        Entrar
                                    </Link>
                                </>
                            ) : (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setMenuOpen((v) => !v)}
                                        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50"
                                        aria-haspopup="menu"
                                        aria-expanded={menuOpen}
                                    >
                                        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-800">
                                            {getInitials(user.name)}
                                        </span>
                                        <span className="hidden max-w-[140px] truncate sm:inline">
                                            {user.name.split(' ')[0]}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {menuOpen && (
                                        <div
                                            role="menu"
                                            className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
                                        >
                                            <div className="border-b border-stone-100 px-4 py-3">
                                                <p className="truncate text-sm font-extrabold text-slate-900">{user.name}</p>
                                                <p className="truncate text-xs text-slate-500">{user.email}</p>
                                            </div>
                                            <DropdownLink to="/profile" onClick={() => setMenuOpen(false)}>
                                                Meu perfil
                                            </DropdownLink>
                                            {['buyer', 'seller'].includes(user.role) && (
                                                <DropdownLink to="/orders" onClick={() => setMenuOpen(false)}>
                                                    Meus pedidos
                                                </DropdownLink>
                                            )}
                                            {user.role === 'seller' && (
                                                <DropdownLink to="/seller" onClick={() => setMenuOpen(false)}>
                                                    Painel da loja
                                                </DropdownLink>
                                            )}
                                            {user.role === 'admin' && (
                                                <DropdownLink to="/admin" onClick={() => setMenuOpen(false)}>
                                                    Painel admin
                                                </DropdownLink>
                                            )}
                                            {user.role === 'buyer' && (
                                                <Link
                                                    to="/profile?tab=seller"
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block border-t border-stone-100 px-4 py-3 text-sm font-semibold text-accent-700 hover:bg-accent-50"
                                                    role="menuitem"
                                                >
                                                    Quero vender
                                                </Link>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}
                                                className="block w-full border-t border-stone-100 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                                                role="menuitem"
                                            >
                                                Sair
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <Link
                                to="/cart"
                                className="relative inline-flex items-center justify-center text-brand-700"
                                aria-label={`Carrinho com ${itemCount} item(s)`}
                            >
                                <ShoppingCart className="h-7 w-7" />
                                {itemCount > 0 && (
                                    <span className="absolute -right-2 -top-2 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-stone-200 pt-3 text-brand-700">
                        <nav className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold md:gap-x-8">
                            <NavLink to="/" end className="hover:text-brand-800">Início</NavLink>
                            <Link to="/" className="hover:text-brand-800">Produtos</Link>
                            <Link to="/" className="hover:text-brand-800">Categorias</Link>
                            <NavLink to="/stores" className="hover:text-brand-800">Lojas</NavLink>
                            {user?.role === 'admin' && (
                                <NavLink to="/admin" className="hover:text-brand-800">Admin</NavLink>
                            )}
                            {['buyer', 'seller'].includes(user?.role) && (
                                <NavLink to="/orders" className="hover:text-brand-800">Meus pedidos</NavLink>
                            )}
                            {user?.role === 'seller' && (
                                <NavLink to="/seller" className="hover:text-brand-800">Minha loja</NavLink>
                            )}
                        </nav>

                        <Link to={sellHref} className="btn-accent ml-auto shrink-0 rounded-xl px-6 py-3">
                            {sellLabel}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

function DropdownLink({ to, onClick, children }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-stone-50"
            role="menuitem"
        >
            {children}
        </Link>
    );
}

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
