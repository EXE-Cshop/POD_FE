import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Comprehensive mock data covering different categories
const allProducts = [
    {
        id: 1,
        title: "Classic Heavyweight Tee",
        category: "T-Shirts",
        price: "$24.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrGJnglhAjDuPNkJgnc4cGiA7RrI4knQya_aIqD5e4WSGqJ1jbXHuYAWDENee3Q6e8dJNFWCnVe9P9qdf13Pk0eGCfZxTtI8A8AncgT6cZDWcJ_5XYh8YsGpJWibXvz9nvcaBY_TDw-CmTQtASLq5y0LgTyOEVzEfA3sMWXg-BnShdI-ZHnF7FAjsH8e9qRgpXcIZq91rM_T0PnuADqQPXjeB94zdgEwoM49q4weNZQ_85yT8rFCcPHtBD-HJxAUQsPXuJsa5KhU",
        description: "Ultra-soft 100% ringspun cotton with a modern relaxed fit.",
        tag: "Best Seller",
        tagColor: "bg-primary text-[#11221c]"
    },
    {
        id: 2,
        title: "Essential Pullover Hoodie",
        category: "Hoodies",
        price: "$45.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCpEj-7DL9XRZPH4kEOoLjpSVJULmPWAkdUzOsLdthGk1OMyhLpfFrszA3VyuqppkQDGblSrqYI6F1dHJDQnB15hxvQIpLceY-Xja_BLgoN5uQ1Rb4HlqrCdXrbMtoW6GHDrjB6j35Dzm1HOWEAcJsSUskaQSbP61F4d4XhQwwnYpfNel5CTBy2FFwAyocH-WoOANJ6TsUD8mY81o_WnVsoRW0TZeUV3z-waocdXrCfTDapjJnMWDxsQF1KUjid1ujGCA2H_r_tYY",
        description: "Double-lined hood and spacious pouch pocket for ultimate comfort.",
        tag: "New Arrival",
        tagColor: "bg-slate-800 text-white"
    },
    {
        id: 3,
        title: "Ceramic Coffee Mug (11oz)",
        category: "Mugs",
        price: "$12.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcWFjI8XBegFLDDWDZmE_USMLx2E278vt7nuRFKQwDt6mDO_INQVvwxHjFlac8n_VpvMAD4X7iZbMlVBoZLEVqbM77yqesWevjAqElTJiwZQHBCaE4jDz3wMYt6NitdZSmp608ooYkJURN7g74yPAcVI9KDfIt2hKN2dV2DCcQ_X-55PyveyOSQXNvgtlPCzwWrLIORxEr1YVCYF_YGz4dG6MSdw_EyI2GCvDTu137wLiN367HCLGLHv9xTyBODrOR-8711xgY-4s",
        description: "Vibrant, high-gloss finish perfect for your favorite morning brew.",
        tag: null
    },
    {
        id: 4,
        title: "Gallery Wrap Canvas",
        category: "Posters",
        price: "$38.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuPq4W_QYFZj-gMZAaxC0aBuTzyBYPMoE43m5ooadhmn-yHy5Tt8YiTAqx_mMv5cuVDCikuk122VqlO8wq5yC6k2npKY5wtkIaNC7BYMzTLaVmwoVAgbTAND-Jw2y_ughEwrKvzHLbUgBggKvuAYa2AT6xoHL73BZnRjXY6WBzyKzLPQPWsTfixD7VJdvpoa6E-NA9yR3Rj6FN4fsf18tg_oO7K3ss8-ykVR5l9JSk8hJUejrG7JZnah7-68eTlrmuR2EP7DpkJ-o",
        description: "High-quality textured canvas on a solid wood frame. Fade-resistant inks.",
        tag: null
    },
    {
        id: 5,
        title: "Organic Cotton Tote",
        category: "Accessories",
        price: "$18.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQIfxC0bvr7Q-7gUGZDJ49B22vkEK090vJDzaKWVmkcGrBn8gNDhlCNUoDRxmr_rONHUFAw-pfzgZ1Gut8g9yH236o1c0fUcNFVZjSkWgUuwtSV9NxAq6d3ok-VG-cBPh3fvjN86CS27y3leCclNZM5M9dD1w0QV94sEQVCdoar973XM0Ik0YYy0vT_83HVopuPKdMRPas4KKeaMZfOn4gILDUBVTiR526XstczljZHiSqnDegkoquMf7S0MaeSr6lr6Z32XfK3R8",
        description: "Reinforced stress points and wide bottom gusset. Sustainable choice.",
        tag: null
    },
    {
        id: 6,
        title: "Boxy Oversized Tee",
        category: "T-Shirts",
        price: "$28.00",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNuYqvcGHzZoeuUV1vzUiJRy7XrH7eSUEPdZHcC_0U8D0OBfAXaifDjoUQ0rGJfv1bHPgYhphNbwPYCPfpBXxyLhCRWRRuJ2TxPEvzzyu9ifiEZ8WhbSE4hHV7u9-XFndBotSZkki0OcZ5pMnzVIFVkMR_62SjB--o6-rvuTrbHXTHtwqSJ1nmd3yV7JIl829_C3ITuAMMj9Jln9VhzkJ-S79rgN4YMb26uyrk8-Hu-nBvQPqWfb5aL8vZBCNR6WexL23SdFJr0mI",
        description: "Dropped shoulders directly down with a structured drape.",
        tag: null
    }
];

const Catalog = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState(allProducts);

    // Sync URL parameter with local state
    // Ex: ?category=T-Shirts
    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat) {
            setSelectedCategory(cat);
        } else {
            setSelectedCategory('All');
        }
    }, [searchParams]);

    // Filter products when selectedCategory changes
    useEffect(() => {
        if (selectedCategory === 'All') {
            setFilteredProducts(allProducts);
        } else {
            setFilteredProducts(allProducts.filter(p => p.category === selectedCategory));
        }
    }, [selectedCategory]);

    const handleCategoryClick = (category) => {
        if (category === 'All') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', category);
        }
        setSearchParams(searchParams);
    };

    return (
        <div className="flex-1 overflow-auto max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-8 text-slate-900 bg-background-light w-full">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-slate-500 text-sm font-medium hover:text-primary cursor-pointer" onClick={() => navigate('/home')}>Home</span>
                <span className="material-symbols-outlined text-slate-400 text-xs">chevron_right</span>
                <span className="text-primary text-sm font-semibold">Catalog</span>
            </div>

            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                <div className="max-w-2xl">
                    <h1 className="text-slate-900 text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">
                        {selectedCategory === 'All' ? 'All Products' : `${selectedCategory}`}
                    </h1>
                    <p className="text-slate-600 text-lg mt-2">Find the perfect blank canvas for your art.</p>
                </div>
                <div className="flex items-center gap-3 bg-slate-200 p-1 rounded-lg">
                    <button className="px-4 py-2 rounded-md bg-primary text-[#11221c] text-sm font-bold shadow-sm">Grid View</button>
                    <button className="px-4 py-2 rounded-md text-slate-600 text-sm font-bold hover:text-white transition-colors">List View</button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation (Filters) */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-24 flex flex-col gap-8 bg-slate-100 p-6 rounded-xl border border-slate-200">
                        <div>
                            <h3 className="text-slate-900 text-sm font-bold uppercase tracking-wider mb-4">Categories</h3>
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => handleCategoryClick('All')}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${selectedCategory === 'All' ? 'bg-primary/10 text-primary border border-primary/20 font-semibold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">grid_view</span>
                                    <span className="text-sm">All Products</span>
                                </button>
                                <button
                                    onClick={() => handleCategoryClick('T-Shirts')}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${selectedCategory === 'T-Shirts' ? 'bg-primary/10 text-primary border border-primary/20 font-semibold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">checkroom</span>
                                    <span className="text-sm">T-Shirts</span>
                                </button>
                                <button
                                    onClick={() => handleCategoryClick('Hoodies')}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${selectedCategory === 'Hoodies' ? 'bg-primary/10 text-primary border border-primary/20 font-semibold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">apparel</span>
                                    <span className="text-sm">Hoodies</span>
                                </button>
                                <button
                                    onClick={() => handleCategoryClick('Mugs')}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${selectedCategory === 'Mugs' ? 'bg-primary/10 text-primary border border-primary/20 font-semibold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">coffee</span>
                                    <span className="text-sm">Mugs</span>
                                </button>
                                <button
                                    onClick={() => handleCategoryClick('Posters')}
                                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all ${selectedCategory === 'Posters' ? 'bg-primary/10 text-primary border border-primary/20 font-semibold' : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 font-medium'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">image</span>
                                    <span className="text-sm">Posters</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-slate-900 text-sm font-bold uppercase tracking-wider mb-4">Filter by Color</h3>
                            <div className="flex flex-wrap gap-3">
                                <button className="size-8 rounded-full border-2 border-slate-200 bg-black" title="Black"></button>
                                <button className="size-8 rounded-full border-2 border-slate-200 bg-white" title="White"></button>
                                <button className="size-8 rounded-full bg-blue-600" title="Navy"></button>
                                <button className="size-8 rounded-full bg-red-600" title="Red"></button>
                                <button className="size-8 rounded-full bg-gray-500" title="Heather Gray"></button>
                            </div>
                        </div>

                        <button
                            onClick={() => handleCategoryClick('All')}
                            className="w-full flex items-center justify-center gap-2 rounded-lg h-11 bg-slate-200 text-slate-900 text-sm font-bold hover:bg-slate-300 transition-colors mt-4"
                        >
                            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                            Clear Filters
                        </button>
                    </div>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {filteredProducts.length === 0 ? (
                        <div className="w-full py-20 flex items-center justify-center text-slate-500">
                            No products found in this category.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map((product, idx) => (
                                <div
                                    key={product.id}
                                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both', animationName: 'fade-in-up', animationDuration: '0.8s' }}
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => navigate(`/home/product/${product.id}`)}>
                                        <img
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            src={product.image}
                                            alt={product.title}
                                        />
                                        {product.tag && (
                                            <div className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm ${product.tagColor}`}>
                                                {product.tag}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col grow">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
                                        <h3
                                            className="text-slate-900 text-lg font-bold leading-tight mb-2 cursor-pointer hover:text-primary transition-colors"
                                            onClick={() => navigate(`/home/product/${product.id}`)}
                                        >
                                            {product.title}
                                        </h3>
                                        <span className="text-primary text-xl font-black mb-4">{product.price}</span>
                                        <button
                                            onClick={() => navigate('/design')}
                                            className="w-full mt-auto flex items-center justify-center gap-2 rounded-lg h-11 bg-slate-100 text-slate-900 text-sm font-bold hover:bg-primary hover:text-[#11221c] transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">palette</span>
                                            Design Now
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredProducts.length > 0 && (
                        <div className="flex items-center justify-center gap-4 mt-16 py-8 border-t border-slate-200">
                            <button className="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-all">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <div className="flex items-center gap-2">
                                <button className="size-10 rounded-lg bg-primary text-[#11221c] font-black">1</button>
                            </div>
                            <button className="flex size-10 items-center justify-center rounded-lg bg-slate-200 text-slate-600 hover:bg-primary hover:text-[#11221c] transition-all">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Catalog;
