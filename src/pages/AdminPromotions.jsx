import React, { useEffect, useState } from 'react';
import { promotionService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const AdminPromotions = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPromotion, setCurrentPromotion] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE', // PERCENTAGE, FIXED_AMOUNT
        discountValue: 10,
        minOrderAmount: 0,
        maxUsageCount: 100,
        startDate: '',
        endDate: '',
        active: true
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPromotions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await promotionService.getAll();
            setPromotions(res.data?.data || res.data || []);
        } catch (err) {
            console.error('Error fetching promotions:', err);
            setError('Could not load promotions. Please check your admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const openAddModal = () => {
        setCurrentPromotion({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: 10,
            minOrderAmount: 0,
            maxUsageCount: 100,
            startDate: '',
            endDate: '',
            active: true
        });
        setEditingId(null);
        setError('');
        setModalOpen(true);
    };

    const openEditModal = (promo) => {
        setCurrentPromotion({
            code: promo.code,
            description: promo.description || '',
            discountType: promo.discountType || 'PERCENTAGE',
            discountValue: promo.discountValue || 0,
            minOrderAmount: promo.minOrderAmount || 0,
            maxUsageCount: promo.maxUsageCount || 100,
            startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : '',
            endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : '',
            active: promo.active ?? true
        });
        setEditingId(promo.id);
        setError('');
        setModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!currentPromotion.code.trim()) {
            setError('Coupon code is required.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            const payload = {
                ...currentPromotion,
                startDate: currentPromotion.startDate ? new Date(currentPromotion.startDate).toISOString() : null,
                endDate: currentPromotion.endDate ? new Date(currentPromotion.endDate).toISOString() : null
            };

            if (editingId) {
                await promotionService.update(editingId, payload);
            } else {
                await promotionService.create(payload);
            }
            setModalOpen(false);
            fetchPromotions();
        } catch (err) {
            console.error('Error saving promotion:', err);
            setError(err.response?.data?.message || 'Error saving promotion.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promotion/coupon? This cannot be undone.')) {
            return;
        }

        try {
            await promotionService.delete(id);
            fetchPromotions();
        } catch (err) {
            console.error('Error deleting promotion:', err);
            alert(err.response?.data?.message || 'Failed to delete promotion.');
        }
    };

    return (
        <div className="p-6 font-display w-full h-full flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-gray-900 font-extrabold text-2xl tracking-tight">Promotions & Coupons</h1>
                    <p className="text-gray-500 text-xs mt-1">Manage discounts, percentage off and flat rates coupon codes.</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="bg-primary hover:bg-emerald-400 text-background-dark font-black uppercase tracking-wider text-xs py-3 px-5 rounded-2xl shadow-lg transition-colors flex items-center gap-2"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Coupon
                </button>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
                    {error}
                </div>
            )}

            {/* Promotions Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex-grow flex flex-col">
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Coupon Code</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Discount</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Min Order</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Usage count</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Validity Period</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider">Status</th>
                                <th className="p-4 text-xs font-black uppercase text-gray-500 tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center">
                                        <div className="size-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Retrieving promotion rules...</span>
                                    </td>
                                </tr>
                            ) : promotions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-20 text-center text-gray-400 font-extrabold text-sm uppercase tracking-wider">
                                        No promotions found. Click 'New Coupon' to get started.
                                    </td>
                                </tr>
                            ) : (
                                promotions.map((promo) => (
                                    <tr key={promo.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-black text-sm uppercase tracking-wider">{promo.code}</span>
                                                <span className="text-gray-400 text-xs mt-0.5 max-w-xs truncate">{promo.description || 'Flat discount'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-900 font-black text-sm">
                                                {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% Off` : `${formatCurrency(promo.discountValue)} Off`}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-900 font-bold text-sm">
                                            {formatCurrency(promo.minOrderAmount)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-gray-900 font-bold text-xs">Used: {promo.usedCount || 0}</span>
                                                <span className="text-gray-400 text-[10px] mt-0.5">Limit: {promo.maxUsageCount || 'Unlimited'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500 text-xs">
                                            <div className="flex flex-col gap-0.5">
                                                <span>From: {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : 'N/A'}</span>
                                                <span>To: {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                promo.active 
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-gray-100 text-gray-500 border border-gray-200'
                                            }`}>
                                                {promo.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(promo)}
                                                    className="size-8 rounded-xl bg-gray-50 text-gray-500 hover:bg-primary/10 hover:text-emerald-700 transition-colors flex items-center justify-center"
                                                    title="Edit Promotion"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(promo.id)}
                                                    className="size-8 rounded-xl bg-gray-50 text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-colors flex items-center justify-center"
                                                    title="Delete Promotion"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Dialog */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-gray-900 font-extrabold text-base">
                                {editingId ? 'Edit Coupon Promotion' : 'Create New Coupon'}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="p-6 flex flex-col gap-4">
                            {error && (
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Code</label>
                                <input
                                    type="text"
                                    value={currentPromotion.code}
                                    onChange={(e) => setCurrentPromotion({...currentPromotion, code: e.target.value.toUpperCase()})}
                                    placeholder="SUMMER50, OFF20..."
                                    className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                <input
                                    type="text"
                                    value={currentPromotion.description}
                                    onChange={(e) => setCurrentPromotion({...currentPromotion, description: e.target.value})}
                                    placeholder="Brief coupon rules description..."
                                    className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 placeholder-gray-400 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discount Type</label>
                                    <select
                                        value={currentPromotion.discountType}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, discountType: e.target.value})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount (VND)</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Discount Value</label>
                                    <input
                                        type="number"
                                        value={currentPromotion.discountValue}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, discountValue: Number(e.target.value) || 0})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Min Order (VND)</label>
                                    <input
                                        type="number"
                                        value={currentPromotion.minOrderAmount}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, minOrderAmount: Number(e.target.value) || 0})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Max Uses</label>
                                    <input
                                        type="number"
                                        value={currentPromotion.maxUsageCount}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, maxUsageCount: Number(e.target.value) || 0})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={currentPromotion.startDate}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, startDate: e.target.value})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">End Date</label>
                                    <input
                                        type="datetime-local"
                                        value={currentPromotion.endDate}
                                        onChange={(e) => setCurrentPromotion({...currentPromotion, endDate: e.target.value})}
                                        className="bg-gray-50 border border-gray-100 focus:border-primary/50 text-gray-900 text-xs rounded-xl p-3 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 cursor-pointer py-2 select-none text-xs font-bold text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={currentPromotion.active}
                                    onChange={(e) => setCurrentPromotion({...currentPromotion, active: e.target.checked})}
                                    className="size-4 border-gray-300 rounded focus:ring-primary"
                                />
                                Promotion Active
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-5 py-3 border border-gray-100 hover:bg-gray-50 rounded-2xl text-xs font-bold uppercase tracking-wider text-gray-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-primary hover:bg-emerald-400 text-background-dark font-black uppercase tracking-wider text-xs py-3 px-6 rounded-2xl shadow-lg transition-colors flex items-center gap-1.5"
                                >
                                    {submitting ? 'Saving...' : 'Save Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPromotions;
