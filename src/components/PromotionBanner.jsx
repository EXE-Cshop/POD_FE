import React, { useEffect, useState } from 'react';
import { promotionService } from '../services/api';
import { formatCurrency } from '../utils/formatters';

const PromotionBanner = () => {
    const [promotions, setPromotions] = useState([]);
    const [copiedCode, setCopiedCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPromos = async () => {
            setLoading(true);
            try {
                const res = await promotionService.getActive();
                const data = res.data?.data || res.data || [];
                // Only show active and non-expired promos
                const now = new Date().getTime();
                const activePromos = data.filter(promo => {
                    const isDatesValid = (!promo.startDate || new Date(promo.startDate).getTime() <= now) &&
                                         (!promo.endDate || new Date(promo.endDate).getTime() >= now);
                    return promo.active && isDatesValid;
                });
                setPromotions(activePromos);
            } catch (err) {
                console.error('Error fetching promotions for banner:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPromos();
    }, []);

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(''), 2000);
    };

    if (loading || promotions.length === 0) return null;

    return (
        <div className="font-display w-full flex flex-col gap-4 mb-8">
            <div className="flex items-center justify-between">
                <h3 className="text-gray-900 font-extrabold text-base flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-emerald-500 fill-current">sell</span>
                    Exclusive Offers
                </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {promotions.map((promo) => (
                    <div 
                        key={promo.id} 
                        className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-emerald-600/10"
                    >
                        {/* Decorative circle shapes */}
                        <div className="absolute -top-12 -right-12 size-32 rounded-full bg-white/5 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                        <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-white/5 pointer-events-none"></div>

                        <div>
                            {/* Discount Tag */}
                            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit mb-3">
                                {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `${formatCurrency(promo.discountValue)} OFF`}
                            </div>

                            {/* Description */}
                            <h4 className="font-black text-lg mb-1 leading-snug">{promo.code}</h4>
                            <p className="text-white/80 text-xs font-medium leading-relaxed mb-4">
                                {promo.description || `Save big with this code!`}
                            </p>
                        </div>

                        {/* Copy Code Section */}
                        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 mt-auto">
                            <span className="text-[10px] font-bold text-white/60">
                                {promo.minOrderAmount > 0 ? `Min order ${formatCurrency(promo.minOrderAmount)}` : 'No minimum order'}
                            </span>
                            <button
                                onClick={() => handleCopy(promo.code)}
                                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 ${
                                    copiedCode === promo.code
                                    ? 'bg-white text-emerald-700 font-extrabold'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-white hover:scale-105'
                                }`}
                            >
                                <span className="material-symbols-outlined text-[12px] font-bold">
                                    {copiedCode === promo.code ? 'done' : 'content_copy'}
                                </span>
                                {copiedCode === promo.code ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromotionBanner;
