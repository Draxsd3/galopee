import { createContext, useContext, useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);

    const reload = useCallback(async () => {
        if (!user || !['buyer', 'seller'].includes(user.role)) {
            setCart({ items: [], total: 0 });
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.get('/cart');
            setCart(data);
        } catch {
            setCart({ items: [], total: 0 });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { reload(); }, [reload]);

    const addItem = useCallback(async (productId, quantity = 1) => {
        const { data } = await api.post('/cart/items', { product_id: productId, quantity });
        setCart(data);
        return data;
    }, []);

    const updateItem = useCallback(async (itemId, quantity) => {
        const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
        setCart(data);
        return data;
    }, []);

    const removeItem = useCallback(async (itemId) => {
        const { data } = await api.delete(`/cart/items/${itemId}`);
        setCart(data);
        return data;
    }, []);

    const clear = useCallback(async () => {
        const { data } = await api.delete('/cart');
        setCart(data);
        return data;
    }, []);

    const itemCount = cart.items.reduce((acc, it) => acc + (it.quantity || 0), 0);

    return (
        <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, clear, reload, itemCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>');
    return ctx;
}
