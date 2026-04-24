import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('galoppe.user');
            return raw ? JSON.parse(raw) : null;
        } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        async function hydrate() {
            const token = localStorage.getItem('galoppe.token');
            if (!token) { setLoading(false); return; }
            try {
                const { data } = await api.get('/auth/me');
                if (active) {
                    setUser(data);
                    localStorage.setItem('galoppe.user', JSON.stringify(data));
                }
            } catch {
                localStorage.removeItem('galoppe.token');
                localStorage.removeItem('galoppe.user');
                if (active) setUser(null);
            } finally {
                if (active) setLoading(false);
            }
        }
        hydrate();
        return () => { active = false; };
    }, []);

    const persistUser = useCallback((next) => {
        if (!next) {
            localStorage.removeItem('galoppe.user');
            setUser(null);
            return;
        }
        localStorage.setItem('galoppe.user', JSON.stringify(next));
        setUser(next);
    }, []);

    const login = useCallback(async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('galoppe.token', data.token);
        persistUser(data.user);
        return data.user;
    }, [persistUser]);

    const register = useCallback(async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('galoppe.token', data.token);
        persistUser(data.user);
        return data.user;
    }, [persistUser]);

    const updateProfile = useCallback(async (payload) => {
        const { data } = await api.put('/auth/me', payload);
        persistUser(data);
        return data;
    }, [persistUser]);

    const becomeSeller = useCallback(async (payload) => {
        let response;
        try {
            response = await api.post('/auth/become-seller', payload);
        } catch (err) {
            if (err.response?.status !== 404) throw err;
            response = await api.post('/sellers/become', payload);
        }
        const { data } = response;
        // Retorno do backend: { token, user }
        if (data.token) localStorage.setItem('galoppe.token', data.token);
        persistUser(data.user);
        return data.user;
    }, [persistUser]);

    const logout = useCallback(() => {
        localStorage.removeItem('galoppe.token');
        localStorage.removeItem('galoppe.user');
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, loading, login, register, logout, updateProfile, becomeSeller }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
    return ctx;
}
