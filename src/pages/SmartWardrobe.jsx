import React, { useState } from 'react';

const SmartWardrobe = () => {
    const [uploading, setUploading] = useState(false);
    const [items, setItems] = useState([
        { id: 1, name: 'Slate Puffer', category: 'Outerwear', condition: 'New', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjOY7tAVtn73m6BRZp31j3G_X8nzGU97t-3GesS1r-RIBCHFlSwJ6LgPYAXWXNOhNAcmDpLmbFDgAf77udJhanPpiJ5rgmk9BOojGfXxwYy7twN0lHcZsDXPO42snfsL8GUOnp27U1_5rGeyetE9UrPc7J9-BzfC2zBRHjK-XX0yiqv_Qw_RF-gqYngupile3K-ujlnZWVbPUZZNQZ5yBw9PVxn7elXVK9HJvgD3jlwhJ73v6uknuyaZUNSiUZaseJmXqWkL9TJ1o' },
        { id: 2, name: 'Essential Tee', category: 'Basics', condition: 'Good', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfIjJphBVxgcdmE2zXQdT4rmn_SE_OF6UpaVn-fA47agvs4xpJhn-UzgqFMCWLIx1acRXNHrul4fN-rYkCDye_gudYcyUC_eZXwcuFvyReZ1A-0WJL9E0J1UeXHnsl5RCXN0Cr34Q5Ok_IWJkcniTl1IwDOTrbDt0TqK-TvGk9sF8od6b8DDWN0-JIo9lYI7sKaGAi11fMpLpcVhoPzECQSUgR-g22Y1fq0EyhDoTJSl1Hxw3lW9zSgusCIeTxHG1cWGML4GjAgaw' },
        { id: 3, name: 'Straight Denim', category: 'Bottoms', condition: 'Like New', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDxKi20h8KTSu54T5LPmLhBW8dcQJO-__xehsao2qi9mo-Ev75oyLFbb0lf1mCY7hpmZP65s6atSMh-i6r7YVK9uiYaR_4qf8yFjbTvEry3zd2sh2c8dTVblNBEBS71F-UDPlBmbxflt0htZbVJWgdnN8B3nN5Ab-KKb2HK7N8XXSLnA9w7bqRf7Euh3Bw4fSZW2UnIjI-CEIJ9MTPylxkB-JkxStcyPVJuugpMcvhUUPPN80HHes9WH71zj-xd7YDB81xVuLwrKlw' },
        { id: 4, name: 'Midnight Hoodie', category: 'Active', condition: 'Old', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjHdmyMmhHHZRYjZRAS6aAYrkLxoI0oHFFpZ-oWnuNJ22bC0VbSZuid3c3b4lANYDrGI-YslTPi0XjoTr6An5NqavxjsYzlVcrEaOeJ616M64GkkIugAwJEp9EyseEATAtfwZ_ZgOqi9mFhyLoq1dvHUGO0ZiXFGW5u_OOGweq2ziGJkIB8XM9AKisTCk6HMXZj3W43RFlLBP2W2mM-MK_0rHlh70TnV6YUgyd1mgJkI8ukGq87E7gBgwH8k3FGGx5LKnYQ8FTWxU' },
        { id: 5, name: 'Chrono Sneakers', category: 'Footwear', condition: 'New', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALNoqkk-oAIMnHBbF5Fc_RNQ8rUqVN7b3LMRf6_2mbvN4M82NhuB5hcUv8vX1XOlX5_AXkc2MLnONK9O7NgJaDgPejSffxIbFBNyY4VfSR17Z4Ovy_93D3_ZTH0XujJMMvDrviE4bHbz1XEtiuOoGa5IVZl48grET3nM9ciFwblq9ZSPQGM9qclRGa1iw_o8iyvsyJqv3f0HjU4HN9LNK2pOUdWKVJTNGdVlbqcsBW6v6DqC8I7yT7DjibcvTM6XWeRJE6DH9QthA' },
        { id: 6, name: 'Oxford Button', category: 'Shirts', condition: 'Fair', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdxwNVuuxjvKQNEi8P3rtgVhq3KVyiL6ZrAiZyEVcgi1_cBCQQQ7uwQtrJb6fayxoiSJMz-yt6fvilqoB7kCdMPKKj4DHCawPEVIZBYf1RxT1qHrynuTamy1oTgMfd-3VnkbekxDyOb1aa2M5aXB5Ww-oNbB9BKPDeBF352rEvZKaeWg9yGQ5Byi1cE6TEfMZExahKUEUQ69ZUiycvWhdw3scpraJi1_gPt4VDOnHQ8OPp3Ih_kY4a_B7IuFLTxqMLSg6SrpHTMBY' },
    ]);

    const handleUpload = () => {
        setUploading(true);
        // Simulate AI analysis
        setTimeout(() => {
            const newItem = {
                id: Date.now(),
                name: 'Analyzed Item ' + (items.length + 1),
                category: 'Unclassified',
                condition: Math.random() > 0.5 ? 'Good' : 'Needs Care',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAZt92Nd0VGc5P20kSEX5F1rR5j2GqZkKPCuouy7-jeK_QqCYHwyIzDixHVPV7P_0h43jujRyWhr_q6jSuToyrAA4t9CEJYJ1JMZpsh80KHN1jS-uSWw4NOSzoy2YiXGdZwajpNAxOUhjukr1ZjfEtoDwh9c2RBUrX1KgeewY8t4Jojg3pJ3PT15wiJ8OfCAeJKGhzFJRwfYPJ6TUtlW1TgVcDUJI_wluyQTQE8VOnDdE8e-p7wkEhVjZYEFUSgsiacVB_T1v1UNKE'
            };
            setItems([newItem, ...items]);
            setUploading(false);
        }, 2000);
    };

    return (
        <div className="flex-1 min-h-screen bg-background-light text-slate-900 font-display selection:bg-primary/30">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20 py-12 space-y-16">
                
                {/* Hero Section: Today's AI Suggestion */}
                <section className="relative animate-fade-in-up">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                        <div>
                            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider mb-4 border border-primary/30">
                                AI Curation Engine 2.0
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">Today's Smart Choice</h2>
                        </div>
                        <div className="flex gap-3">
                            <span className="px-4 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-slate-200 shadow-sm">
                                <span className="material-symbols-outlined text-sm leading-none text-primary">cloud</span> Partly Cloudy
                            </span>
                            <span className="px-4 py-2 bg-white text-slate-600 text-xs font-bold rounded-xl flex items-center border border-slate-200 shadow-sm">
                                18°C
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* The Main Outfit Card */}
                        <div className="md:col-span-8 lg:col-span-9 group relative h-[500px] md:h-[600px] overflow-hidden rounded-3xl bg-slate-100 shadow-xl border border-white">
                            <img 
                                alt="Complete Outfit" 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZt92Nd0VGc5P20kSEX5F1rR5j2GqZkKPCuouy7-jeK_QqCYHwyIzDixHVPV7P_0h43jujRyWhr_q6jSuToyrAA4t9CEJYJ1JMZpsh80KHN1jS-uSWw4NOSzoy2YiXGdZwajpNAxOUhjukr1ZjfEtoDwh9c2RBUrX1KgeewY8t4Jojg3pJ3PT15wiJ8OfCAeJKGhzFJRwfYPJ6TUtlW1TgVcDUJI_wluyQTQE8VOnDdE8e-p7wkEhVjZYEFUSgsiacVB_T1v1UNKE" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
                            <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div className="text-white max-w-xl">
                                    <h3 className="text-3xl md:text-4xl font-black mb-3">Modern Minimalist</h3>
                                    <p className="text-lg opacity-80 font-medium text-slate-200">Beige Trench + Cotton Tee + Straight Denim</p>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-8 py-4 bg-primary text-[#11221c] rounded-xl font-black shadow-[0_0_20px_rgba(19,236,164,0.3)] hover:shadow-[0_0_30px_rgba(19,236,164,0.5)] hover:bg-primary/90 transition-all flex items-center gap-3 active:scale-95 transform hover:-translate-y-1">
                                        <span className="material-symbols-outlined text-lg">check</span>
                                        Wear This
                                    </button>
                                    <button className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                                        <span className="material-symbols-outlined">shuffle</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Side Context Panel */}
                        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-6">
                            <div className="flex-1 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                <h4 className="font-bold text-lg mb-6 flex items-center gap-3 text-slate-900">
                                    <span className="material-symbols-outlined text-primary" >info</span>
                                    Context Analysis
                                </h4>
                                <ul className="space-y-6 text-sm text-slate-600 font-medium">
                                    <li className="flex gap-4">
                                        <span className="shrink-0 size-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(19,236,164,0.5)]"></span>
                                        <span>Matches your client meeting at 10:00 AM.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="shrink-0 size-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(19,236,164,0.5)]"></span>
                                        <span>Optimal for today's 65% humidity levels.</span>
                                    </li>
                                    <li className="flex gap-4">
                                        <span className="shrink-0 size-2 rounded-full bg-primary mt-2 shadow-[0_0_8px_rgba(19,236,164,0.5)]"></span>
                                        <span>High styling versatility for evening plans.</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="p-8 bg-slate-900 rounded-3xl shadow-xl border border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sustainability Impact</p>
                                    <span className="text-2xl font-black text-primary">A+</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
                                    <div className="w-[92%] h-full bg-primary rounded-full shadow-[0_0_10px_rgba(19,236,164,0.4)]"></div>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium italic">This curation is 92% eco-friendly.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Digital Closet Section */}
                <section className="pt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                        <div className="flex items-baseline gap-4">
                            <h2 className="text-3xl font-black tracking-tight text-slate-900">Digital Closet</h2>
                            <span className="text-sm font-bold text-slate-400">{items.length} Items Total</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                                <span className="material-symbols-outlined text-lg">filter_list</span>
                                Filter
                            </button>
                            <label className="relative flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all shadow-xl cursor-pointer overflow-hidden active:scale-95 group">
                                {uploading ? (
                                    <>
                                        <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                                        AI Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Add New Item
                                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
                        {items.map((item, idx) => (
                            <div 
                                key={item.id} 
                                className="group cursor-pointer animate-fade-in-up"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className="aspect-[4/5] rounded-2xl bg-white mb-4 p-4 flex items-center justify-center transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10 group-hover:-translate-y-2 border border-slate-200 group-hover:border-primary/50 relative overflow-hidden">
                                    <img 
                                        alt={item.name} 
                                        className="max-h-full transition-transform duration-500 group-hover:scale-105" 
                                        src={item.img} 
                                    />
                                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm opacity-0 group-hover:opacity-100 transition-opacity border ${
                                        item.condition === 'New' || item.condition === 'Like New' 
                                        ? 'bg-primary/20 text-primary border-primary/20' 
                                        : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {item.condition}
                                    </div>
                                </div>
                                <div className="px-1 text-center sm:text-left">
                                    <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{item.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.category}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sustainability Alerts Section */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-10 pt-8">
                    <div className="md:col-span-7 space-y-8">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900">Wardrobe Management</h2>
                        <div className="space-y-6">
                            {/* Donate Card */}
                            <div className="group bg-white rounded-3xl p-8 flex flex-col sm:flex-row gap-8 transition-all hover:border-primary/30 shadow-sm hover:shadow-xl border border-slate-200">
                                <div className="size-40 bg-slate-50 rounded-2xl p-4 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/5 transition-colors">
                                    <img alt="Sweater" className="max-h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt0dq175GDvXh0s-NZXVuLBZUWTn8cIfecYyGi5PWthWEL73aEt0LrMhnCpKDlfyOG6uSqkN_p3TW0zdeVT9UDqZf18V2cyEeMuTQZZMx_U7MggWsBZXV-YSvURPjWhYZ-KCxowF62eGmeTetKH_oFENhUq8s7P_QGOP6Y4iOX3A3VDdRppI7cehMDvShq9_BZLAL75CsR59qZKMtktoo5VZIFDzlY_BAaPwqFyvot2T-PAaE_YGHSkaQb67dO97qsvCFIGeJaV6M" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                                                <span className="material-symbols-outlined text-[24px] leading-none">volunteer_activism</span>
                                            </div>
                                            <h3 className="font-bold text-xl text-slate-900">Donate Recommendation</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">You haven't worn this item in over 9 months. Pass it on to earn a <span className="text-primary font-bold">$20 Credits</span>.</p>
                                    </div>
                                    <button className="w-fit mt-6 px-8 py-3.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-[#11221c] transition-all shadow-lg active:scale-95">
                                        Donate for Credit
                                    </button>
                                </div>
                            </div>

                            {/* Recycle Card */}
                            <div className="group bg-white rounded-3xl p-8 flex flex-col sm:flex-row gap-8 transition-all hover:border-red-500/30 shadow-sm hover:shadow-xl border border-slate-200">
                                <div className="size-40 bg-slate-50 rounded-2xl p-4 overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-red-50 transition-colors">
                                    <img alt="Denim" className="max-h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSPeu2SYD_4uD7HmJVz5JlWbWBqz-ICsM2G9Pw6Rxv8CB5ejjw5WVAK2wdcmOURsRdfmVb3BiFS-ByQMLXDUucIp6dPS5LT045dwTw0gPTE_WbbY_7_E4ziwKB3abuj8NRe5zLH8t_v38XVDkKjsxZQMrR_gEdDTlw01a8uH_QQ_bJlU3ghnEx3FHQVcxSB-cRtpMR0yn1L-1-B3KhVKrgPcQxljoylrIxVVX69ATmO4M_h7dKOL0q_e3CycvLxAMrAwcXp3VHt4Q" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2.5 bg-red-50 rounded-xl text-red-500">
                                                <span className="material-symbols-outlined text-[24px] leading-none">recycling</span>
                                            </div>
                                            <h3 className="font-bold text-xl text-slate-900">Recycle Alert</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 leading-relaxed font-medium">This item is significantly worn. Trade it in for our recycling program.</p>
                                    </div>
                                    <button className="w-fit mt-6 px-8 py-3.5 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg active:scale-95 shadow-red-200">
                                        Recycle Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Circularity Metrics */}
                    <div className="md:col-span-12 lg:col-span-5 flex flex-col pt-16">
                        <div className="bg-slate-900 rounded-[2.5rem] p-12 lg:p-14 flex-1 relative overflow-hidden shadow-2xl flex flex-col justify-center border border-slate-800">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-4 text-white">Wardrobe Health</h3>
                                <p className="text-base text-slate-400 mb-12 max-w-sm font-medium leading-relaxed">Your sustainability score increased by <span className="text-primary font-black">12%</span> this month!</p>
                                
                                <div className="flex items-end gap-2 mb-12">
                                    <span className="text-9xl font-black text-primary leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(19,236,164,0.3)]">78</span>
                                    <span className="text-2xl font-black text-slate-600 mb-4 tracking-tighter uppercase">/ 100</span>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                                        <span>Wear Frequency</span>
                                        <span className="text-primary">High Utility</span>
                                    </div>
                                    <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(19,236,164,0.4)]" 
                                            style={{width: '78%'}}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -right-20 -bottom-20 size-[30rem] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow"></div>
                            <div className="absolute top-10 left-10 size-32 bg-primary/5 rounded-full blur-[60px]"></div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default SmartWardrobe;
