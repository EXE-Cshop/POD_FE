import React, { useEffect, useMemo, useState } from 'react';
import { permissionsService, rolesService } from '../services/api';

const unwrap = (response, fallback = []) => response?.data?.data ?? response?.data ?? fallback;
const SYSTEM_ROLES = ['SUPER_ADMIN', 'USER'];

const groupPermission = (name) => {
    const [resource] = name.split('_');
    return resource || 'OTHER';
};

const Roles = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const selectedRole = useMemo(
        () => roles.find((role) => role.id === selectedRoleId) || roles[0],
        [roles, selectedRoleId]
    );

    const isSystemRole = selectedRole ? SYSTEM_ROLES.includes(selectedRole.name) : false;

    const groupedPermissions = useMemo(() => {
        return permissions.reduce((groups, permission) => {
            const group = groupPermission(permission.name);
            return {
                ...groups,
                [group]: [...(groups[group] || []), permission],
            };
        }, {});
    }, [permissions]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [roleResponse, permissionResponse] = await Promise.all([
                rolesService.getRoles(),
                permissionsService.getPermissions(),
            ]);
            const nextRoles = unwrap(roleResponse);
            setRoles(nextRoles);
            setPermissions(unwrap(permissionResponse));
            if (!selectedRoleId && nextRoles.length > 0) {
                setSelectedRoleId(nextRoles[0].id);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load roles and permissions.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!selectedRole) return;
        setDescription(selectedRole.description || '');
        setSelectedPermissionIds((selectedRole.permissions || []).map((permission) => permission.id));
        setSuccess('');
        setError('');
    }, [selectedRole?.id]);

    const togglePermission = (permissionId) => {
        setSelectedPermissionIds((current) =>
            current.includes(permissionId)
                ? current.filter((id) => id !== permissionId)
                : [...current, permissionId]
        );
    };

    const saveRole = async () => {
        if (!selectedRole || isSystemRole) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await rolesService.updateRole(selectedRole.id, {
                description,
                permissionIds: selectedPermissionIds,
            });
            setSuccess('Role permissions saved.');
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Could not save role permissions.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            <section className="w-[360px] border-r border-gray-200 flex flex-col bg-background-light overflow-y-auto">
                <div className="p-6 flex flex-col gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Roles</h2>
                        <p className="text-sm text-slate-500 mt-1">System roles are fixed to keep account access predictable.</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {loading ? (
                            <div className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-slate-500">Loading roles...</div>
                        ) : roles.map((role) => {
                            const active = selectedRole?.id === role.id;
                            return (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRoleId(role.id)}
                                    className={`text-left flex flex-col gap-3 rounded-xl border p-4 transition-all shadow-sm ${
                                        active
                                            ? 'bg-primary/10 border-primary'
                                            : 'bg-white border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-gray-900 text-lg font-black leading-tight">{role.name}</p>
                                            <p className="text-gray-500 text-xs leading-relaxed mt-1">{role.description}</p>
                                        </div>
                                        <span className={`material-symbols-outlined ${active ? 'text-primary' : 'text-slate-400'}`}>
                                            {role.name === 'SUPER_ADMIN' ? 'verified_user' : 'person'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500">{role.permissions?.length || 0} permissions</span>
                                        {SYSTEM_ROLES.includes(role.name) && (
                                            <span className="text-[10px] uppercase tracking-wider font-black text-primary">System</span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="flex-1 flex flex-col bg-background-light overflow-y-auto">
                <div className="p-8 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4 bg-white">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-primary">security</span>
                            <span className="text-primary text-sm font-black uppercase tracking-wider">Permissions</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900">{selectedRole?.name || 'Role'} Access</h2>
                        <p className="text-gray-500 mt-1">
                            {isSystemRole
                                ? 'SUPER_ADMIN has all admin permissions. USER has customer access only and no admin permissions.'
                                : 'Configure permissions for this custom role.'}
                        </p>
                    </div>
                    <button
                        onClick={saveRole}
                        disabled={saving || isSystemRole}
                        className="px-8 py-2.5 rounded-lg bg-primary text-[#11221c] font-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                <div className="p-8 space-y-6 max-w-5xl text-gray-900">
                    {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
                    {success && <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{success}</div>}

                    {selectedRole && (
                        <label className="block max-w-2xl">
                            <span className="text-sm font-bold text-slate-700">Description</span>
                            <input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSystemRole}
                                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-primary disabled:bg-slate-100"
                            />
                        </label>
                    )}

                    {Object.entries(groupedPermissions).map(([group, items]) => (
                        <div key={group} className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-100">
                                    <span className="material-symbols-outlined text-gray-700">admin_panel_settings</span>
                                </div>
                                <h3 className="text-xl font-black text-gray-900">{group}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {items.map((permission) => (
                                    <label
                                        key={permission.id}
                                        className={`flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white ${
                                            isSystemRole ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-gray-50'
                                        } transition-colors`}
                                    >
                                        <input
                                            className="w-5 h-5 rounded accent-primary"
                                            type="checkbox"
                                            checked={selectedPermissionIds.includes(permission.id)}
                                            disabled={isSystemRole}
                                            onChange={() => togglePermission(permission.id)}
                                        />
                                        <span className="flex flex-col">
                                            <span className="text-gray-900 font-black">{permission.name}</span>
                                            <span className="text-xs text-gray-500">{permission.description}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Roles;
