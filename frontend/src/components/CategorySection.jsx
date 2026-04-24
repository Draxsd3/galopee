import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

const VARIANTS = {
    greenLight: {
        bg: 'bg-gradient-to-br from-[#8bc34a] via-[#7cb342] to-[#5f8f34]',
        wave: 'text-white/10',
        titleColor: 'text-white',
        descColor: 'text-white/90',
        btnBg: 'bg-white text-[#4a7a1f] hover:bg-stone-50',
    },
    green: {
        bg: 'bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800',
        wave: 'text-white/10',
        titleColor: 'text-white',
        descColor: 'text-white/85',
        btnBg: 'bg-white text-brand-800 hover:bg-stone-50',
    },
    amber: {
        bg: 'bg-gradient-to-br from-[#f5b83a] via-[#e89d0d] to-[#c77b02]',
        wave: 'text-white/15',
        titleColor: 'text-white',
        descColor: 'text-white/90',
        btnBg: 'bg-white text-[#a66502] hover:bg-stone-50',
    },
    dark: {
        bg: 'bg-gradient-to-br from-[#24482f] via-[#1b3623] to-[#132a1a]',
        wave: 'text-white/8',
        titleColor: 'text-white',
        descColor: 'text-white/80',
        btnBg: 'bg-[#f1c56a] text-[#24482f] hover:bg-[#f5d28a]',
    },
    purple: {
        bg: 'bg-gradient-to-br from-[#9333ea] via-[#7e22ce] to-[#6b21a8]',
        wave: 'text-white/12',
        titleColor: 'text-white',
        descColor: 'text-white/85',
        btnBg: 'bg-white text-[#6b21a8] hover:bg-stone-50',
    },
};

/**
 * Seção no estilo "Tudo na agricultura / Ofertas / Rendimento e bem-estar animal":
 * banner colorido à esquerda (com título + descrição + CTA) e 4 produtos à direita.
 *
 * Props:
 *  - title, highlight, description, cta, to (banner)
 *  - variant ∈ 'greenLight' | 'green' | 'amber' | 'dark' | 'purple'
 *  - image (opcional): ilustração exibida no topo do banner
 *  - products: array com até 4 produtos
 */
export default function CategorySection({
    title,
    highlight,
    description,
    cta = 'Ver mais',
    to = '/',
    variant = 'greenLight',
    image,
    products = [],
}) {
    const v = VARIANTS[variant] || VARIANTS.greenLight;
    const items = products.slice(0, 4);

    if (items.length === 0) return null;

    return (
        <section className="container-page py-8">
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-5">
                {/* Banner */}
                <div className="col-span-2 lg:col-span-1">
                    <Link
                        to={to}
                        className={`group relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[24px] p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${v.bg}`}
                    >
                        <div
                            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"
                            aria-hidden
                        />
                        <svg
                            className={`pointer-events-none absolute inset-x-0 bottom-0 w-full ${v.wave}`}
                            viewBox="0 0 400 180"
                            fill="none"
                            aria-hidden
                        >
                            <path d="M0 120 Q100 80 200 110 T400 90 L400 180 L0 180 Z" fill="currentColor" />
                        </svg>

                        {image && (
                            <div className="relative z-10 mb-3 flex h-28 items-end justify-center">
                                <img src={image} alt="" className="max-h-28 drop-shadow-lg" />
                            </div>
                        )}

                        <div className="relative z-10">
                            <h3 className={`text-4xl font-extrabold leading-none md:text-5xl ${v.titleColor}`}>
                                {title}
                                {highlight && (
                                    <>
                                        {' '}
                                        <span className="block font-extrabold">{highlight}</span>
                                    </>
                                )}
                            </h3>
                            {description && (
                                <p className={`mt-4 max-w-[200px] text-sm leading-6 ${v.descColor}`}>
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="relative z-10 mt-6">
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold shadow-lg transition-transform group-hover:translate-x-1 ${v.btnBg}`}
                            >
                                {cta}
                                <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Produtos */}
                {items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                ))}
            </div>
        </section>
    );
}
