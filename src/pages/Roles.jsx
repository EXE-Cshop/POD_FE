import React from 'react';

const Roles = () => {
    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Left Panel: Roles List */}
            <section className="w-[380px] border-r border-gray-200  flex flex-col bg-background-light  overflow-y-auto">
                <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 ">Roles</h2>
                        <button className="bg-primary text-background-dark px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all">
                            <span className="material-symbols-outlined text-lg">add</span>
                            New Role
                        </button>
                    </div>
                    <div className="py-2">
                        <label className="flex flex-col w-full">
                            <div className="flex w-full flex-1 items-stretch rounded-lg h-10 border border-gray-200 ">
                                <div className="text-gray-400  flex border-none bg-white  items-center justify-center pl-3 rounded-l-lg">
                                    <span className="material-symbols-outlined text-lg">filter_list</span>
                                </div>
                                <input className="w-full border-none bg-white  text-gray-900  focus:outline-0 focus:ring-0 h-full placeholder:text-gray-400  px-4 rounded-r-lg pl-2 text-sm" placeholder="Search roles..." />
                            </div>
                        </label>
                    </div>
                    <div className="flex flex-col gap-3">
                        {/* Role Card: Admin (Active) */}
                        <div className="cursor-pointer group">
                            <div className="flex flex-col gap-3 rounded-xl bg-primary/10 border border-primary p-4 shadow-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-primary text-[10px] uppercase font-bold tracking-widest mb-1">Current Selection</span>
                                        <p className="text-gray-900  text-lg font-bold leading-tight">Administrator</p>
                                    </div>
                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                </div>
                                <p className="text-gray-600  text-xs leading-relaxed">Full access to all system modules, billing, and user management.</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 ">3 Users Assigned</span>
                                    <span className="text-primary text-xs font-bold">Active</span>
                                </div>
                            </div>
                        </div>
                        {/* Role Card: Designer */}
                        <div className="cursor-pointer group">
                            <div className="flex flex-col gap-3 rounded-xl bg-white  border border-gray-200  hover:border-gray-300  p-4 transition-all shadow-sm ">
                                <div className="flex items-start justify-between">
                                    <p className="text-gray-900  text-lg font-bold leading-tight">Designer</p>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-gray-900 ">palette</span>
                                </div>
                                <p className="text-gray-500  text-xs leading-relaxed">Access to product design, assets, and template creation tools.</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 ">12 Users Assigned</span>
                                    <button className="text-xs font-bold text-slate-400 group-hover:text-primary">Manage</button>
                                </div>
                            </div>
                        </div>
                        {/* Role Card: Support */}
                        <div className="cursor-pointer group">
                            <div className="flex flex-col gap-3 rounded-xl bg-white  border border-gray-200  hover:border-gray-300  p-4 transition-all shadow-sm ">
                                <div className="flex items-start justify-between">
                                    <p className="text-gray-900  text-lg font-bold leading-tight">Support Agent</p>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-gray-900 ">support_agent</span>
                                </div>
                                <p className="text-gray-500  text-xs leading-relaxed">Limited access to order history, customer profiles, and refunds.</p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 ">8 Users Assigned</span>
                                    <button className="text-xs font-bold text-slate-400 group-hover:text-primary">Manage</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Right Panel: Permissions Detail */}
            <section className="flex-1 flex flex-col bg-background-light  overflow-y-auto">
                <div className="p-8 border-b border-gray-200  flex flex-wrap justify-between items-center gap-4 bg-white ">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <span className="text-primary text-sm font-bold uppercase tracking-wider">Role Settings</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 ">Administrator Permissions</h2>
                        <p className="text-gray-500  mt-1">Configure what users with the Administrator role can see and do.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-6 py-2.5 rounded-lg border border-gray-300  text-gray-700  font-bold hover:bg-gray-100  transition-colors">Discard</button>
                        <button className="px-8 py-2.5 rounded-lg bg-primary text-background-dark font-bold hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(19,236,164,0.3)]">Save Changes</button>
                    </div>
                </div>

                <div className="p-8 space-y-10 max-w-4xl text-gray-900 ">
                    {/* Category: Users Management */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gray-100 ">
                                <span className="material-symbols-outlined text-gray-700 ">group</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 ">User Management</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200  bg-white  cursor-pointer hover:bg-gray-50  transition-colors">
                                <input defaultChecked className="w-5 h-5 rounded border-none bg-gray-100  text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" />
                                <div className="flex flex-col">
                                    <span className="text-gray-900  font-semibold">View Users</span>
                                    <span className="text-xs text-gray-500 ">Can see the list of all registered users</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200  bg-white  cursor-pointer hover:bg-gray-50  transition-colors">
                                <input defaultChecked className="w-5 h-5 rounded border-none bg-gray-100  text-primary focus:ring-primary focus:ring-offset-background-dark" type="checkbox" />
                                <div className="flex flex-col">
                                    <span className="text-gray-900  font-semibold">Edit Users</span>
                                    <span className="text-xs text-gray-500 ">Can modify user profiles and assign roles</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Roles;
