import React from 'react';

const UserDirectory = () => {
    const users = [
        { id: '#1024', name: 'Jane Cooper', initials: 'JC', color: 'text-primary bg-primary/20', email: 'jane.cooper@example.com', roles: [{ label: 'Admin', class: 'bg-primary text-background-dark' }] },
        { id: '#1025', name: 'Cody Fisher', initials: 'CF', color: 'text-blue-400 bg-blue-400/20', email: 'cody.f@printpod.io', roles: [{ label: 'Editor', class: 'bg-gray-100  text-gray-700' }, { label: 'Manager', class: 'bg-gray-100  text-gray-700' }] },
        { id: '#1026', name: 'Esther Howard', initials: 'EH', color: 'text-orange-400 bg-orange-400/20', email: 'esther.h@gmail.com', roles: [{ label: 'Customer', class: 'bg-gray-100  text-gray-700' }] },
        { id: '#1027', name: 'Jenny Wilson', initials: 'JW', color: 'text-purple-400 bg-purple-400/20', email: 'j.wilson@outlook.com', roles: [{ label: 'Moderator', class: 'bg-gray-100  text-gray-700' }] },
        { id: '#1028', name: 'Guy Hawkins', initials: 'GH', color: 'text-pink-400 bg-pink-400/20', email: 'guy.h@company.com', roles: [{ label: 'Admin', class: 'bg-primary text-background-dark' }] },
    ];

    return (
        <>
            {/* Page Header */}
            <header className="bg-white  border-b border-gray-200  p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1200px] mx-auto">
                    <div>
                        <h2 className="text-gray-900  text-3xl font-black leading-tight tracking-tight">User Management</h2>
                        <p className="text-gray-500  text-sm">Manage, edit and monitor platform participants.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 min-w-[140px] justify-center rounded-lg h-11 px-5 bg-primary text-background-dark text-sm font-bold shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <span className="material-symbols-outlined">person_add</span>
                            <span>Add New User</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Content Container */}
            <div className="flex-1 overflow-auto">
                <div className="px-6 py-4 max-w-[1200px] mx-auto w-full">
                    {/* Search and Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <label className="flex items-center w-full h-12 bg-white  border border-gray-300  rounded-lg px-4 focus-within:border-primary transition-all">
                                <span className="material-symbols-outlined text-gray-400  mr-3">search</span>
                                <input className="w-full bg-transparent border-none text-gray-900  placeholder:text-gray-400  focus:ring-0 text-sm outline-none" placeholder="Search users by name, email or unique ID..." />
                            </label>
                        </div>
                        <div className="flex gap-2">
                            <button className="h-12 px-4 rounded-lg bg-white  border border-gray-300  text-gray-700  flex items-center gap-2 hover:bg-gray-50  transition-colors">
                                <span className="material-symbols-outlined">filter_list</span>
                                <span className="text-sm font-medium">Filters</span>
                            </button>
                            <button className="h-12 px-4 rounded-lg bg-white  border border-gray-300  text-gray-700  flex items-center gap-2 hover:bg-gray-50  transition-colors">
                                <span className="material-symbols-outlined">download</span>
                                <span className="text-sm font-medium block sm:hidden md:block">Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white  border border-gray-200  rounded-xl overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50  border-b border-gray-200 ">
                                        <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider w-24">ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">User Profile</th>
                                        <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Contact Info</th>
                                        <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider">Roles</th>
                                        <th className="px-6 py-4 text-xs font-bold text-primary uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 ">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50  transition-colors">
                                            <td className="px-6 py-4 text-gray-500  text-sm font-mono">{user.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-9 rounded-lg flex items-center justify-center font-bold text-xs ${user.color}`}>
                                                        {user.initials}
                                                    </div>
                                                    <span className="text-gray-900  text-sm font-semibold">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500  text-sm">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5 flex-wrap">
                                                    {user.roles.map((role, idx) => (
                                                        <span key={idx} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${role.class}`}>
                                                            {role.label}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2 text-gray-400  hover:text-primary hover:bg-primary/10 rounded-lg transition-all" title="Edit User">
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button className="p-2 text-gray-400  hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all" title="Delete User">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500 ">Showing <span className="text-gray-900  font-bold">1 to 5</span> of 240 users</p>
                        <div className="flex items-center gap-1">
                            <button className="size-9 flex items-center justify-center text-gray-400  hover:text-gray-900  rounded-lg transition-colors">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="size-9 flex items-center justify-center bg-primary text-background-dark font-bold rounded-lg text-sm">1</button>
                            <button className="size-9 flex items-center justify-center text-gray-700  hover:bg-gray-100  rounded-lg text-sm transition-colors">2</button>
                            <button className="size-9 flex items-center justify-center text-gray-700  hover:bg-gray-100  rounded-lg text-sm transition-colors">3</button>
                            <span className="size-9 flex items-center justify-center text-gray-400 ">...</span>
                            <button className="size-9 flex items-center justify-center text-gray-700  hover:bg-gray-100  rounded-lg text-sm transition-colors">48</button>
                            <button className="size-9 flex items-center justify-center text-gray-400  hover:text-gray-900  rounded-lg transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserDirectory;
