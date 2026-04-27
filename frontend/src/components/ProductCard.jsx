import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../utils/format';
import { getProductFallback } from '../utils/productImage';

export default function ProductCard({ product }) {
    const [imgSrc, setImgSrc] = useState(product.image_url || '');
    const hasDiscount = product.compare_price && Number(product.compare_price) > Number(product.price);
    const discountPct = hasDiscount
        ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
        : 0;

    const fallbackImage = getProductFallback(product.category);

    useEffect(() => {
        setImgSrc(product.image_url || fallbackImage);
    }, [product.id, product.image_url, fallbackImage]);

    return (
        <Link
            to={`/product/${product.id}`}
            className="group block overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
        >
            <div className="relative aspect-square overflow-hidden bg-white">
                <img
                    src={imgSrc}
                    alt={product.name}
                    className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.01]"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    style={{ imageRendering: 'auto' }}
                    onError={() => {
                        if (imgSrc !== fallbackImage) {
                            setImgSrc(fallbackImage);
                        }
                    }}
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
