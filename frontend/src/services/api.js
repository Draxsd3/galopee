import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
    withCredentials: false,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('galoppe.token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            // Token inválido/expirado
            if (localStorage.getItem('galoppe.token')) {
                localStorage.removeItem('galoppe.token');
                localStorage.removeItem('galoppe.user');
                // Evita loop se já estiver em /login
                if (!window.location.pathname.startsWith('/login')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(err);
    }
);

export default api;
