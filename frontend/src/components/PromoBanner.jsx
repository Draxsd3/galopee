import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const IMAGE_VARIANTS = {
    points: {
        src: '/promos/pontos.svg',
        alt: 'Galopee Pontos: acumule pontos a cada compra e troque por beneficios',
    },
    guarantee: {
        src: '/promos/garantia.svg',
        alt: 'Garantia Galopee: satisfacao garantida ou seu dinheiro de volta',
    },
};

const CTA_VARIANTS = {
    green: {
        titleBar: 'bg-white text-brand-800',
        body: 'bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800',
        btn: 'bg-[#f1c56a] text-[#1e1b4b] hover:bg-[#f5d28a]',
    },
    amber: {
        titleBar: 'bg-white text-[#a66502]',
        body: 'bg-gradient-to-r from-[#f5b83a] via-[#e89d0d] to-[#c77b02]',
        btn: 'bg-white text-[#a66502] hover:bg-stone-50',
    },
    purple: {
        titleBar: 'bg-white text-[#6b21a8]',
        body: 'bg-gradient-to-r from-[#9333ea] via-[#7e22ce] to-[#6b21a8]',
        btn: 'bg-[#f1c56a] text-[#6b21a8] hover:bg-[#f5d28a]',
    },
};

export default function PromoBanner({
    variant = 'points',
    to = '/',
    image,
    title,
    description,
    cta = 'Saiba mais',
}) {
    if (IMAGE_VARIANTS[variant] && !title) {
        const v = IMAGE_VARIANTS[variant];
        return (
            <Link
                to={to}
                aria-label={v.alt}
                className="block aspect-[16/9] w-full transition-transform duration-300 hover:-translate-y-0.5"
            >
                <img
                    src={v.src}
                    alt={v.alt}
                    className="block h-full w-full select-none object-cover"
                    loading="lazy"
                />
            </Link>
        );
    }

    const v = CTA_VARIANTS[variant] || CTA_VARIANTS.green;
    return (
        <div className="overflow-hidden rounded-[24px] shadow-card">
            <div className="grid md:grid-cols-[280px_1fr]">
                {image && (
                    <div className="relative hidden md:block">
                        <img src={image} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-700/40" />
                        <div className="absolute right-0 top-0 flex h-full flex-col justify-center gap-1 pr-1">
                            <span className="h-4 w-1 rounded-l bg-[#f1c56a]" />
                            <span className="h-8 w-1 rounded-l bg-brand-600" />
                            <span className="h-5 w-1 rounded-l bg-[#f1c56a]" />
                            <span className="h-10 w-1 rounded-l bg-brand-500" />
                        </div>
                    </div>
                )}
                <div className="flex flex-col">
                    <div className={`px-7 py-4 ${v.titleBar}`}>
                        <h3 className="text-lg font-extrabold md:text-xl">{title}</h3>
                    </div>
                    <div className={`flex flex-wrap items-center justify-between gap-4 px-7 py-5 ${v.body}`}>
                        <p className="max-w-xl text-sm leading-6 text-white md:text-base">
                            {description}
                        </p>
                        <Link
                            to={to}
                            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5 ${v.btn}`}
                        >
                            {cta}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
