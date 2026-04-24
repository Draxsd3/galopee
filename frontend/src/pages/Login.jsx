import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email.trim(), password);
            toast.success(`Bem-vindo, ${user.name}!`);

            const next = searchParams.get('next')
                || (user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/');
            navigate(next, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao entrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="container-page py-8 lg:py-12">
            <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] border border-white bg-white shadow-card lg:grid-cols-[0.95fr_1.05fr]">
                <div className="relative hidden min-h-[620px] overflow-hidden bg-brand-900 lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1524486361537-8ad15938e1a3?auto=format&fit=crop&w=1400&q=80"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 via-brand-900/62 to-brand-800/20" />
                    <div className="absolute inset-x-8 bottom-8 text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-200">
                            Galoppe
                        </p>
                        <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight">
                            Uma conta para comprar, vender e gerenciar tudo.
                        </h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                            Entre uma vez e acesse marketplace, pedidos, carrinho e painel da loja quando sua conta tiver uma loja ativa.
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-12">
                    <div className="mx-auto max-w-md">
                        <Link to="/" className="block text-center font-display text-4xl leading-none text-brand-700 lg:hidden">
                            Galoppe
                        </Link>

                        <div className="mt-8 text-center lg:mt-0 lg:text-left">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Entrar</p>
                            <h2 className="mt-3 text-3xl font-extrabold text-slate-950">Acesse sua conta</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Use seu e-mail e senha para continuar.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label className="label" htmlFor="email">E-mail</label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        className="input pl-11"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="voce@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label" htmlFor="password">Senha</label>
                                <div className="relative">
                                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        autoComplete="current-password"
                                        className="input pl-11 pr-12"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Sua senha"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((value) => !value)}
                                        className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                                {loading ? 'Entrando...' : 'Entrar'}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-sm text-slate-600">
                            Ainda não tem conta?{' '}
                            <Link to="/register" className="font-extrabold text-brand-700 hover:text-brand-800">
                                Criar conta
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
