import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const statusTabs = [
    { label: 'All Orders', value: null },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Shipped', value: 'SHIPPED' },
    { label: 'Completed', value: 'COMPLETED' },
];

const statusStyle = {
    PENDING: 'bg-amber-100 text-amber-800',
    PAID: 'bg-emerald-100 text-emerald-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-cyan-100 text-cyan-700',
    COMPLETED: 'bg-slate-900 text-white',
    CANCELLED: 'bg-rose-100 text-rose-700',
};

const OrderHistory = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [status, setStatus] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await orderService.getMyOrders({
                    page,
                    size: 10,
                    status: status || undefined,
                    sortBy: 'createdDate',
                    order: 'DESC',
                });
                const data = res.data?.data || {};
                setOrders(data.content || []);
                setTotalPages(data.totalPages || 0);
            } catch (err) {
                if (err.response?.status === 401) {
                    navigate('/login', { state: { from: '/home/my-orders' } });
                    return;
                }
                setError(err.response?.data?.message || 'Could not load your orders.');
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate, page, status]);

    return (
        <div className="flex-1 overflow-auto bg-background-light min-h-screen font-display text-slate-900">
            <main className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">My Orders</h1>
                        <p className="text-slate-500">View your order history and fulfillment status.</p>
                    </div>
                    <button
                        onClick={() => navigate('/home/catalog')}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors text-slate-900"
                    >
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        Continue Shopping
                    </button>
                </div>

                <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                    <div className="flex gap-8 min-w-max">
                        {statusTabs.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => {
                                    setStatus(tab.value);
                                    setPage(1);
                                }}
                                className={`border-b-2 pb-4 px-1 text-sm font-bold transition-colors ${
                                    status === tab.value
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-4 text-slate-500">
                        <span className="material-symbols-outlined text-[42px] text-primary animate-spin">progress_activity</span>
                        <p className="text-sm font-bold uppercase tracking-wider">Loading orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-rose-700 font-bold">
                        {error}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                        <span className="material-symbols-outlined text-[48px] text-slate-300">receipt_long</span>
                        <h2 className="text-xl font-black mt-4">No orders yet</h2>
                        <p className="text-slate-500 mt-2">Your completed checkouts will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="size-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-slate-500">inventory_2</span>
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black text-slate-900">ORD-{String(order.id).padStart(4, '0')}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${statusStyle[order.status] || 'bg-slate-100 text-slate-600'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-semibold">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                    {formatDate(order.createdDate)}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px]">payments</span>
                                                    {order.paymentMethod || 'N/A'} / {order.paymentStatus || 'N/A'}
                                                </span>
                                            </div>
                                            {order.shippingAddress && (
                                                <p className="text-sm text-slate-500 mt-3 line-clamp-2">{order.shippingAddress}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="lg:text-right">
                                        <p className="text-xs text-slate-400 uppercase font-black tracking-wider">Total</p>
                                        <p className="text-2xl font-black text-primary mt-1">{formatCurrency(order.totalAmount)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-center gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="h-10 px-4 rounded-lg bg-slate-100 text-slate-600 font-bold disabled:opacity-40"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="h-10 px-4 rounded-lg bg-slate-100 text-slate-600 font-bold disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OrderHistory;
