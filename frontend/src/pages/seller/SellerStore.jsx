import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { fileToImageDataUrl } from '../../utils/imageUpload';

export default function SellerStore() {
    const [form, setForm] = useState({ store_name: '', description: '', logo_url: '', banner_url: '' });
    const [loading, setLoading] = useState(false);
    const [store, setStore] = useState(null);

    useEffect(() => {
        api.get('/sellers/me').then(({ data }) => {
            if (data) {
                setStore(data);
                setForm({
                    store_name: data.store_name || '',
                    description: data.description || '',
                    logo_url: data.logo_url || '',
                    banner_url: data.banner_url || '',
                });
            }
        });
    }, []);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const onImageChange = async (field, file) => {
        if (!file) return;
        try {
            const dataUrl = await fileToImageDataUrl(file);
            setForm((f) => ({ ...f, [field]: dataUrl }));
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put('/sellers/me', form);
            setStore(data);
            toast.success('Loja atualizada');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Falha ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-3xl">
            <h1 className="text-2xl font-bold">Minha loja</h1>
            {store && <p className="text-sm text-slate-500">URL pública: <span className="font-mono">/loja/{store.store_slug}</span></p>}

            <form onSubmit={handleSubmit} className="card p-6 space-y-4">
                <div>
                    <label className="label">Nome da loja</label>
                    <input name="store_name" className="input" required
                        value={form.store_name} onChange={onChange} />
                </div>
                <div>
                    <label className="label">Descrição</label>
                    <textarea name="description" rows={4} className="textarea"
                        value={form.description} onChange={onChange} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="label">Logo da loja</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="input"
                            onChange={(e) => onImageChange('logo_url', e.target.files?.[0])}
                        />
                        <input name="logo_url" className="input mt-2" placeholder="Ou cole uma URL"
                            value={form.logo_url} onChange={onChange} />
                    </div>
                    <div>
                        <label className="label">Banner da loja</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            className="input"
                            onChange={(e) => onImageChange('banner_url', e.target.files?.[0])}
                        />
                        <input name="banner_url" className="input mt-2" placeholder="Ou cole uma URL"
                            value={form.banner_url} onChange={onChange} />
                    </div>
                </div>
                {(form.logo_url || form.banner_url) && (
                    <div className="grid gap-4 rounded-[22px] bg-slate-50 p-4 sm:grid-cols-2">
                        {form.logo_url && (
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Logo</div>
                                <img src={form.logo_url} alt="Logo da loja" className="h-24 w-24 rounded-2xl object-cover" />
                            </div>
                        )}
                        {form.banner_url && (
                            <div>
                                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Banner</div>
                                <img src={form.banner_url} alt="Banner da loja" className="h-24 w-full rounded-2xl object-cover" />
                            </div>
                        )}
                    </div>
                )}
                <div className="flex justify-end">
                    <button className="btn-primary" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </div>
            </form>
        </div>
    );
}
