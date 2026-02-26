import React from 'react';

const OrderHistory = () => {
    return (
        <div className="flex-1 overflow-auto bg-background-light  min-h-screen font-display text-slate-900  transition-colors duration-300">
            {/* Top Navigation Bar - Removed as it's provided by DashboardLayout but keeping content structure */}
            <main className="max-w-[1200px] mx-auto px-6 py-10">
                {/* Page Heading Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 ">My Orders</h1>
                        <p className="text-slate-500 ">View and track all your custom print-on-demand creations.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100  rounded-lg text-sm font-bold hover:bg-slate-200  transition-colors text-slate-900 ">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100  rounded-lg text-sm font-bold hover:bg-slate-200  transition-colors text-slate-900 ">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="border-b border-slate-200  mb-8">
                    <div className="flex gap-8">
                        <button className="border-b-2 border-primary text-primary pb-4 px-1 text-sm font-bold">All Orders</button>
                        <button className="border-b-2 border-transparent text-slate-500  hover:text-slate-900  pb-4 px-1 text-sm font-bold transition-colors">Pending</button>
                        <button className="border-b-2 border-transparent text-slate-500  hover:text-slate-900  pb-4 px-1 text-sm font-bold transition-colors">Shipped</button>
                        <button className="border-b-2 border-transparent text-slate-500  hover:text-slate-900  pb-4 px-1 text-sm font-bold transition-colors">Completed</button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="grid grid-cols-1 gap-6">
                    {/* Order Card 1: Completed */}
                    <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Status & Image Section */}
                            <div className="w-full xl:w-64 h-48 rounded-lg relative overflow-hidden shrink-0">
                                <img alt="Product thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCW98EHtjE8RcwgSDKvL61A4XwOrCMt0iatxLKo6uVp5PdutUGT2SmAxdKeorIWe0Ck64HufVtlIGI_ZCRb1kUzu-xg30qGezn5vniABIynU-UtHe-KEx8nb6Mt8sccFhy-r_A3ydQphd3qAQcGQZiMgqOmRD6-4wU2HxbbEekM01twLnASimMhkPa8AqFiryL06MOIJJnXCwya0ha0dJq62TTuQtksig8UiR7Eh1edSZ4bSJyt8bjB2VYKOheGwH249xIrdvWf_sg" />
                                <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-background-dark text-xs font-bold rounded-full uppercase tracking-wider">
                                    Completed
                                </div>
                            </div>
                            {/* Details Section */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 ">Order #ORD-7721</h3>
                                        <span className="text-2xl font-black text-primary">$124.50</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500  mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            Placed on Oct 24, 2023
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                            3 Items
                                        </div>
                                    </div>
                                    {/* Thumbnails Summary */}
                                    <div className="flex gap-2 mb-4">
                                        <div className="w-12 h-12 rounded border border-slate-200  overflow-hidden bg-slate-50 ">
                                            <img alt="item" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvpgyp9X4faYFjuTYap-rgYfGywQ7xgk1qBNDrGRCzJpY_xXZFS_kF1IfSwDiE3HS6y4pFUSIr7UqVboTzwAExv96L6OaHxAQDJNLEoYs0l_dwu7ALryUzNdPt0IklVyW0nfVFm9nXxMNz9h5rV5ZoYMltPrGmmeTyjylWMXBCFAC10p_BdZE1kDpwqRIctd5cHaAgoPed_bR8jzz7QcKL6By8h-3Ltqwju8QDaRqabsmEilwgprkjXdtfRXe2Y8RMrZsmoG78RdU" />
                                        </div>
                                        <div className="w-12 h-12 rounded border border-slate-200  overflow-hidden bg-slate-50 ">
                                            <img alt="item" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx--FPn7Lfx9MXlvQIAPwPnDOdvOkF5nVGTLyaL5kyuHCxkIkZzuiuNtxZBQ-PEpbQhmI-FtKznZScMeZ6GZTxLj-4Zp3SzS2J239BnnVUnDx8Xi2aO0toWJOQpMB8Odbh8sABLqWLRzzyecPv9RTsSe4ahVXt90FLAhU75o9K67gFVvSjP2ouQq9xZ-s6tbQ0a72xWqwr3BZcnwjFp8SOIkSECrMKmRz5i2LpAvWKJnMFprOHddGpeNYgIdh5ZnLEir9yf3CVn74" />
                                        </div>
                                        <div className="w-12 h-12 rounded border border-slate-200  overflow-hidden bg-slate-50  flex items-center justify-center text-xs font-bold text-slate-400">
                                            +1
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-auto">
                                    <button className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                        Track Order
                                    </button>
                                    <button className="bg-slate-100  hover:bg-slate-200  text-slate-900  font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                        Order Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Card 2: Shipped */}
                    <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Status & Image Section */}
                            <div className="w-full xl:w-64 h-48 rounded-lg relative overflow-hidden shrink-0">
                                <img alt="Product thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8rKfrkWKUFUZ4nMrag8pU3gtHQPCIum8P8G2wIakyePJ4NG3uiVMGQMVP1JJvc5v3AgIoFKOeI1YqwdxB6JYGMeSLo0yhtmb4ewNotIVAjH-fkBpvnDTmkUi17C18Ac1GuqOO2EfBTVHJukgfZeW79AlJkT_GgbFmK1pbZyhSrsXsCIoQyFoUsIhZe4Q3I642ZNBBAOj3s9N3kS2SHph6nVHLlZWdP3Tte5qq8i7kxHUQJdWmnuwF8xtmlgJST55jHgqt3-ARmFo" />
                                <div className="absolute top-3 left-3 px-3 py-1 bg-cyan-400 text-slate-900 text-xs font-bold rounded-full uppercase tracking-wider">
                                    Shipped
                                </div>
                            </div>
                            {/* Details Section */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 ">Order #ORD-8942</h3>
                                        <span className="text-2xl font-black text-primary">$59.00</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500  mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            Placed on Nov 02, 2023
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                            1 Item
                                        </div>
                                    </div>
                                    <p className="text-sm  italic mb-4">Arriving by Thursday, Nov 10</p>
                                </div>
                                <div className="flex items-center gap-3 mt-auto">
                                    <button className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                                        Track Order
                                    </button>
                                    <button className="bg-slate-100  hover:bg-slate-200  text-slate-900  font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                        Order Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Card 3: Pending */}
                    <div className="bg-white  border border-slate-200  rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex flex-col xl:flex-row gap-6">
                            {/* Status & Image Section */}
                            <div className="w-full xl:w-64 h-48 rounded-lg relative overflow-hidden shrink-0">
                                <img alt="Product thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFgDN3kGrNr5ev8A3bcCc2mcxu1gjOYu6JosCsQXH1a2Bq5znuYfPEkDYMz6q2luFLd6wWwl7_3Y0ugFMsieKt2vj8R8KitD_IaVohUrWDpudXTsBqFX02WElQGwnoK30PXtu0BIUaEuOpOsCp2bjRhNjTlat4xoUSjCxXQ4nckdNtDUUA6ID6F6tj9giMQ4Vqq_oln1dUNXGvMvFHTFANdDg_mbQUhvSmxIKnkMJLdaDJdotCUprRi7WyaBLtfl3_CVaKxJLX_uk" />
                                <div className="absolute top-3 left-3 px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full uppercase tracking-wider">
                                    Pending
                                </div>
                            </div>
                            {/* Details Section */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold text-slate-900 ">Order #ORD-9105</h3>
                                        <span className="text-2xl font-black text-primary">$42.25</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-slate-500  mb-6">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                                            Placed on Today, 10:45 AM
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
                                            2 Items
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mt-auto">
                                    <button className="bg-primary/30 text-primary cursor-not-allowed font-bold px-6 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                                        Processing...
                                    </button>
                                    <button className="bg-slate-100  hover:bg-slate-200  text-slate-900  font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
                                        Order Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-12 flex items-center justify-center gap-4">
                    <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100  text-slate-400 cursor-not-allowed">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary text-background-dark font-bold text-sm">1</span>
                        <span className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-100  font-bold text-sm cursor-pointer text-slate-600 ">2</span>
                        <span className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-100  font-bold text-sm cursor-pointer text-slate-600 ">3</span>
                    </div>
                    <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-100  hover:bg-slate-200  text-slate-600 ">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default OrderHistory;
