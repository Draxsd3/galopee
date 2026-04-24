import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="container-page py-20 text-center">
            <h1 className="text-6xl font-extrabold text-brand-700">404</h1>
            <p className="text-slate-600 mt-2 mb-6">Página não encontrada.</p>
            <Link to="/" className="btn-primary">Voltar ao início</Link>
        </div>
    );
}
