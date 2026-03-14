import React, { useState, useEffect } from 'react';
import { orderService, giftService, uploadImage, API_ORIGIN } from '../services/api';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [gifts, setGifts] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingGift, setEditingGift] = useState(null);
    const [giftFormData, setGiftFormData] = useState({ messageText: '', mediaUrl: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersRes, giftsRes] = await Promise.all([
                orderService.getMyOrders({ size: 50 }),
                giftService.getMyGifts()
            ]);

            const ordersList = ordersRes.data?.data?.content || ordersRes.data?.data || [];
            setOrders(ordersList);

            // Group gifts by orderId
            const giftsMap = {};
            (giftsRes.data?.data || []).forEach(g => {
                giftsMap[g.orderId] = g;
            });
            setGifts(giftsMap);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditGift = (orderId) => {
        const existing = gifts[orderId] || {};
        setEditingGift(orderId);
        setGiftFormData({
            messageText: existing.messageText || '',
            mediaUrl: existing.mediaUrl || ''
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const url = await uploadImage(file);
            setGiftFormData(prev => ({ ...prev, mediaUrl: url }));
        } catch (error) {
            console.error('Upload failed:', error);
        }
    };

    const saveGift = async () => {
        try {
            setIsSaving(true);
            await giftService.create({
                orderId: editingGift,
                ...giftFormData
            });
            await fetchData();
            setEditingGift(null);
        } catch (error) {
            console.error('Failed to save gift:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID': return 'bg-primary text-background-dark';
            case 'PENDING': return 'bg-amber-400 text-slate-900';
            case 'SHIPPED': return 'bg-cyan-400 text-slate-900';
            case 'COMPLETED': return 'bg-green-500 text-white';
            case 'CANCELLED': return 'bg-slate-400 text-white';
            default: return 'bg-slate-200 text-slate-700';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="flex-1 overflow-auto bg-background-light min-h-screen font-display text-slate-900 transition-colors duration-300">
            <main className="max-w-[1200px] mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">My Orders</h1>
                        <p className="text-slate-500">View and track all your custom print-on-demand creations.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500 font-bold">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center shadow-sm">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 italic">inventory</span>
                        <h2 className="text-2xl font-black text-slate-900 mb-2">No orders yet</h2>
                        <p className="text-slate-500 mb-8">You haven't placed any orders yet. Start creating your first design!</p>
                        <button className="px-8 py-3 bg-primary text-background-dark font-black rounded-xl hover:brightness-110 transition-all">
                            Shop Catalog
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order) => {
                            const gift = gifts[order.id];
                            return (
                                <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col xl:flex-row gap-6">
                                        {/* Status & Preview Section */}
                                        <div className="w-full xl:w-64 h-48 rounded-lg relative overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center border border-slate-100">
                                            {order.orderItems?.[0]?.frontPrintUrl ? (
                                                <img alt="Product" className="w-full h-full object-contain" src={order.orderItems[0].frontPrintUrl.startsWith('http') ? order.orderItems[0].frontPrintUrl : `${API_ORIGIN}${order.orderItems[0].frontPrintUrl}`} />
                                            ) : (
                                                <span className="material-symbols-outlined text-4xl text-slate-200">checkroom</span>
                                            )}
                                            <div className={`absolute top-3 left-3 px-3 py-1 ${getStatusColor(order.status)} text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm`}>
                                                {order.status}
                                            </div>
                                        </div>

                                        {/* Details Section */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-xl font-bold text-slate-900">Order #ORD-{order.id}</h3>
                                                    <span className="text-2xl font-black text-primary">${order.totalAmount?.toFixed(2)}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                                        {formatDate(order.createdDate)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                                        {order.orderItems?.length || 0} Items
                                                    </div>
                                                </div>

                                                {/* Gift Card Status */}
                                                <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between ${gift ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gift ? 'bg-primary/20 text-primary' : 'bg-slate-200 text-slate-400'}`}>
                                                            <span className="material-symbols-outlined text-[20px]">card_giftcard</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-900">Digital Gift Card</p>
                                                            <p className="text-[11px] text-slate-500">{gift ? 'Personal message attached' : 'No gift card added yet'}</p>
                                                        </div>
                                                    </div>
                                                    {order.status === 'PENDING' && (
                                                        <button 
                                                            onClick={() => handleEditGift(order.id)}
                                                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${gift ? 'bg-white border border-primary/30 text-primary hover:bg-primary/10' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                                                        >
                                                            {gift ? 'Edit' : 'Add Gift'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 mt-auto">
                                                <button className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                                                    Track Order
                                                </button>
                                                <button className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                                    Order Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Edit Gift Modal */}
            {editingGift && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-black text-slate-900">Edit Gift Card</h3>
                            <button onClick={() => setEditingGift(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Your Message</label>
                                <textarea 
                                    value={giftFormData.messageText}
                                    onChange={(e) => setGiftFormData(prev => ({ ...prev, messageText: e.target.value }))}
                                    placeholder="Write something emotional..."
                                    className="w-full h-32 px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:outline-none transition-all resize-none text-slate-900"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Video or Photo (Optional)</label>
                                <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl relative">
                                    {giftFormData.mediaUrl ? (
                                        <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                                            {giftFormData.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                                                <video src={giftFormData.mediaUrl} className="w-full h-full object-contain" controls />
                                            ) : (
                                                <img src={giftFormData.mediaUrl} className="w-full h-full object-contain" alt="Gift media" />
                                            )}
                                            <button 
                                                onClick={() => setGiftFormData(prev => ({ ...prev, mediaUrl: '' }))}
                                                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">upload_file</span>
                                            <p className="text-xs text-slate-500 font-bold mb-4 text-center">Tải lên video lời chúc hoặc hình ảnh kỷ niệm (Tối đa 20MB)</p>
                                            <label className="cursor-pointer px-6 py-2 bg-white border border-slate-200 text-slate-900 font-bold rounded-lg text-xs hover:bg-slate-50 transition-all shadow-sm">
                                                Chọn tệp
                                                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    onClick={() => setEditingGift(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-black hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={saveGift}
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-primary text-background-dark rounded-2xl font-black hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
