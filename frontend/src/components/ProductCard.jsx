import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';

const categoryFallbacks = {
    Sementes: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
    Graos: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=900&q=80',
    Racao: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80',
    Fertilizantes: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
    Defensivos: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=900&q=80',
    Irrigacao: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80',
    Maquinas: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80',
};

export default function ProductCard({ product }) {
    const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
    const discountPct = hasDiscount
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;

    const normalizedCategory = (product.category || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const fallbackImage = categoryFallbacks[normalizedCategory]
        || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80';
    const imageSrc = product.image_url || fallbackImage;

    return (
        <Link
            to={`/product/${product.id}`}
            className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
        >
            <div className="relative aspect-square overflow-hidden bg-stone-50">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
                {hasDiscount && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-white">
                        -{discountPct}%
                    </span>
                )}
            </div>

            <div className="p-4">
                <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-slate-800">
                    {product.name}
                </h3>

                <div className="mt-3">
                    {hasDiscount && (
                        <div className="text-xs text-slate-400 line-through">
                            {formatPrice(product.compare_price)}
                        </div>
                    )}
                    <div className="text-2xl font-extrabold text-brand-700">
                        {formatPrice(product.price)}
                    </div>
                </div>

                <div className="mt-3 truncate border-t border-stone-100 pt-3 text-xs text-slate-500">
                    {product.store_name}
                </div>
            </div>
        </Link>
    );
}
