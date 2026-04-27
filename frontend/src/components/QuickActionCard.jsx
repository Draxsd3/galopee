import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const VARIANTS = {
    greenLight: {
        tint: 'from-[#7cb342]/85 via-[#5f8f34]/80 to-[#3f6821]/85',
        btnBg: 'bg-white text-[#4a7a1f] hover:bg-stone-50',
    },
    green: {
        tint: 'from-brand-800/90 via-brand-800/75 to-brand-900/85',
        btnBg: 'bg-white text-brand-800 hover:bg-stone-50',
    },
    purple: {
        tint: 'from-[#7e22ce]/85 via-[#6b21a8]/80 to-[#4c1d95]/85',
        btnBg: 'bg-white text-[#6b21a8] hover:bg-stone-50',
    },
    amber: {
        tint: 'from-[#e89d0d]/85 via-[#c77b02]/80 to-[#8f5702]/85',
        btnBg: 'bg-white text-[#a66502] hover:bg-stone-50',
    },
    dark: {
        tint: 'from-[#1b3623]/85 via-[#132a1a]/85 to-[#0c1d11]/90',
        btnBg: 'bg-[#f1c56a] text-[#24482f] hover:bg-[#f5d28a]',
    },
};

export default function QuickActionCard({
    title,
    highlight,
    description,
    cta = 'Ver mais',
    to = '/',
    variant = 'greenLight',
    bgImage,
    size = 'md',
    artOnly = false,
}) {
    const v = VARIANTS[variant] || VARIANTS.greenLight;

    const heightClass = {
        sm: 'min-h-[220px]',
        md: 'min-h-[320px]',
        lg: 'min-h-[420px]',
    }[size];
    const cardShapeClass = artOnly ? 'aspect-square min-h-0' : heightClass;

    const titleSize = {
        sm: 'text-2xl md:text-3xl',
        md: 'text-3xl md:text-4xl',
        lg: 'text-4xl md:text-5xl',
    }[size];

    return (
        <Link
            to={to}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] ${artOnly ? '' : 'p-6'} shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${cardShapeClass}`}
        >
            {bgImage ? (
                <img
                    src={bgImage}
                    alt=""
                    aria-hidden
                    className={`absolute inset-0 h-full w-full object-cover ${artOnly ? 'transform-gpu' : 'transition-transform duration-700 group-hover:scale-[1.02]'}`}
                    decoding="async"
                    style={{ imageRendering: 'auto' }}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-stone-800 via-stone-900 to-black" aria-hidden />
            )}

            {artOnly ? (
                <>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 via-black/10 to-transparent" aria-hidden />
                    <div className="relative z-10 mt-auto flex items-end p-5">
                        <span className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-transform group-hover:translate-x-1 ${v.btnBg}`}>
                            {cta}
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                    <span className="sr-only">{title}{highlight ? ` ${highlight}` : ''}</span>
                </>
            ) : (
                <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${v.tint}`} aria-hidden />

                    <div
                        className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-white/15 blur-3xl"
                        aria-hidden
                    />
                    <div
                        className="pointer-events-none absolute -bottom-16 -left-16 h-60 w-60 rounded-full bg-black/15 blur-3xl"
                        aria-hidden
                    />

                    <div className="relative z-10">
                        <h3 className={`font-extrabold leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] ${titleSize}`}>
                            {title}
                            {highlight && (
                                <>
                                    {' '}
                                    <span className="block font-extrabold">{highlight}</span>
                                </>
                            )}
                        </h3>
                        {description && (
                            <p className="mt-3 max-w-[250px] text-sm leading-6 text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
                                {description}
                            </p>
                        )}
                    </div>

                    <div className="relative z-10 mt-5">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold shadow-md transition-transform group-hover:translate-x-1 ${v.btnBg}`}
                        >
                            {cta}
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    </div>
                </>
            )}
        </Link>
    );
}
