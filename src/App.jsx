import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import HomeLayout from './layouts/HomeLayout';
import ProtectedRoute from './components/ProtectedRoute';
import UserDirectory from './pages/UserDirectory';
import Login from './pages/Login';
import PrintQueue from './pages/PrintQueue';
import Inventory from './pages/Inventory';
import Roles from './pages/Roles';
import DesignEditor from './pages/DesignEditor';
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
import AddProduct from './pages/AddProduct';

const Placeholder = ({ title }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900  mb-4">{title}</h1>
    <p className="text-gray-500 ">This page is under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/design" element={<DesignEditor />} />

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
        </Route>

        {/* Customer Auth Routes */}
        <Route path="/home" element={<AuthLayout />}>
          <Route path="login" element={<UserLogin />} />
          <Route path="register" element={<UserRegister />} />
        </Route>

        {/* Admin routes protected by ProtectedRoute */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<UserDirectory />} />
            <Route path="orders" element={<PrintQueue />} />
            <Route path="base-products" element={<Inventory />} />
            <Route path="base-products/add" element={<AddProduct />} />
            <Route path="print-areas" element={<PrintAreas />} />
            <Route path="roles" element={<Roles />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
