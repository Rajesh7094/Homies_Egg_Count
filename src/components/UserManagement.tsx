import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { User, UserStatus } from '../types';
import { Users, UserPlus, Search, ToggleLeft, ToggleRight, Trash2, Edit2, Shield, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { availableUsers, isAdmin } = useAuth();
  const { addUser, updateUser, deleteUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('egg@2024');
  const [status, setStatus] = useState<UserStatus>('active');

  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setMobile('');
    setPassword('password123');
    setStatus('active');
    setEditingUser(null);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name,
        email,
        mobile,
        status,
      });
    } else {
      addUser({
        name,
        email,
        mobile,
        password,
        role: 'user',
        status,
      });
    }
    resetForm();
    setShowAddModal(false);
  };

  const handleToggleStatus = (user: User) => {
    const nextStatus: UserStatus = user.status === 'active' ? 'inactive' : 'active';
    updateUser(user.id, { status: nextStatus });
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setMobile(user.mobile);
    setStatus(user.status);
    setShowAddModal(true);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center glass-card space-y-3">
        <Shield className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Admin Authorization Required</h3>
        <p className="text-sm text-slate-500">Only the house Admin (rajesherode2004@gmail.com) can manage bachelor users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Controls */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Admin Directory</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Bachelor User Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Add new house members, assign auto-generated User IDs (e.g. RAJ001), enable/disable access, or edit profiles.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by User ID (e.g. RAJ001), Full Name, or Email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Users List Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200/60 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60 font-medium">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-200/60 dark:bg-slate-800 text-amber-950 dark:text-amber-300">
                      {user.user_id}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                    {user.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                    {user.email}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {user.mobile}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.role === 'admin' ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                        <XCircle className="w-3.5 h-3.5" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Toggle Status */}
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title={user.status === 'active' ? 'Disable User' : 'Enable User'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {user.status === 'active' ? (
                          <ToggleRight className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-400" />
                        )}
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => handleEditClick(user)}
                        title="Edit User Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete User */}
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user ${user.name} (${user.user_id})?`)) {
                              deleteUser(user.id);
                            }
                          }}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border-2 border-amber-400/80 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <UserPlus className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {editingUser ? `Edit User: ${editingUser.user_id}` : 'Add New Bachelor User'}
                </h4>
                <p className="text-xs text-slate-500">
                  {editingUser ? 'Update contact details or status.' : 'User ID will be automatically generated from name.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Erode / Karthick"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="user@house.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Login Password
                    <span className="ml-1 text-slate-400 font-normal">(share this with the user)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm font-mono tracking-wide"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    ⚠️ Note this down — the user will need this to log in.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as UserStatus)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {!editingUser && name.trim().length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                  <div className="flex justify-between items-center font-medium text-amber-900 dark:text-amber-300">
                    <span>Auto-Generated User ID:</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase().padEnd(3, 'X')}{String(availableUsers.length + 1).padStart(3, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-medium text-amber-900 dark:text-amber-300">
                    <span>Login Password:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{password}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
