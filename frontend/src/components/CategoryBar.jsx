import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Sprout, Wheat, Beef, Droplets, SprayCan, Wrench, HardHat, TreePine, Pill, Leaf, LayoutGrid,
} from 'lucide-react';

const CATEGORIES = [
    { name: 'Todos',         icon: LayoutGrid },
    { name: 'Sementes',      icon: Sprout },
    { name: 'Grãos',         icon: Wheat },
    { name: 'Ração',         icon: Beef },
    { name: 'Fertilizantes', icon: Leaf },
    { name: 'Defensivos',    icon: SprayCan },
    { name: 'Irrigação',     icon: Droplets },
    { name: 'Máquinas',      icon: Wrench },
    { name: 'Ferramentas',   icon: TreePine },
    { name: 'EPI',           icon: HardHat },
    { name: 'Veterinária',   icon: Pill },
];

export default function CategoryBar() {
    const [searchParams] = useSearchParams();
    const current = searchParams.get('category') || 'Todos';
    const navigate = useNavigate();

    const handle = (cat) => {
        const next = new URLSearchParams(searchParams);
        if (cat === 'Todos') next.delete('category');
        else next.set('category', cat);
        navigate(`/?${next.toString()}`);
    };

    return (
        <section className="py-4">
            <div className="container-page">
                <div className="rounded-[28px] bg-white p-4 shadow-card">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Categorias</p>
                            <p className="text-sm text-slate-600">Explore por necessidade do campo</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-11">
                        {CATEGORIES.map(({ name, icon: Icon }) => (
                            <button
                                key={name}
                                onClick={() => handle(name)}
                                className={`cat-pill ${current === name ? 'cat-pill-active' : ''}`}
                            >
                                <Icon className={`w-6 h-6 ${current === name ? 'text-brand-700' : 'text-slate-500'}`} />
                                <span className={`text-xs font-semibold ${current === name ? 'text-brand-800' : 'text-slate-700'}`}>
                                    {name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
