import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './components/AuthProvider';
import DashboardLayout from './layouts/DashboardLayout';
import HomeLayout from './layouts/HomeLayout';
import ProtectedRoute from './components/ProtectedRoute';
import UserDirectory from './pages/UserDirectory';
import PrintQueue from './pages/PrintQueue';
import Inventory from './pages/Inventory';
import Roles from './pages/Roles';
import DesignerPage from './pages/DesignerPage';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import OrderHistory from './pages/OrderHistory';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import PrintAreas from './pages/PrintAreas';
import AuthLayout from './components/AuthLayout';
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserProfile from './pages/UserProfile';
import VirtualTryOn from './pages/VirtualTryOn';
import Upload from './pages/Upload';
import CommunityDesigns from './pages/CommunityDesigns';
import CommunityFeed from './pages/CommunityFeed';
import GiftUnboxing from './pages/GiftUnboxing';
import CreatorDashboard from './pages/CreatorDashboard';

const Placeholder = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900  mb-4">{title}</h1>
    <p className="text-gray-500 ">This page is under construction.</p>
  </div>
);

import AdminDashboard from './pages/AdminDashboard';
import AdminStickers from './pages/AdminStickers';
import SchedulerDashboard from './pages/SchedulerDashboard';
import Forbidden403 from './pages/Forbidden403';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
        </Route>
        <Route path="/403" element={<Forbidden403 />} />
        <Route path="/gift/preview" element={<GiftUnboxing />} />
        <Route path="/gift/:uuid" element={<GiftUnboxing />} />
        <Route path="/design/:productId" element={<DesignerPage />} />
        <Route path="/design" element={<DesignerPage />} />

        {/* User / Home routes */}
        <Route path="/home" element={<HomeLayout />}>
          <Route index element={<Home />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-success" element={<OrderSuccess />} />
          <Route path="my-orders" element={<OrderHistory />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="virtual-try-on" element={<VirtualTryOn />} />
          <Route path="upload" element={<Upload />} />
          <Route path="community-designs" element={<CommunityDesigns />} />
          <Route path="feed" element={<CommunityFeed />} />
          <Route path="creator-dashboard" element={<CreatorDashboard />} />
        </Route>

        {/* Admin routes protected by ProtectedRoute */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="orders" element={<PrintQueue />} />
            <Route path="stickers" element={<AdminStickers />} />
            <Route path="base-products" element={<Inventory />} />
            <Route path="print-areas" element={<PrintAreas />} />
            {/* <Route path="stickers" element={<AdminStickers />} /> */}
            <Route path="scheduler" element={<SchedulerDashboard />} />
            <Route path="roles" element={<Roles />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}


export default App;
