import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await adminService.getStats();
                setStats(response.data.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                setError('Failed to fetch dashboard statistics.');
                setLoading(false);
                // Fallback for demo if backend is not running
                setStats({
                    totalOrders: 1245,
                    pendingOrders: 42,
                    paidOrders: 890,
                    processingOrders: 15,
                    shippedOrders: 200,
                    completedOrders: 98,
                    cancelledOrders: 5,
                    totalRevenue: 12450.50,
                    pendingRevenue: 450.00,
                    paidRevenue: 8900.00,
                    completedRevenue: 3100.50
                });
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Revenue', value: `$${stats?.totalRevenue?.toLocaleString()}`, icon: 'payments', color: 'bg-emerald-500' },
        { label: 'Total Orders', value: stats?.totalOrders, icon: 'shopping_bag', color: 'bg-primary' },
        { label: 'Pending Orders', value: stats?.pendingOrders, icon: 'hourglass_empty', color: 'bg-amber-500' },
        { label: 'Completed Orders', value: stats?.completedOrders, icon: 'check_circle', color: 'bg-blue-500' },
    ];

    return (
        <div className="flex-1 overflow-auto bg-background-light p-8">
            <header className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2">Admin Dashboard</h1>
                <p className="text-slate-500 font-medium">Overview of your business performance & statistics.</p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 mb-8">
                    {error}
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {statCards.map((card, i) => (
                            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`size-12 rounded-xl ${card.color} flex items-center justify-center text-background-dark`}>
                                        <span className="material-symbols-outlined">{card.icon}</span>
                                    </div>
                                    <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">+12.4%</span>
                                </div>
                                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{card.label}</h3>
                                <p className="text-3xl font-black text-slate-900">{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Stats & Charts Placeholder */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">bar_chart</span>
                                Revenue Analytics
                            </h3>
                            <div className="aspect-[2/1] bg-slate-50 rounded-xl flex items-center justify-center border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">Revenue graph will appear here</p>
                            </div>
                            <div className="mt-6 grid grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Pending</p>
                                    <p className="text-lg font-black text-slate-900">${stats?.pendingRevenue?.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Paid</p>
                                    <p className="text-lg font-black text-slate-900">${stats?.paidRevenue?.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Completed</p>
                                    <p className="text-lg font-black text-slate-900">${stats?.completedRevenue?.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">pie_chart</span>
                                Order Status
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Pending', count: stats?.pendingOrders, color: 'bg-amber-500' },
                                    { label: 'Paid', count: stats?.paidOrders, color: 'bg-emerald-500' },
                                    { label: 'Processing', count: stats?.processingOrders, color: 'bg-primary' },
                                    { label: 'Shipped', count: stats?.shippedOrders, color: 'bg-blue-500' },
                                    { label: 'Completed', count: stats?.completedOrders, color: 'bg-slate-900' },
                                    { label: 'Cancelled', count: stats?.cancelledOrders, color: 'bg-red-500' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-3 rounded-full ${item.color}`}></div>
                                            <span className="text-sm font-medium text-slate-600">{item.label}</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8">
                                <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all border border-slate-200">
                                    View All Orders
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
