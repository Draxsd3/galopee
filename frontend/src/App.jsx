import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoutePreloader from './components/RoutePreloader';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import StorePage from './pages/StorePage';
import Stores from './pages/Stores';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import BuyerOrders from './pages/BuyerOrders';
import Profile from './pages/Profile';

import SellerLayout from './pages/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerProductForm from './pages/seller/SellerProductForm';
import SellerOrders from './pages/seller/SellerOrders';
import SellerStore from './pages/seller/SellerStore';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSellers from './pages/admin/AdminSellers';
import AdminOrders from './pages/admin/AdminOrders';

import NotFound from './pages/NotFound';

export default function App() {
    return (
        <div className="min-h-screen flex flex-col">
            <RoutePreloader />
            <Navbar />
            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/store/:slug" element={<StorePage />} />
                    <Route path="/stores" element={<Stores />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route path="/profile" element={
                        <ProtectedRoute roles={['buyer', 'seller', 'admin']}><Profile /></ProtectedRoute>
                    } />

                    <Route path="/cart" element={
                        <ProtectedRoute roles={['buyer', 'seller']}><Cart /></ProtectedRoute>
                    } />
                    <Route path="/checkout" element={
                        <ProtectedRoute roles={['buyer', 'seller']}><Checkout /></ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                        <ProtectedRoute roles={['buyer', 'seller']}><BuyerOrders /></ProtectedRoute>
                    } />

                    <Route path="/seller" element={
                        <ProtectedRoute roles={['seller', 'admin']}><SellerLayout /></ProtectedRoute>
                    }>
                        <Route index element={<SellerDashboard />} />
                        <Route path="products" element={<SellerProducts />} />
                        <Route path="products/new" element={<SellerProductForm />} />
                        <Route path="products/:id/edit" element={<SellerProductForm />} />
                        <Route path="orders" element={<SellerOrders />} />
                        <Route path="store" element={<SellerStore />} />
                    </Route>

                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>
                    }>
                        <Route index element={<AdminDashboard />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="sellers" element={<AdminSellers />} />
                        <Route path="orders" element={<AdminOrders />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}
