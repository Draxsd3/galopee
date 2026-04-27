import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Check, MapPin, Star, Store } from 'lucide-react';

export default function StorePage() {
    const { slug } = useParams();
    const [seller, setSeller] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/sellers/${slug}`)
            .then(({ data }) => {
                setSeller(data);
                return api.get('/products', { params: { sellerId: data.id, limit: 60 } });
            })
            .then(({ data }) => setProducts(data.items || []))
            .catch(() => setSeller(null))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="container-page py-12 text-slate-500">Carregando loja...</div>;
    if (!seller) return (
        <div className="container-page py-12 text-center">
            <p className="text-slate-500">Loja não encontrada.</p>
            <Link to="/" className="btn-primary mt-4">Voltar ao marketplace</Link>
        </div>
    );

    return (
        <div>
            <div className="h-48 md:h-64 bg-gradient-to-br from-brand-700 to-brand-900 relative">
                {seller.banner_url && (
                    <img src={seller.banner_url} alt="" className="w-full h-full object-cover opacity-70" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>

            <div className="container-page -mt-16 relative z-10">
                <div className="card p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="w-24 h-24 rounded-xl bg-white border-4 border-white shadow-lg grid place-items-center overflow-hidden shrink-0">
                        {seller.logo_url ? (
                            <img
                                src={seller.logo_url}
                                alt={seller.store_name}
                                className="w-full h-full object-contain p-2"
                                onError={(event) => { event.currentTarget.src = '/stores/logos/galopee-store.svg'; }}
                            />
                        ) : (
                            <Store className="w-10 h-10 text-brand-700" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{seller.store_name}</h1>
                            {seller.verified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                    Verificada
                                </span>
                            )}
                        </div>
                        <p className="text-slate-600 mt-1">{seller.description}</p>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                            {seller.city && (
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {seller.city}/{seller.state}
                                </span>
                            )}
                            {seller.rating > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-amber-600">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    <span className="font-semibold">{Number(seller.rating).toFixed(1)}</span>
                                </span>
                            )}
                            <span>{products.length} produtos ativos</span>
                        </div>
                    </div>
                </div>
            </div>

            <section className="container-page py-10">
                <h2 className="text-xl font-bold mb-6">Produtos da loja</h2>
                {products.length === 0 ? (
                    <div className="card p-12 text-center text-slate-500">
                        Esta loja ainda não possui produtos cadastrados.
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                )}
            </section>
        </div>
    );
}
