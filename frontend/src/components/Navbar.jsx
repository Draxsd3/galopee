import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ChevronDown, Search, ShoppingCart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const navPillClass = 'whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-brand-50 hover:text-brand-800 md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent';

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
    const hideMobileSellCta = user?.role === 'seller' || user?.role === 'admin';

    const activeNavClass = ({ isActive }) => (
        `${navPillClass} ${isActive ? 'bg-brand-50 text-brand-800 md:bg-transparent' : ''}`
    );

    return (
        <header className="sticky top-0 z-30 border-b border-stone-200 bg-white shadow-sm">
            <div className="container-page py-2.5 md:py-3">
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="grid grid-cols-[1fr_auto] items-center gap-3 xl:grid-cols-[220px_minmax(0,1fr)_320px] xl:gap-4">
                        <Link to="/" className="flex min-w-0 items-center justify-start gap-3 text-brand-900">
                            <div className="min-w-0">
                                <div className="font-display text-3xl leading-none text-brand-700 md:text-4xl">Galopee</div>
                                <div className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 md:text-[11px]">
                                    Marketplace
                                </div>
                            </div>
                        </Link>

                        <form
                            onSubmit={handleSearch}
                            className="order-3 col-span-2 mx-auto flex w-full max-w-[760px] overflow-hidden rounded-full border border-accent-300 bg-white shadow-sm xl:order-none xl:col-span-1"
                        >
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="min-w-0 flex-1 px-4 py-2.5 text-sm text-slate-800 outline-none md:px-5 md:py-3 md:text-base"
                                placeholder="Buscar produtos, marcas..."
                            />
                            <button
                                type="submit"
                                className="inline-flex w-12 items-center justify-center bg-accent-500 text-white transition-colors hover:bg-accent-600 md:w-16"
                                aria-label="Buscar"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </form>

                        <div className="order-2 flex items-center justify-end gap-2 text-brand-700 xl:order-none">
                            {!user ? (
                                <>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center rounded-full border border-stone-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 md:text-sm"
                                    >
                                        Entrar
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="hidden items-center rounded-full bg-brand-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-brand-800 sm:inline-flex md:text-sm"
                                    >
                                        Criar conta
                                    </Link>
                                </>
                            ) : (
                                <div className="relative" ref={menuRef}>
                                    <button
                                        type="button"
                                        onClick={() => setMenuOpen((v) => !v)}
                                        className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-700 transition hover:border-brand-200 hover:bg-brand-50 md:gap-2 md:px-3 md:py-2"
                                        aria-haspopup="menu"
                                        aria-expanded={menuOpen}
                                    >
                                        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs text-brand-800 md:text-sm">
                                            {getInitials(user.name)}
                                        </span>
                                        <span className="hidden max-w-[140px] truncate md:inline">
                                            {user.name.split(' ')[0]}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 transition ${menuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {menuOpen && (
                                        <div
                                            role="menu"
                                            className="absolute right-0 top-full z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl"
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
                                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700 transition hover:bg-brand-100"
                                aria-label={`Carrinho com ${itemCount} item(s)`}
                            >
                                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                                {itemCount > 0 && (
                                    <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    <div className="border-t border-stone-200 pt-2 md:pt-3">
                        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                            <nav className="flex min-w-max flex-1 items-center gap-1 text-sm font-semibold text-brand-700 md:gap-8">
                                <NavLink to="/" end className={activeNavClass}>Inicio</NavLink>
                                <Link to="/" className={navPillClass}>Produtos</Link>
                                <Link to="/" className={navPillClass}>Categorias</Link>
                                <NavLink to="/stores" className={activeNavClass}>Lojas</NavLink>
                                {user?.role === 'admin' && (
                                    <NavLink to="/admin" className={activeNavClass}>Admin</NavLink>
                                )}
                                {['buyer', 'seller'].includes(user?.role) && (
                                    <NavLink to="/orders" className={activeNavClass}>Meus pedidos</NavLink>
                                )}
                                {user?.role === 'seller' && (
                                    <NavLink to="/seller" className={activeNavClass}>Minha loja</NavLink>
                                )}
                            </nav>

                            <Link
                                to={sellHref}
                                className={`${hideMobileSellCta ? 'hidden md:inline-flex' : 'inline-flex'} shrink-0 items-center rounded-full bg-accent-500 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-accent-600 md:rounded-xl md:px-6 md:py-3 md:text-sm`}
                            >
                                {sellLabel}
                            </Link>
                        </div>
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
     