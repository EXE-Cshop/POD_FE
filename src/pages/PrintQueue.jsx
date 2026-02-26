import React from 'react';

const PrintQueue = () => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Top Navbar */}
            <header className="h-16 border-b border-slate-200  bg-white  flex items-center justify-between px-8 z-10 shrink-0">
                <div className="flex items-center gap-6">
                    <h2 className="text-lg font-bold tracking-tight text-slate-900 ">Order Management</h2>
                    <div className="relative w-80">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400  text-[20px]">search</span>
                        <input className="w-full bg-slate-100  border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900  placeholder:text-slate-500 " placeholder="Search Order ID, Customer..." type="text" />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100  text-slate-600  hover:bg-slate-200  transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100  text-slate-600  hover:bg-slate-200  transition-colors">
                        <span className="material-symbols-outlined">help</span>
                    </button>
                </div>
            </header>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white  border border-slate-200  rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500  text-sm font-medium">Total Orders</p>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">+12.4%</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 ">1,284</p>
                        <div className="mt-4 w-full bg-slate-100  h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '75%' }}></div>
                        </div>
                    </div>
                    <div className="bg-white  border border-slate-200  rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500  text-sm font-medium">Pending Fulfillment</p>
                            <span className="text-orange-500 text-xs font-bold bg-orange-500/10 px-2 py-1 rounded">-2 today</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 ">42</p>
                        <div className="mt-4 w-full bg-slate-100  h-1.5 rounded-full overflow-hidden">
                            <div className="bg-orange-500 h-full" style={{ width: '30%' }}></div>
                        </div>
                    </div>
                    <div className="bg-white  border border-slate-200  rounded-xl p-6">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-slate-500  text-sm font-medium">Total Revenue</p>
                            <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded">+5.2%</span>
                        </div>
                        <p className="text-3xl font-bold text-slate-900 ">$12,450.00</p>
                        <div className="mt-4 w-full bg-slate-100  h-1.5 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>

                {/* Filters and Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2 flex-wrap">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark text-sm font-bold rounded-lg hover:brightness-90 transition-all">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            New Order
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100  text-white text-sm font-medium rounded-lg hover:bg-slate-200  transition-colors">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-100  text-white text-sm font-medium rounded-lg hover:bg-slate-200  transition-colors">
                            <span className="material-symbols-outlined text-[18px]">print</span>
                            Print Selection
                        </button>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-slate-100  rounded-xl">
                        <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white  shadow-sm text-slate-900 ">All</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-500  rounded-lg hover:bg-white/50  transition-colors">Pending</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-500  rounded-lg hover:bg-white/50  transition-colors">Printing</button>
                        <button className="px-4 py-1.5 text-xs font-bold text-slate-500  rounded-lg hover:bg-white/50  transition-colors">Shipped</button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white  border border-slate-200  rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50  text-slate-500  text-[12px] uppercase tracking-wider font-bold border-b border-slate-200 ">
                                    <th className="px-6 py-4 w-12">
                                        <input className="rounded bg-transparent border-slate-300  text-primary focus:ring-primary" type="checkbox" />
                                    </th>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 ">
                                {/* Row 1 */}
                                <tr className="hover:bg-slate-50  transition-colors group">
                                    <td className="px-6 py-4">
                                        <input className="rounded bg-transparent border-slate-300  text-primary focus:ring-primary" type="checkbox" />
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary cursor-pointer hover:underline">#POD-9842</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 ">Sarah Jenkins</span>
                                            <span className="text-xs text-slate-500 ">sarah.j@example.com</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                                            Pending
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 ">2 hours ago</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 ">$124.50</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 " title="Print Invoice">
                                                <span className="material-symbols-outlined text-[20px]">print</span>
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 " title="Edit">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 " title="More">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Row 2 */}
                                <tr className="hover:bg-slate-50  transition-colors group">
                                    <td className="px-6 py-4">
                                        <input className="rounded bg-transparent border-slate-300  text-primary focus:ring-primary" type="checkbox" />
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary cursor-pointer hover:underline">#POD-9841</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 ">Michael Chen</span>
                                            <span className="text-xs text-slate-500 ">m.chen@design.co</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                            Printing
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 ">5 hours ago</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 ">$89.00</td>
                                    <td className="px-6 py-4 text-right text-slate-400">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 ">
                                                <span className="material-symbols-outlined text-[20px]">print</span>
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 ">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 ">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Row 3 */}
                                <tr className="hover:bg-slate-50  transition-colors group">
                                    <td className="px-6 py-4">
                                        <input className="rounded bg-transparent border-slate-300  text-primary focus:ring-primary" type="checkbox" />
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary cursor-pointer hover:underline">#POD-9840</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-slate-900 ">Emma Watson</span>
                                            <span className="text-xs text-slate-500 ">emma.w@gmail.com</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            Shipped
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 ">Yesterday</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900 ">$210.20</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 ">
                                                <span className="material-symbols-outlined text-[20px]">print</span>
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 ">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button className="p-1.5 hover:bg-slate-200  rounded transition-colors text-slate-400 ">
                                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bulk Action Toolbar (Floating Contextual) */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl px-6 py-4 z-20">
                    <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
                        <span className="bg-primary text-background-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                        <span className="text-sm font-medium text-white">Orders Selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-background-dark text-xs font-bold rounded-lg hover:brightness-110">
                            <span className="material-symbols-outlined text-[18px]">update</span>
                            Bulk Update Status
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700">
                            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                            Generate Labels
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintQueue;
