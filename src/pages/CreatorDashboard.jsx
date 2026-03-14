import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';

const CreatorDashboard = () => {
    const navigate = useNavigate();

    // Mock Data
    const [wallet, setWallet] = useState({
        balance: 50000,
        currency: 'Xu',
        history: [
            { id: 1, date: '2026-03-10', description: 'Bán thiết kế "Cyberpunk Tee"', amount: +15000 },
            { id: 2, date: '2026-03-08', description: 'Đổi mã giảm giá -10%', amount: -20000 },
            { id: 3, date: '2026-03-05', description: 'Bán thiết kế "Minimalist Waves"', amount: +12000 },
            { id: 4, date: '2026-03-01', description: 'Thưởng người mới', amount: +43000 },
        ]
    });

    return (
        <div className="min-h-screen bg-background-light font-display">
            <Header />

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2">Creator Dashboard</h1>
                        <p className="text-slate-500">Quản lý thu nhập và các thiết kế được cộng đồng yêu thích.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Point Wallet Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden h-full">
                            {/* Decorative Blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full"></div>
                            
                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                        <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                                    </div>
                                    <span className="font-bold text-slate-400">Ví điểm</span>
                                </div>

                                <div className="mb-10">
                                    <h2 className="text-5xl font-black flex items-baseline gap-2">
                                        {wallet.balance.toLocaleString()}
                                        <span className="text-xl text-primary font-bold">{wallet.currency}</span>
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-2">≈ { (wallet.balance / 10).toLocaleString() } VNĐ</p>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <button className="w-full py-4 bg-primary text-[#11221c] rounded-2xl font-black hover:brightness-110 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">redeem</span>
                                        Đổi mã giảm giá
                                    </button>
                                    <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-bold hover:bg-white/20 transition-all">
                                        Lịch sử chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction History & Stats */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="material-symbols-outlined text-rose-500 mb-2">favorite</span>
                                <h3 className="text-2xl font-black text-slate-900">1,240</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Lượt thích</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="material-symbols-outlined text-blue-500 mb-2">shopping_bag</span>
                                <h3 className="text-2xl font-black text-slate-900">42</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đơn hàng thiết kế</p>
                            </div>
                            <div className="hidden sm:block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <span className="material-symbols-outlined text-amber-500 mb-2">star</span>
                                <h3 className="text-2xl font-black text-slate-900">4.9</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Đánh giá TB</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="font-black text-slate-900">Lịch sử biến động</h3>
                                <button className="text-primary text-xs font-bold hover:underline">Xem tất cả</button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {wallet.history.map((item) => (
                                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`size-10 rounded-full flex items-center justify-center ${item.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {item.amount > 0 ? 'add' : 'remove'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{item.description}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{item.date}</p>
                                            </div>
                                        </div>
                                        <p className={`font-black ${item.amount > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} Xu
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatorDashboard;
