import React, { useEffect, useMemo, useState } from 'react';
import { rolesService, usersService } from '../services/api';

const unwrap = (response, fallback = []) => response?.data?.data ?? response?.data ?? fallback;

const emptyForm = {
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    avatarUrl: '',
    status: 'ACTIVE',
    roleIds: [],
};

const statusClass = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    INACTIVE: 'bg-slate-100 text-slate-600 ring-slate-200',
    BANNED: 'bg-red-50 text-red-700 ring-red-200',
};

const roleClass = {
    SUPER_ADMIN: 'bg-primary text-[#11221c]',
    USER: 'bg-slate-100 text-slate-700',
};

const initialsOf = (nameOrEmail) => {
    const source = (nameOrEmail || '').trim();
    if (!source) return 'U';
    const words = source.split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

const UserFormModal = ({ mode, roles, initialValue, onClose, onSubmit, saving, error }) => {
    const [form, setForm] = useState(initialValue || emptyForm);

    const toggleRole = (roleId) => {
        setForm((current) => {
            const exists = current.roleIds.includes(roleId);
            return {
                ...current,
                roleIds: exists
                    ? current.roleIds.filter((id) => id !== roleId)
                    : [...current.roleIds, roleId],
            };
        });
    };

    const submit = (event) => {
        event.preventDefault();
        onSubmit({
            ...form,
            roleIds: form.roleIds.map(Number),
            password: form.password || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">
                            {mode === 'create' ? 'Create User' : 'Edit User'}
                        </h3>
                        <p className="text-sm text-slate-500">Assign exactly the business role this account needs.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-9 rounded-lg hover:bg-slate-100 text-slate-500"
                        aria-label="Close"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-sm font-bold text-slate-700">Full name</span>
                            <input
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-slate-700">Email</span>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-slate-700">
                                Password {mode === 'edit' && <span className="font-medium text-slate-400">(leave blank to keep)</span>}
                            </span>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                                required={mode === 'create'}
                                minLength={8}
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-bold text-slate-700">Phone</span>
                            <input
                                value={form.phoneNumber || ''}
                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary"
                            />
                        </label>
                    </div>

                    <label className="block">
                        <span className="text-sm font-bold text-slate-700">Status</span>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="BANNED">BANNED</option>
                        </select>
                    </label>

                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-2">Roles</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {roles.map((role) => (
                                <label key={role.id} className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
                                    <input
                                        type="checkbox"
                                        className="mt-1 size-4 accent-primary"
                                        checked={form.roleIds.includes(role.id)}
                                        onChange={() => toggleRole(role.id)}
                                    />
                                    <span>
                                        <span className="block text-sm font-black text-slate-900">{role.name}</span>
                                        <span className="block text-xs text-slate-500">{role.description}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-10 px-4 rounded-lg border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="h-10 px-5 rounded-lg bg-primary text-[#11221c] text-sm font-black disabled:opacity-60"
                        >
                            {saving ? 'Saving...' : 'Save User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserDirectory = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [modalError, setModalError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [editingUser, setEditingUser] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [userResponse, roleResponse] = await Promise.all([
                usersService.getUsers(),
                rolesService.getRoles(),
            ]);
            setUsers(unwrap(userResponse));
            setRoles(unwrap(roleResponse));
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load users. Check admin permissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        return users.filter((user) => {
            const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
            const matchesSearch = !term
                || String(user.id).includes(term)
                || user.email?.toLowerCase().includes(term)
                || user.fullName?.toLowerCase().includes(term);
            return matchesStatus && matchesSearch;
        });
    }, [users, search, statusFilter]);

    const buildInitialValue = (user) => ({
        email: user?.email || '',
        password: '',
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        avatarUrl: user?.avatarUrl || '',
        status: user?.status || 'ACTIVE',
        roleIds: roles.filter((role) => user?.roles?.includes(role.name)).map((role) => role.id),
    });

    const defaultCreateValue = () => {
        const userRole = roles.find((role) => role.name === 'USER');
        return { ...emptyForm, roleIds: userRole ? [userRole.id] : [] };
    };

    const submitUser = async (payload) => {
        setSaving(true);
        setModalError('');
        try {
            if (editingUser) {
                await usersService.updateUser(editingUser.id, payload);
            } else {
                await usersService.createUser(payload);
            }
            setShowCreate(false);
            setEditingUser(null);
            await loadData();
        } catch (err) {
            const message = err.response?.data?.message || 'Could not save user.';
            const details = err.response?.data?.data;
            setModalError(Array.isArray(details) ? details.join(', ') : message);
        } finally {
            setSaving(false);
        }
    };

    const deactivateUser = async (user) => {
        if (!window.confirm(`Deactivate ${user.email}?`)) return;
        setError('');
        try {
            await usersService.deactivateUser(user.id);
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not deactivate user.');
        }
    };

    return (
        <>
            <header className="bg-white border-b border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-[1200px] mx-auto">
                    <div>
                        <h2 className="text-gray-900 text-3xl font-black leading-tight tracking-tight">User Management</h2>
                        <p className="text-gray-500 text-sm">Create accounts, assign roles, and control account status.</p>
                    </div>
                    <button
                        onClick={() => {
                            setModalError('');
                            setShowCreate(true);
                        }}
                        className="flex items-center gap-2 min-w-[140px] justify-center rounded-lg h-11 px-5 bg-primary text-[#11221c] text-sm font-black shadow-lg shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        <span>Add User</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto">
                <div className="px-6 py-4 max-w-[1200px] mx-auto w-full">
                    {error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}

                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <label className="flex items-center flex-1 h-12 bg-white border border-gray-300 rounded-lg px-4 focus-within:border-primary transition-all">
                            <span className="material-symbols-outlined text-gray-400 mr-3">search</span>
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:ring-0 text-sm outline-none"
                                placeholder="Search by name, email or ID..."
                            />
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-12 rounded-lg bg-white border border-gray-300 text-gray-700 px-4 text-sm font-bold outline-none focus:border-primary"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="BANNED">Banned</option>
                        </select>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider w-24">ID</th>
                                        <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">User</th>
                                        <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Roles</th>
                                        <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-black text-primary uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">Loading users...</td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500">No users found.</td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-gray-500 text-sm font-mono">#{user.id}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-lg flex items-center justify-center font-black text-xs bg-primary/15 text-primary">
                                                            {initialsOf(user.fullName || user.email)}
                                                        </div>
                                                        <div>
                                                            <span className="block text-gray-900 text-sm font-black">{user.fullName}</span>
                                                            <span className="block text-gray-500 text-xs">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-1.5 flex-wrap">
                                                        {(user.roles || []).map((role) => (
                                                            <span key={role} className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black ${roleClass[role] || 'bg-slate-100 text-slate-700'}`}>
                                                                {role}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-black ring-1 ${statusClass[user.status] || statusClass.INACTIVE}`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setModalError('');
                                                                setEditingUser(user);
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                            title="Edit user"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => deactivateUser(user)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Deactivate user"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">block</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p className="text-sm text-gray-500">
                        Showing <span className="text-gray-900 font-black">{filteredUsers.length}</span> of {users.length} users
                    </p>
                </div>
            </div>

            {(showCreate || editingUser) && (
                <UserFormModal
                    key={editingUser ? `edit-${editingUser.id}` : 'create'}
                    mode={editingUser ? 'edit' : 'create'}
                    roles={roles}
                    initialValue={editingUser ? buildInitialValue(editingUser) : defaultCreateValue()}
                    onClose={() => {
                        setShowCreate(false);
                        setEditingUser(null);
                    }}
                    onSubmit={submitUser}
                    saving={saving}
                    error={modalError}
                />
            )}
        </>
    );
};

export default UserDirectory;
