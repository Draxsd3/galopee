export default function Footer() {
    return (
        <footer className="mt-16 border-t border-slate-200 bg-white">
            <div className="container-page grid gap-6 py-8 text-center text-sm text-slate-600 md:grid-cols-3 md:text-left">
                <div className="flex flex-col items-center md:items-start">
                    <div className="mb-3">
                        <div className="font-display text-4xl leading-none text-brand-700">Galopee</div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Marketplace agro</div>
                    </div>
                    <p className="max-w-xs md:max-w-none">
                        Marketplace que conecta vendedores e compradores com seguranca, praticidade e preco justo.
                    </p>
                </div>
                <div>
                    <div className="mb-2 font-semibold text-slate-900">Institucional</div>
                    <ul className="space-y-1">
                        <li>Quem somos</li>
                        <li>Politicas de privacidade</li>
                        <li>Termos de uso</li>
                    </ul>
                </div>
                <div>
                    <div className="mb-2 font-semibold text-slate-900">Contato</div>
                    <ul className="space-y-1">
                        <li>contato@galopee.com</li>
                        <li>+55 (11) 99999-0000</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
                (c) {new Date().getFullYear()} Galopee Marketplace. Todos os direitos reservados.
            </div>
        </footer>
    );
}
