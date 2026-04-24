export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 mt-16">
            <div className="container-page py-8 grid md:grid-cols-3 gap-6 text-sm text-slate-600 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start">
                    <div className="mb-3">
                        <div className="font-display text-4xl leading-none text-brand-700">Galoppe</div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Marketplace agro</div>
                    </div>
                    <p className="max-w-xs md:max-w-none">Marketplace que conecta vendedores e compradores com segurança, praticidade e preço justo.</p>
                </div>
                <div>
                    <div className="font-semibold text-slate-900 mb-2">Institucional</div>
                    <ul className="space-y-1">
                        <li>Quem somos</li>
                        <li>Políticas de privacidade</li>
                        <li>Termos de uso</li>
                    </ul>
                </div>
                <div>
                    <div className="font-semibold text-slate-900 mb-2">Contato</div>
                    <ul className="space-y-1">
                        <li>contato@galoppe.com</li>
                        <li>+55 (11) 99999-0000</li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} Galoppe Marketplace. Todos os direitos reservados.
            </div>
        </footer>
    );
}
