import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/api';

const CategoryFilter = ({ 
    selectedCategory, 
    onSelectCategory, 
    minPrice, 
    maxPrice, 
    onPriceChange,
    sortBy,
    onSortChange
}) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                const res = await categoryService.getAll();
                const data = res.data?.data || res.data || [];
                setCategories(data.filter(c => c.active));
            } catch (err) {
                console.error('Error fetching categories for filter:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const sortOptions = [
        { label: 'Latest Styles', value: 'id,desc' },
        { label: 'Price: Low to High', value: 'basePrice,asc' },
        { label: 'Price: High to Low', value: 'basePrice,desc' },
        { label: 'Trending', value: 'isTrending,desc' },
        { label: 'Featured', value: 'isFeatured,desc' }
    ];

    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm font-display flex flex-col gap-6">
            {/* Sort Section */}
            <div>
                <h3 className="text-gray-900 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-emerald-500">sort</span>
                    Sort By
                </h3>
                <div className="flex flex-col gap-2">
                    {sortOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => onSortChange(option.value)}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                                sortBy === option.value
                                ? 'bg-primary/10 text-emerald-700 border border-primary/20'
                                : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                            }`}
                        >
                            {option.label}
                            {sortBy === option.value && (
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Categories List */}
            <div>
                <h3 className="text-gray-900 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-emerald-500">category</span>
                    Categories
                </h3>
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={() => onSelectCategory(null)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                                !selectedCategory
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            All Collections
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onSelectCategory(cat.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                                    selectedCategory === cat.id
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* Price Filter */}
            <div>
                <h3 className="text-gray-900 font-extrabold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-emerald-500">payments</span>
                    Price Range
                </h3>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">VND</span>
                        <input
                            type="number"
                            placeholder="Min"
                            value={minPrice || ''}
                            onChange={(e) => onPriceChange(Number(e.target.value) || 0, maxPrice)}
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 placeholder-gray-400 text-xs rounded-xl pl-10 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <span className="text-gray-400 font-bold text-xs">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-bold">VND</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxPrice || ''}
                            onChange={(e) => onPriceChange(minPrice, Number(e.target.value) || 0)}
                            className="w-full bg-gray-50 border border-gray-100 text-gray-900 placeholder-gray-400 text-xs rounded-xl pl-10 pr-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Clear All */}
            <button
                onClick={() => {
                    onSelectCategory(null);
                    onPriceChange(0, 0);
                    onSortChange('id,desc');
                }}
                className="w-full bg-gray-50 hover:bg-rose-50 text-gray-500 hover:text-rose-600 border border-gray-100 hover:border-rose-100 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
                <span className="material-symbols-outlined text-sm font-bold">filter_alt_off</span>
                Reset Filters
            </button>
        </div>
    );
};

export default CategoryFilter;
