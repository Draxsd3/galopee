import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { fileToImageDataUrl } from '../../utils/imageUpload';

const EMPTY = {
    name: '', description: '', price: '', image_url: '',
    stock: 0, category: '', sku: '', active: true,
};

export default function SellerProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            api.get(`/products/${id}`).then(({ data }) => {
                setForm({
                    name: data.name || '',
                    description: data.description || '',
                    price: Number(data.price),
                    image_url: data.image_url || '',
                    stock: data.stock || 0,
                    category: data.category || '',
                    sku: data.sku || '',
                    active: data.active,
                });
            });
        }
    }, [id]);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    };

    const onImageChange = async (file) => {
        if (!file) return;
        try {
            const dataUrl = await fileToImageDataUrl(file);
            setForm((f) => ({ ...f, image_url: dataUrl }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
            if (id) {
                await api.put(`/products/${id}`, payload);
                toast.success('Produto atualizado');
            } else {
                await api.post('/products', payload);
                toast.success('Produto criado');
            }
            navigate('/seller/products');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-3xl">
            <Link to="/seller/products" className="btn-ghost"><ArrowLeft className="w-4 h-4" /> Voltar</Link>
            <h1 className="text-2xl font-bold">{id ? 'Editar produto' : 'Novo produto'}</h1>

            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div>
                    <label className="label">Nome do produto</label>
                    <input name="name" className="input" required minLength={2}
                        value={form.name} onChange={onChange} />
                </div>
                <div>
                    <label className="label">Descrição</label>
                    <textarea name="description" rows={4} className="textarea"
                        value={form.description} onChange={onChange} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Preço (R$)</label>
                        <input name="price" type="number" step="0.01" min="0" required className="input"
                            value={form.price} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Estoque</label>
                        <input name="stock" type="number" min="0" required className="input"
                            value={form.stock} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Categoria</label>
                        <input name="category" className="input"
                            value={form.category} onChange={onChange} />
                    </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">SKU</label>
                        <input name="sku" className="input"
                            value={form.sku} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Foto do produto</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="input"
                            onChange={(e) => onImageChange(e.target.files?.[0])}
                        />
                        <input name="image_url" className="input mt-2" placeholder="Ou cole uma URL"
                            value={form.image_url} onChange={onChange} />
                    </div>
                </div>
                <label className="inline-flex items-center gap-2 text-sm">
                    <input type="checkbox" name="active" checked={form.active} onChange={onChange} />
                    Produto ativo (exibido no marketplace)
                </label>

                {form.image_url && (
                    <div className="card p-3 bg-slate-50">
                        <div className="text-xs text-slate-500 mb-2">Pré-visualização</div>
                        <img src={form.image_url} alt="preview" className="w-40 h-40 object-cover rounded-lg" />
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Link to="/seller/products" className="btn-secondary">Cancelar</Link>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Criar produto')}
                    </button>
                </div>
            </form>
        </div>
    );
}
