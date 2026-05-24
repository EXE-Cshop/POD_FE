import React, { useState, useEffect } from 'react';
import { orderService, adminService } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const PrintQueue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [filterStatus, setFilterStatus] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page,
                size: 10,
                status: filterStatus || undefined,
            };
            const response = await orderService.getOrders(params);
            setOrders(response.data?.data?.content || []);
            setTotalPages(response.data?.data?.totalPages || 0);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to fetch orders. Please check your admin permissions or backend status.');
            setOrders([]);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await adminService.getStats();
            setStats(response.data?.data || null);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, filterStatus]);

    useEffect(() => {
        fetchStats();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'PAID': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PROCESSING': return 'bg-primary/10 text-primary border-primary/20';
            case 'SHIPPED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'COMPLETED': return 'bg-slate-900/10 text-slate-900 border-slate-900/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Top Navbar */}
            <header className="h-16 border-b border-slate-200  bg-white  flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-6">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 ">Order Management</h2>
                    <div className="relative w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400  text-[20px]">search</span>
                        <input
                            className="w-full bg-slate-100  border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900  placeholder:text-slate-500 "
                            placeholder="Search Order ID, Customer..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100  text-slate-600  hover:bg-slate-200  transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100  text-slate-600  hover:bg-slate-200  transition-colors">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500  text-sm font-medium">Total Orders</p>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 ">{stats?.totalOrders || '0'}</p>
                        <div className="mt-4 w-full bg-slate-100  h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500  text-sm font-medium">Pending Processing</p>
                            <span className="text-orange-500 text-xs font-bold bg-orange-500/10 px-2 py-1 rounded">Action Needed</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 ">{stats?.pendingOrders || '0'}</p>
                        <div className="mt-4 w-full bg-slate-100  h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                    <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500  text-sm font-medium">Total Revenue</p>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 ">{formatCurrency(stats?.totalRevenue)}</p>
                        <div className="mt-4 w-full bg-slate-100  h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 text-sm font-bold rounded-lg cursor-not-allowed border border-slate-200">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Order
                        </button>
                        <button disabled className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed border border-slate-200">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export
                        </button>
                        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-slate-100  text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-200  transition-colors border border-slate-200">
                            <span className={`material-symbols-outlined text-[18px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
                            Refresh
                        </button>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-slate-100  rounded-xl">
                        {[
                            { label: 'All', value: null },
                            { label: 'Pending', value: 'PENDING' },
                            { label: 'Paid', value: 'PAID' },
                            { label: 'Shipped', value: 'SHIPPED' }
                        ].map((btn) => (
                            <button
                                key={btn.label}
                                onClick={() => { setFilterStatus(btn.value); setPage(1); }}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filterStatus === btn.value ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:bg-white/50'}`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white  border border-slate-200  rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50  text-slate-500  text-[12px] uppercase tracking-wider font-bold border-b border-slate-200 ">
                                    <th className="px-6 py-4 w-12">
                                        <input className="rounded bg-transparent border-slate-300  text-primary focus:ring-primary" type="checkbox" />
                                    </th>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 ">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                                            Loading orders...
                                        </td>
                                    </tr>
                                ) : orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                            {error || 'No orders found for this filter.'}
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-slate-50  transition-colors group text-sm">
                                            <td className="px-6 py-4">
                                                <input className="rounded bg-transparent border-slate-300  text-primary focus:ring-primary" type="checkbox" />
                                            </td>
                                            <td className="px-6 py-4 font-bold text-primary cursor-pointer hover:underline">#ORD-{order.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 ">{order.recipientName}</span>
                                                    <span className="text-xs text-slate-500 ">User ID: {order.userId}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(order.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'PENDING' ? 'bg-orange-500 animate-pulse' : 'bg-current'}`}></span>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 ">{formatDate(order.createdDate)}</td>
                                            <td className="px-6 py-4 font-bold text-slate-900 ">{formatCurrency(order.totalAmount)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button disabled className="p-1.5 rounded transition-colors text-slate-300 cursor-not-allowed" title="Print Invoice">
                                                        <span className="material-symbols-outlined text-[20px]">print</span>
                                                    </button>
                                                    <button disabled className="p-1.5 rounded transition-colors text-slate-300 cursor-not-allowed" title="Edit">
                                                        <span className="material-symbols-outlined text-[20px]">edit</span>
                                                    </button>
                                                    <button disabled className="p-1.5 rounded transition-colors text-slate-300 cursor-not-allowed" title="More">
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">Page {page} of {totalPages || 1}</p>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                disabled={page === totalPages || totalPages === 0}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintQueue;

