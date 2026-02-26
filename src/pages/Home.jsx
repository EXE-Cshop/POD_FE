import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    // Hardcoded data matching the design provided
    const products = [
        {
            id: 1,
            title: "Classic Heavyweight Tee",
            category: "Premium Cotton",
            price: "$24.00",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrGJnglhAjDuPNkJgnc4cGiA7RrI4knQya_aIqD5e4WSGqJ1jbXHuYAWDENee3Q6e8dJNFWCnVe9P9qdf13Pk0eGCfZxTtI8A8AncgT6cZDWcJ_5XYh8YsGpJWibXvz9nvcaBY_TDw-CmTQtASLq5y0LgTyOEVzEfA3sMWXg-BnShdI-ZHnF7FAjsH8e9qRgpXcIZq91rM_T0PnuADqQPXjeB94zdgEwoM49q4weNZQ_85yT8rFCcPHtBD-HJxAUQsPXuJsa5KhU",
            description: "Ultra-soft 100% ringspun cotton with a modern relaxed fit and durable stitching.",
            tag: "Best Seller",
            tagColor: "bg-primary text-[#11221c]"
        },
        {
            id: 2,
            title: "Essential Pullover Hoodie",
            category: "French Terry",
            price: "$45.00",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCpEj-7DL9XRZPH4kEOoLjpSVJULmPWAkdUzOsLdthGk1OMyhLpfFrszA3VyuqppkQDGblSrqYI6F1dHJDQnB15hxvQIpLceY-Xja_BLgoN5uQ1Rb4HlqrCdXrbMtoW6GHDrjB6j35Dzm1HOWEAcJsSUskaQSbP61F4d4XhQwwnYpfNel5CTBy2FFwAyocH-WoOANJ6TsUD8mY81o_WnVsoRW0TZeUV3z-waocdXrCfTDapjJnMWDxsQF1KUjid1ujGCA2H_r_tYY",
            description: "Double-lined hood and spacious pouch pocket for ultimate comfort and style.",
            tag: "New Arrival",
            tagColor: "bg-slate-800 text-white"
        },
        {
            id: 3,
            title: "Ceramic Coffee Mug (11oz)",
            category: "Dishwasher Safe",
            price: "$12.00",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcWFjI8XBegFLDDWDZmE_USMLx2E278vt7nuRFKQwDt6mDO_INQVvwxHjFlac8n_VpvMAD4X7iZbMlVBoZLEVqbM77yqesWevjAqElTJiwZQHBCaE4jDz3wMYt6NitdZSmp608ooYkJURN7g74yPAcVI9KDfIt2hKN2dV2DCcQ_X-55PyveyOSQXNvgtlPCzwWrLIORxEr1YVCYF_YGz4dG6MSdw_EyI2GCvDTu137wLiN367HCLGLHv9xTyBODrOR-8711xgY-4s",
            description: "Vibrant, high-gloss finish perfect for your favorite morning brew.",
            tag: null
        },
        {
            id: 4,
            title: "Gallery Wrap Canvas",
            category: "Home Decor",
            price: "$38.00",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuPq4W_QYFZj-gMZAaxC0aBuTzyBYPMoE43m5ooadhmn-yHy5Tt8YiTAqx_mMv5cuVDCikuk122VqlO8wq5yC6k2npKY5wtkIaNC7BYMzTLaVmwoVAgbTAND-Jw2y_ughEwrKvzHLbUgBggKvuAYa2AT6xoHL73BZnRjXY6WBzyKzLPQPWsTfixD7VJdvpoa6E-NA9yR3Rj6FN4fsf18tg_oO7K3ss8-ykVR5l9JSk8hJUejrG7JZnah7-68eTlrmuR2EP7DpkJ-o",
            description: "High-quality textured canvas on a solid wood frame. Fade-resistant inks.",
            tag: null
        },
        {
            id: 5,
            title: "Organic Cotton Tote",
            category: "Eco-Friendly",
            price: "$18.00",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQIfxC0bvr7Q-7gUGZDJ49B22vkEK090vJDzaKWVmkcGrBn8gNDhlCNUoDRxmr_rONHUFAw-pfzgZ1Gut8g9yH236o1c0fUcNFVZjSkWgUuwtSV9NxAq6d3ok-VG-cBPh3fvjN86CS27y3leCclNZM5M9dD1w0QV94sEQVCdoar973XM0Ik0YYy0vT_83HVopuPKdMRPas4KKeaMZfOn4gILDUBVTiR526XstczljZHiSqnDegkoquMf7S0MaeSr6lr6Z32XfK3R8",
            description: "Reinforced stress points and wide bottom gusset. Sustainable choice.",
            tag: null
        },
        {
            id: 6,
            title: "Boxy Oversized Tee",
            category: "Streetwear",
            price: "$28.00",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBNuYqvcGHzZoeuUV1vzUiJRy7XrH7eSUEPdZHcC_0U8D0OBfAXaifDjoUQ0rGJfv1bHPgYhphNbwPYCPfpBXxyLhCRWRRuJ2TxPEvzzyu9ifiEZ8WhbSE4hHV7u9-XFndBotSZkki0OcZ5pMnzVIFVkMR_62SjB--o6-rvuTrbHXTHtwqSJ1nmd3yV7JIl829_C3ITuAMMj9Jln9VhzkJ-S79rgN4YMb26uyrk8-Hu-nBvQPqWfb5aL8vZBCNR6WexL23SdFJr0mI",
            description: "Dropped shoulders and a structured drape for that modern street aesthetic.",
            tag: null
        }
    ];

    const categories = [
        { id: 1, name: "T-Shirts", icon: "checkroom", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOrGJnglhAjDuPNkJgnc4cGiA7RrI4knQya_aIqD5e4WSGqJ1jbXHuYAWDENee3Q6e8dJNFWCnVe9P9qdf13Pk0eGCfZxTtI8A8AncgT6cZDWcJ_5XYh8YsGpJWibXvz9nvcaBY_TDw-CmTQtASLq5y0LgTyOEVzEfA3sMWXg-BnShdI-ZHnF7FAjsH8e9qRgpXcIZq91rM_T0PnuADqQPXjeB94zdgEwoM49q4weNZQ_85yT8rFCcPHtBD-HJxAUQsPXuJsa5KhU" },
        { id: 2, name: "Hoodies", icon: "apparel", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCpEj-7DL9XRZPH4kEOoLjpSVJULmPWAkdUzOsLdthGk1OMyhLpfFrszA3VyuqppkQDGblSrqYI6F1dHJDQnB15hxvQIpLceY-Xja_BLgoN5uQ1Rb4HlqrCdXrbMtoW6GHDrjB6j35Dzm1HOWEAcJsSUskaQSbP61F4d4XhQwwnYpfNel5CTBy2FFwAyocH-WoOANJ6TsUD8mY81o_WnVsoRW0TZeUV3z-waocdXrCfTDapjJnMWDxsQF1KUjid1ujGCA2H_r_tYY" },
        { id: 3, name: "Mugs", icon: "coffee", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcWFjI8XBegFLDDWDZmE_USMLx2E278vt7nuRFKQwDt6mDO_INQVvwxHjFlac8n_VpvMAD4X7iZbMlVBoZLEVqbM77yqesWevjAqElTJiwZQHBCaE4jDz3wMYt6NitdZSmp608ooYkJURN7g74yPAcVI9KDfIt2hKN2dV2DCcQ_X-55PyveyOSQXNvgtlPCzwWrLIORxEr1YVCYF_YGz4dG6MSdw_EyI2GCvDTu137wLiN367HCLGLHv9xTyBODrOR-8711xgY-4s" },
        { id: 4, name: "Posters", icon: "image", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDuPq4W_QYFZj-gMZAaxC0aBuTzyBYPMoE43m5ooadhmn-yHy5Tt8YiTAqx_mMv5cuVDCikuk122VqlO8wq5yC6k2npKY5wtkIaNC7BYMzTLaVmwoVAgbTAND-Jw2y_ughEwrKvzHLbUgBggKvuAYa2AT6xoHL73BZnRjXY6WBzyKzLPQPWsTfixD7VJdvpoa6E-NA9yR3Rj6FN4fsf18tg_oO7K3ss8-ykVR5l9JSk8hJUejrG7JZnah7-68eTlrmuR2EP7DpkJ-o" },
    ];

    return (
        <div className="flex flex-col w-full text-slate-900 bg-background-light">

            {/* Hero Section */}
            <section className="relative w-full h-[500px] md:h-[600px] flex items-center bg-slate-900 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0 opacity-40">
                    <img
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080&auto=format&fit=crop"
                        alt="Custom Apparel"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
                </div>

                <div className="relative z-10 max-w-[1440px] w-full mx-auto px-6 md:px-10 lg:px-20 animate-fade-in-up">
                    <div className="max-w-2xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-primary/30">
                            Premium Print On Demand
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-6">
                            Create Custom Apparel That Stands Out
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-xl leading-relaxed">
                            Turn your designs into high-quality merchandise instantly. No minimums, fast shipping, and premium blanks.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={() => navigate('/home/catalog')}
                                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-primary text-[#11221c] text-lg font-extrabold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(20,200,100,0.3)] hover:shadow-[0_0_30px_rgba(20,200,100,0.5)] transform hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Start Designing <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => document.getElementById('featured-categories').scrollIntoView({ behavior: 'smooth' })}
                                className="w-full sm:w-auto px-8 py-4 rounded-lg bg-white/10 text-white backdrop-blur-sm border border-white/20 text-lg font-bold hover:bg-white/20 transition-all flex items-center justify-center"
                            >
                                Explore Catalog
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">How It Works</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Create and sell your custom products in three simple steps.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-[#11221c] transition-colors">checkroom</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">1. Select a Product</h3>
                            <p className="text-slate-500 leading-relaxed">Browse our extensive catalog of premium blank apparel and accessories.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-[#11221c] transition-colors">palette</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">2. Add Your Design</h3>
                            <p className="text-slate-500 leading-relaxed">Upload your artwork, adjust placement, and preview it in 3D realistically.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <span className="material-symbols-outlined text-[32px] text-primary group-hover:text-[#11221c] transition-colors">local_shipping</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">3. We Print & Ship</h3>
                            <p className="text-slate-500 leading-relaxed">We handle the printing, packing, and global shipping directly to your customers.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section id="featured-categories" className="py-20 bg-slate-50 border-y border-slate-200">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">Shop by Category</h2>
                            <p className="text-slate-500">Find the perfect blank canvas for your art.</p>
                        </div>
                        <button
                            onClick={() => navigate('/home/catalog')}
                            className="hidden sm:flex text-primary font-bold hover:text-primary/80 items-center gap-1 transition-colors"
                        >
                            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up">
                        {categories.map((cat, idx) => (
                            <div
                                key={cat.id}
                                onClick={() => navigate(`/home/catalog?category=${cat.name}`)}
                                className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/5] sm:aspect-square bg-slate-200"
                                style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both', animationName: 'fade-in-up', animationDuration: '0.8s' }}
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 flex flex-col items-center text-center">
                                    <span className="material-symbols-outlined text-white/80 text-[32px] mb-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        {cat.icon}
                                    </span>
                                    <h3 className="text-white text-xl md:text-2xl font-bold tracking-wide transform translate-y-2 group-hover:-translate-y-1 transition-all duration-300">{cat.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trending Products Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Trending Blanks</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Our most popular products, loved by creators worldwide.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
                        {products.slice(0, 4).map((product, idx) => (
                            <div
                                key={product.id}
                                className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2"
                                style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both', animationName: 'fade-in-up', animationDuration: '0.8s' }}
                            >
                                <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 cursor-pointer" onClick={() => navigate(`/home/product/${product.id}`)}>
                                    <img
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        src={product.image}
                                        alt={product.title}
                                    />
                                    {product.tag && (
                                        <div className={`absolute top-3 left-3 text-[10px] font-black uppercase px-2 py-1 rounded shadow-sm ${product.tagColor}`}>
                                            {product.tag}
                                        </div>
                                    )}
                                    <button className="absolute top-3 right-3 size-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                                        <span className="material-symbols-outlined text-[20px]">favorite</span>
                                    </button>
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
                                        Customize
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
