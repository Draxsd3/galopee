import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirm: '',
        acceptedTerms: false,
    });

    const update = (patch) => setForm((current) => ({ ...current, ...patch }));

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (form.name.trim().length < 2) {
            toast.error('Informe seu nome completo.');
            return;
        }
        if (form.password.length < 6) {
            toast.error('A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        if (form.password !== form.passwordConfirm) {
            toast.error('As senhas não coincidem.');
            return;
        }
        if (!form.acceptedTerms) {
            toast.error('Aceite os termos para continuar.');
            return;
        }

        try {
            setLoading(true);
            await register({
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim() || undefined,
                password: form.password,
            });
            toast.success('Conta criada com sucesso!');
            navigate('/', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Erro ao cadastrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="container-page py-8 lg:py-12">
            <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[30px] border border-white bg-white shadow-card lg:grid-cols-[1.05fr_0.95fr]">
                <div className="p-6 sm:p-8 lg:p-12">
                    <div className="mx-auto max-w-xl">
                        <Link to="/" className="block text-center font-display text-4xl leading-none text-brand-700 lg:hidden">
                            Galoppe
                        </Link>

                        <div className="mt-8 lg:mt-0">
                            <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Cadastro</p>
                            <h1 className="mt-3 text-3xl font-extrabold text-slate-950">Crie sua conta</h1>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Uma conta única para comprar e, quando quiser, criar sua loja para vender.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                            <div>
                                <label className="label" htmlFor="name">Nome completo</label>
                                <div className="relative">
                                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="name"
                                        className="input pl-11"
                                        value={form.name}
                                        onChange={(e) => update({ name: e.target.value })}
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="label" htmlFor="email">E-mail</label>
                                    <div className="relative">
                                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="email"
                                            type="email"
                                            className="input pl-11"
                                            value={form.email}
                                            onChange={(e) => update({ email: e.target.value })}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="label" htmlFor="phone">Telefone <span className="font-normal text-slate-400">(opcional)</span></label>
                                    <div className="relative">
                                        <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="phone"
                                            type="tel"
                                            className="input pl-11"
                                            value={form.phone}
                                            onChange={(e) => update({ phone: e.target.value })}
                                            autoComplete="tel"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="label" htmlFor="password">Senha</label>
                                    <div className="relative">
                                        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="input pl-11 pr-12"
                                            value={form.password}
                                            onChange={(e) => update({ password: e.target.value })}
                                            autoComplete="new-password"
                                            required
                                            minLength={6}
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
                                <div>
                                    <label className="label" htmlFor="passwordConfirm">Confirmar senha</label>
                                    <input
                                        id="passwordConfirm"
                                        type={showPassword ? 'text' : 'password'}
                                        className="input"
                                        value={form.passwordConfirm}
                                        onChange={(e) => update({ passwordConfirm: e.target.value })}
                                        autoComplete="new-password"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 shrink-0 accent-brand-700"
                                    checked={form.acceptedTerms}
                                    onChange={(e) => update({ acceptedTerms: e.target.checked })}
                                />
                                <span>
                                    Li e aceito os Termos de Uso e a Política de Privacidade do Galoppe.
                                </span>
                            </label>

                            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                                {loading ? 'Criando conta...' : 'Criar conta'}
                                {!loading && <ArrowRight className="h-4 w-4" />}
                            </button>
                        </form>

                        <p className="mt-7 text-center text-sm text-slate-600">
                            Já tem conta?{' '}
                            <Link to="/login" className="font-extrabold text-brand-700 hover:text-brand-800">
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="relative hidden min-h-[660px] overflow-hidden bg-brand-900 lg:block">
                    <img
                        src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/88 via-brand-900/58 to-transparent" />
                    <div className="absolute inset-x-8 bottom-8 text-white">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent-200">
                            Conta única
                        </p>
                        <h2 className="mt-4 max-w-md text-4xl font-extrabold leading-tight">
                            Comece comprando. Abra sua loja quando estiver pronto.
                        </h2>
                        <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
                            Depois do cadastro, o menu de perfil permite criar uma loja e acessar o painel de produtos, pedidos e dados comerciais.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
