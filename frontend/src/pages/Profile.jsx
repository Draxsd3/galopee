import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ADDRESS_PREFIX = 'galoppe.addresses.';
const PAYMENT_PREFIX = 'galoppe.payments.';
const VALID_TABS = new Set(['overview', 'personal', 'security', 'addresses', 'payments', 'seller']);

const tabs = [
    { key: 'overview', label: 'Visão geral' },
    { key: 'personal', label: 'Dados pessoais' },
    { key: 'security', label: 'Segurança' },
    { key: 'addresses', label: 'Endereços' },
    { key: 'payments', label: 'Pagamentos' },
];

function readList(key) {
    try {
        const raw = localStorage.getItem(key);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}

function getInitials(name = '') {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatMonthYear(value) {
    try {
        return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(value));
    } catch {
        return null;
    }
}

export default function Profile() {
    const { user, updateProfile, becomeSeller } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialTab = searchParams.get('tab');
    const [tab, setTab] = useState(VALID_TABS.has(initialTab) ? initialTab : 'overview');

    const initials = useMemo(() => getInitials(user?.name), [user?.name]);
    const roleLabel = user?.role === 'admin' ? 'Administrador' : user?.role === 'seller' ? 'Vendedor' : 'Cliente';
    const memberSince = user?.created_at ? formatMonthYear(user.created_at) : null;

    useEffect(() => {
        if (tab === 'seller' && user && user.role !== 'buyer') {
            setTab('overview');
            return;
        }

        const current = searchParams.get('tab') || 'overview';
        if (current !== tab) {
            const next = new URLSearchParams(searchParams);
            if (tab === 'overview') next.delete('tab');
            else next.set('tab', tab);
            setSearchParams(next, { replace: true });
        }
    }, [tab, user, searchParams, setSearchParams]);

    if (!user) {
        return <div className="container-page py-12 text-center text-slate-500">Carregando perfil...</div>;
    }

    return (
        <div className="bg-stone-50">
            <header className="border-b border-stone-200 bg-white">
                <div className="container-page py-8">
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-700 text-lg font-extrabold text-white">
                                {initials}
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">Minha conta</p>
                                <h1 className="mt-1 truncate text-2xl font-extrabold text-slate-950 md:text-3xl">{user.name}</h1>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                    <span>{user.email}</span>
                                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-600">
                                        {roleLabel}
                                    </span>
                                    {memberSince && <span className="text-xs">Membro desde {memberSince}</span>}
                                </div>
                            </div>
                        </div>

                        {(user.role === 'seller' || user.role === 'admin') && (
                            <Link to={user.role === 'admin' ? '/admin' : '/seller'} className="btn-primary w-fit rounded-xl px-5 py-2.5">
                                {user.role === 'admin' ? 'Abrir admin' : 'Abrir loja'}
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="container-page py-8">
                <div className="grid min-w-0 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
                    <aside className="h-fit min-w-0 max-w-full overflow-hidden rounded-[24px] border border-stone-200 bg-white p-2 shadow-sm">
                        <nav className="flex max-w-full gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                            {tabs.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => setTab(item.key)}
                                    className={`whitespace-nowrap rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                                        tab === item.key
                                            ? 'bg-brand-50 text-brand-800'
                                            : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                            {user.role === 'buyer' && (
                                <button
                                    type="button"
                                    onClick={() => setTab('seller')}
                                    className={`whitespace-nowrap rounded-[18px] px-4 py-3 text-left text-sm font-semibold transition ${
                                        tab === 'seller'
                                            ? 'bg-accent-50 text-accent-800'
                                            : 'text-slate-600 hover:bg-stone-50 hover:text-slate-900'
                                    }`}
                                >
                                    Vender no Galopee
                                </button>
                            )}
                        </nav>
                    </aside>

                    <main className="min-w-0 max-w-full">
                        {tab === 'overview' && <OverviewTab user={user} setTab={setTab} />}
                        {tab === 'personal' && <PersonalTab user={user} updateProfile={updateProfile} />}
                        {tab === 'security' && <SecurityTab user={user} />}
                        {tab === 'addresses' && <AddressesTab userId={user.id} />}
                        {tab === 'payments' && <PaymentsTab userId={user.id} />}
                        {tab === 'seller' && (
                            <SellerTab
                                user={user}
                                becomeSeller={becomeSeller}
                                navigate={navigate}
                                setTab={setTab}
                            />
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

function Panel({ title, description, children, actions }) {
    return (
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
                    {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
                </div>
                {actions}
            </div>
            <div className="mt-6">{children}</div>
        </section>
    );
}

function OverviewTab({ user, setTab }) {
    const addresses = readList(ADDRESS_PREFIX + user.id);
    const payments = readList(PAYMENT_PREFIX + user.id);
    const firstName = user.name?.split(' ')[0] || 'Olá';

    return (
        <div className="space-y-6">
            <Panel
                title={`${firstName}, sua conta está pronta.`}
                description="Gerencie dados pessoais, endereços e pagamentos em uma tela simples."
                actions={user.role === 'buyer' && (
                    <button type="button" onClick={() => setTab('seller')} className="btn-accent rounded-xl px-5 py-2.5">
                        Abrir loja
                    </button>
                )}
            >
                <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryButton label="Endereços" value={addresses.length} onClick={() => setTab('addresses')} />
                    <SummaryButton label="Pagamentos" value={payments.length} onClick={() => setTab('payments')} />
                    <Link to={user.role === 'seller' ? '/seller/orders' : '/orders'} className="rounded-[20px] border border-stone-200 p-4 transition hover:border-brand-300">
                        <span className="block text-sm text-slate-500">Pedidos</span>
                        <span className="mt-2 block text-2xl font-extrabold text-slate-950">Ver</span>
                    </Link>
                </div>
            </Panel>

            <Panel title="Resumo" description="Informações principais da sua conta.">
                <dl className="grid gap-4 md:grid-cols-2">
                    <Info label="Nome" value={user.name} />
                    <Info label="E-mail" value={user.email} />
                    <Info label="Telefone" value={user.phone || 'Não informado'} />
                    <Info label="Acesso" value={user.role === 'seller' ? 'Cliente e vendedor' : user.role === 'admin' ? 'Administrador' : 'Cliente'} />
                    {user.store_name && <Info label="Loja" value={user.store_name} />}
                    {memberText(user.created_at) && <Info label="Desde" value={memberText(user.created_at)} />}
                </dl>
            </Panel>
        </div>
    );
}

function SummaryButton({ label, value, onClick }) {
    return (
        <button type="button" onClick={onClick} className="rounded-[20px] border border-stone-200 p-4 text-left transition hover:border-brand-300">
            <span className="block text-sm text-slate-500">{label}</span>
            <span className="mt-2 block text-2xl font-extrabold text-slate-950">{value}</span>
        </button>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-[18px] bg-stone-50 px-4 py-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
        </div>
    );
}

function memberText(createdAt) {
    const formatted = createdAt ? formatMonthYear(createdAt) : null;
    return formatted ? `Membro desde ${formatted}` : null;
}

function PersonalTab({ user, updateProfile }) {
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [saving, setSaving] = useState(false);
    const dirty = name.trim() !== user.name || phone !== (user.phone || '');

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!dirty) return;
        setSaving(true);
        try {
            await updateProfile({ name: name.trim(), phone });
            toast.success('Dados atualizados');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Não foi possível salvar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Panel title="Dados pessoais" description="Essas informações aparecem em pedidos e no atendimento.">
            <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                    <label className="label" htmlFor="profile-name">Nome completo</label>
                    <input id="profile-name" className="input" value={name} onChange={(e) => setName(e.target.value)} minLength={2} required />
                </div>
                <div>
                    <label className="label" htmlFor="profile-email">E-mail</label>
                    <input id="profile-email" className="input bg-stone-50 text-slate-500" value={user.email} disabled />
                </div>
                <div>
                    <label className="label" htmlFor="profile-phone">Telefone</label>
                    <input id="profile-phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
                </div>
                <div className="md:col-span-2">
                    <button type="submit" disabled={!dirty || saving} className="btn-primary rounded-xl px-5 py-2.5">
                        {saving ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </div>
            </form>
        </Panel>
    );
}

function SecurityTab({ user }) {
    return (
        <Panel title="Segurança" description="Configurações de acesso da sua conta.">
            <div className="space-y-3">
                <div className="rounded-[20px] border border-stone-200 p-4">
                    <div className="text-sm font-bold text-slate-950">E-mail de acesso</div>
                    <div className="mt-1 text-sm text-slate-500">{user.email}</div>
                </div>
                <div className="rounded-[20px] border border-stone-200 p-4">
                    <div className="text-sm font-bold text-slate-950">Senha</div>
                    <div className="mt-1 text-sm text-slate-500">A alteração de senha será feita pelo suporte nesta versão.</div>
                    <button
                        type="button"
                        onClick={() => toast('Entre em contato com o suporte para redefinir sua senha.')}
                        className="btn-secondary mt-4 rounded-xl border-stone-200 px-4 py-2 text-slate-700"
                    >
                        Solicitar alteração
                    </button>
                </div>
            </div>
        </Panel>
    );
}

function AddressesTab({ userId }) {
    const storageKey = ADDRESS_PREFIX + userId;
    const [addresses, setAddresses] = useState(() => readList(storageKey));
    const [form, setForm] = useState({ label: '', street: '', city: '', state: '', zip: '' });

    const persist = (next) => {
        setAddresses(next);
        writeList(storageKey, next);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const next = [
            ...addresses,
            {
                id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
                label: form.label.trim() || 'Endereço',
                street: form.street.trim(),
                city: form.city.trim(),
                state: form.state.trim().toUpperCase(),
                zip: form.zip.trim(),
            },
        ];
        persist(next);
        setForm({ label: '', street: '', city: '', state: '', zip: '' });
        toast.success('Endereço salvo');
    };

    return (
        <Panel title="Endereços" description="Dados salvos apenas neste navegador para facilitar testes.">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <input className="input" placeholder="Apelido, ex.: Fazenda" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                <input className="input" placeholder="CEP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} required />
                <input className="input md:col-span-2" placeholder="Rua, número e complemento" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} required />
                <input className="input" placeholder="Cidade" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <input className="input uppercase" placeholder="UF" maxLength={2} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} required />
                <div className="md:col-span-2">
                    <button type="submit" className="btn-primary rounded-xl px-5 py-2.5">Salvar endereço</button>
                </div>
            </form>

            <ListEmpty items={addresses} empty="Nenhum endereço cadastrado ainda." />
            <div className="mt-5 space-y-3">
                {addresses.map((address) => (
                    <SavedRow
                        key={address.id}
                        title={address.label}
                        description={`${address.street} - ${address.city}/${address.state} - ${address.zip}`}
                        onRemove={() => {
                            persist(addresses.filter((item) => item.id !== address.id));
                            toast.success('Endereço removido');
                        }}
                    />
                ))}
            </div>
        </Panel>
    );
}

function PaymentsTab({ userId }) {
    const storageKey = PAYMENT_PREFIX + userId;
    const [cards, setCards] = useState(() => readList(storageKey));
    const [form, setForm] = useState({ holder: '', number: '', expiry: '' });

    const persist = (next) => {
        setCards(next);
        writeList(storageKey, next);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const digits = form.number.replace(/\D/g, '');
        const next = [
            ...cards,
            {
                id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
                holder: form.holder.trim(),
                last4: digits.slice(-4),
                expiry: form.expiry.trim(),
            },
        ];
        persist(next);
        setForm({ holder: '', number: '', expiry: '' });
        toast.success('Forma de pagamento salva');
    };

    return (
        <Panel title="Pagamentos" description="Para testes, salvamos somente os últimos quatro dígitos.">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
                <input className="input md:col-span-3" placeholder="Nome impresso" value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} required />
                <input className="input md:col-span-2" placeholder="Número do cartão" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} minLength={4} required />
                <input className="input" placeholder="MM/AA" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} required />
                <div className="md:col-span-3">
                    <button type="submit" className="btn-primary rounded-xl px-5 py-2.5">Salvar pagamento</button>
                </div>
            </form>

            <ListEmpty items={cards} empty="Nenhuma forma de pagamento cadastrada ainda." />
            <div className="mt-5 space-y-3">
                {cards.map((card) => (
                    <SavedRow
                        key={card.id}
                        title={`Cartão final ${card.last4}`}
                        description={`${card.holder} - validade ${card.expiry}`}
                        onRemove={() => {
                            persist(cards.filter((item) => item.id !== card.id));
                            toast.success('Forma de pagamento removida');
                        }}
                    />
                ))}
            </div>
        </Panel>
    );
}

function ListEmpty({ items, empty }) {
    if (items.length > 0) return null;
    return <p className="mt-5 rounded-[18px] bg-stone-50 p-4 text-sm text-slate-500">{empty}</p>;
}

function SavedRow({ title, description, onRemove }) {
    return (
        <div className="flex flex-col gap-3 rounded-[18px] border border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <div className="text-sm font-bold text-slate-950">{title}</div>
                <div className="mt-1 text-sm text-slate-500">{description}</div>
            </div>
            <button type="button" onClick={onRemove} className="btn-ghost w-fit rounded-xl px-4 py-2 text-red-600 hover:bg-red-50">
                Remover
            </button>
        </div>
    );
}

function SellerTab({ user, becomeSeller, navigate, setTab }) {
    const [storeName, setStoreName] = useState(user.store_name || '');
    const [storeDescription, setStoreDescription] = useState(user.store_description || '');
    const [saving, setSaving] = useState(false);

    if (user.role !== 'buyer') {
        return (
            <Panel title="Sua loja" description="Esta conta já tem acesso ao painel de vendas.">
                <Link to={user.role === 'admin' ? '/admin' : '/seller'} className="btn-primary rounded-xl px-5 py-2.5">
                    Abrir painel
                </Link>
            </Panel>
        );
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await becomeSeller({ storeName: storeName.trim(), storeDescription });
            toast.success('Loja criada com sucesso');
            navigate('/seller', { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Não foi possível criar a loja');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <button type="button" onClick={() => setTab('overview')} className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500 hover:text-brand-700">
                Voltar para visão geral
            </button>

            <Panel title="Transformar conta em loja" description="Você continua comprando normalmente e ganha acesso ao painel de vendas.">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="label" htmlFor="store-name">Nome da loja</label>
                        <input
                            id="store-name"
                            className="input"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="Ex.: Fazenda Boa Safra"
                            minLength={2}
                            required
                        />
                    </div>
                    <div>
                        <label className="label" htmlFor="store-description">Descrição</label>
                        <textarea
                            id="store-description"
                            className="textarea rounded-[22px]"
                            rows={5}
                            value={storeDescription}
                            onChange={(e) => setStoreDescription(e.target.value)}
                            placeholder="Conte o que sua loja vende"
                        />
                    </div>
                    <button type="submit" disabled={saving} className="btn-accent rounded-xl px-5 py-2.5">
                        {saving ? 'Criando loja...' : 'Criar loja'}
                    </button>
                </form>
            </Panel>
        </div>
    );
}
