import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistService } from '../services/api';
import { useAuth } from './AuthProvider';
import { formatCurrency } from '../utils/formatters';

const ProductCard = ({ product, isWishlistedInitial = false, onWishlistToggle }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isWishlisted, setIsWishlisted] = useState(isWishlistedInitial);
    const [loading, setLoading] = useState(false);

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            if (isWishlisted) {
                await wishlistService.remove(product.id);
                setIsWishlisted(false);
                if (onWishlistToggle) onWishlistToggle(product.id, false);
            } else {
                await wishlistService.add(product.id);
                setIsWishlisted(true);
                if (onWishlistToggle) onWishlistToggle(product.id, true);
            }
        } catch (err) {
            console.error('Error toggling wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const rating = product.rating || 0;
    const ratingCount = product.ratingCount || 0;

    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col h-full relative font-display">
            {/* Image section with glass hover effect */}
            <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden flex items-center justify-center">
                <Link to={`/home/product/${product.slug}`} className="w-full h-full block">
                    <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=60'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                    />
                </Link>

                {/* Trending / Featured badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {product.isTrending && (
                        <span className="bg-emerald-500 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider shadow-sm animate-pulse">
                            Trending
                        </span>
                    )}
                    {product.isFeatured && (
                        <span className="bg-amber-500 text-white text-[10px] uppercase font-black px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                            Featured
                        </span>
                    )}
                </div>

                {/* Wishlist Heart Button */}
                <button
                    onClick={handleWishlistClick}
                    disabled={loading}
                    className={`absolute top-4 right-4 size-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
                        isWishlisted 
                        ? 'bg-rose-50 text-rose-500 scale-110' 
                        : 'bg-white text-gray-400 hover:text-rose-500 hover:scale-110'
                    }`}
                >
                    <span className={`material-symbols-outlined transition-all ${isWishlisted ? 'fill-current' : ''}`}>
                        favorite
                    </span>
                </button>

                {/* Glassmorphism Quick Shop Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center">
                    <Link
                        to={`/home/product/${product.slug}`}
                        className="bg-primary hover:bg-emerald-400 text-background-dark text-xs uppercase font-extrabold px-6 py-2.5 rounded-full shadow-lg transition-colors flex items-center gap-1.5"
                    >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View Details
                    </Link>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Category / Tags */}
                    <div className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-1.5">
                        {product.tags ? product.tags.split(',')[0] : 'T-Shirt'}
                    </div>

                    {/* Title */}
                    <Link to={`/home/product/${product.slug}`} className="block mb-2 group-hover:text-primary transition-colors">
                        <h3 className="text-gray-900 font-bold text-base leading-snug line-clamp-2">
                            {product.name}
                        </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-[16px] ${i < Math.floor(rating) ? 'fill-current' : ''}`}>
                                    star
                                </span>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-gray-500 mt-0.5">({ratingCount})</span>
                    </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider leading-none mb-0.5">Price</span>
                        <span className="text-gray-900 font-black text-lg">
                            {formatCurrency(product.basePrice)}
                        </span>
                    </div>

                    <Link
                        to={`/home/product/${product.slug}`}
                        className="size-9 bg-gray-50 group-hover:bg-primary text-gray-900 group-hover:text-background-dark rounded-xl flex items-center justify-center transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-lg">shopping_bag</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
