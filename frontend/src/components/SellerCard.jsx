import { Link } from 'react-router-dom';
import { ArrowRight, Check, MapPin, Package, Star } from 'lucide-react';

export default function SellerCard({ seller }) {
    const initials = (seller.store_name || '?')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join('');

    const rating = Number(seller.rating) || 0;

    return (
        <Link
            to={`/loja/${seller.store_slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[24px] border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-cardHover"
        >
            <div className="relative h-28 overflow-hidden">
                <img
                    src={seller.banner_url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80'}
                    alt={seller.store_name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

                {seller.verified && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-brand-700 backdrop-blur">
                        <Check className="h-3.5 w-3.5 text-brand-600" strokeWidth={3} />
                        Verificada
                    </span>
                )}
            </div>

            <div className="relative px-5 pb-5">
                <div className="-mt-9 mb-3 grid h-[72px] w-[72px] place-items-center overflow-hidden rounded-[20px] border border-stone-200 bg-white text-lg font-extrabold tracking-tight text-slate-800 shadow-sm">
                    {seller.logo_url ? (
                        <img src={seller.logo_url} alt={seller.store_name} className="h-full w-full object-contain p-1.5" />
                    ) : (
                        <span>{initials || '—'}</span>
                    )}
                </div>

                <h3 className="truncate text-[17px] font-extrabold leading-tight text-slate-900">
                    {seller.store_name}
                </h3>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    {seller.city && (
                        <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {seller.city}/{seller.state}
                        </span>
                    )}
                </div>

                <div className="mt-4 flex items-center gap-4 rounded-2xl bg-stone-50 px-4 py-2.5 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-800">{rating.toFixed(1)}</span>
                        <span className="text-slate-500">avaliação</span>
                    </div>
                    {seller.products_count !== undefined && (
                        <>
                            <span className="h-4 w-px bg-stone-200" />
                            <div className="flex items-center gap-1.5">
                                <Package className="h-3.5 w-3.5 text-brand-700" />
                                <span className="font-bold text-slate-800">{seller.products_count}</span>
                                <span className="text-slate-500">produtos</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-bold text-white transition-all group-hover:bg-brand-800 group-hover:gap-3">
                    Ver loja
                    <ArrowRight className="h-4 w-4" />
                </div>
            </div>
        </Link>
    );
}
