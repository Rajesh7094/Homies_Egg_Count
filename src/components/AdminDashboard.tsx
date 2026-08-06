import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Egg,
  TrendingUp,
  Calendar,
  Layers,
  ShoppingBag,
  DollarSign,
  Plus,
  Edit3,
  Award,
  Trash2,
  Lock,
  AlertTriangle,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

interface AdminDashboardProps {
  onOpenNewBatchModal: () => void;
  onOpenUpdatePriceModal: () => void;
  onOpenAddUserModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenNewBatchModal,
  onOpenUpdatePriceModal,
  onOpenAddUserModal,
}) => {
  const { availableUsers, currentUser } = useAuth();
  const {
    activeBatch,
    batches,
    consumptions,
    getHouseholdSummary,
    getUserConsumptionCount,
    getUserPendingAmount,
    resetAllData,
    addToast,
  } = useApp();

  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgePassword, setPurgePassword] = useState('');
  const [purgeError, setPurgeError] = useState('');

  const handleConfirmPurge = (e: React.FormEvent) => {
    e.preventDefault();
    setPurgeError('');

    // Check if entered password matches admin password
    const adminPassword = currentUser?.password || 'rajesh123';
    if (purgePassword !== adminPassword) {
      setPurgeError('Incorrect admin password. Purge cancelled.');
      return;
    }

    resetAllData();
    setShowPurgeModal(false);
    setPurgePassword('');
    addToast('success', 'All egg batches, consumption data, and users purged successfully.');
  };

  const summary = getHouseholdSummary();

  // Calculate Today's Household Consumption
  const todayStr = new Date().toISOString().split('T')[0];
  const todayConsumption = consumptions
    .filter(c => c.consumed_at.startsWith(todayStr))
    .reduce((sum, c) => sum + c.egg_count, 0);

  // Prepare Daily Consumption Chart Data (Last 7 Days)
  const dailyDataMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const isoPrefix = d.toISOString().split('T')[0];
    const count = consumptions
      .filter(c => c.consumed_at.startsWith(isoPrefix))
      .reduce((sum, c) => sum + c.egg_count, 0);
    dailyDataMap[dateKey] = count;
  }
  const dailyChartData = Object.entries(dailyDataMap).map(([day, count]) => ({ day, count }));

  // Prepare Top Consumer Data for Pie/Bar Chart
  const consumerData = availableUsers.map(user => ({
    name: user.name,
    user_id: user.user_id,
    eggs: getUserConsumptionCount(user.id),
    pending: getUserPendingAmount(user.id),
  })).sort((a, b) => b.eggs - a.eggs);

  const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6'];

  return (
    <div className="space-y-6">
      
      {/* Admin Header & Quick Action Buttons */}
      <div className="glass-card p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <ShieldIcon className="w-3.5 h-3.5" />
            <span>Admin Control Panel</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Household Analytics & Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage stock batches, update prices, oversee bachelor users, and inspect consumption analytics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewBatchModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Batch (Refill)</span>
          </button>

          <button
            onClick={onOpenUpdatePriceModal}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Active Price</span>
          </button>

          <button
            onClick={onOpenAddUserModal}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-900/20 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* 7 Core Admin Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Users */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Users</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {availableUsers.length}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            {availableUsers.filter(u => u.status === 'active').length} Active Bachelors
          </div>
        </div>

        {/* Current Egg Stock */}
        <div className={`glass-card p-5 glass-card-hover ${summary.currentRemainingEggs === 0 ? 'border-rose-400/80 bg-rose-500/5' : ''}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Current Egg Stock</span>
            <Egg className={`w-4 h-4 ${summary.currentRemainingEggs === 0 ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${summary.currentRemainingEggs === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {summary.currentRemainingEggs}
            </span>
            <span className="text-xs font-medium text-slate-500">/ {summary.activeBatchTotalEggs} Eggs</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Batch: {summary.activeBatchNumber}
          </div>
        </div>

        {/* Today's Household Consumption */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Today's Consumption</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {todayConsumption}
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Eggs consumed today
          </div>
        </div>

        {/* Current Batch Info */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Current Batch</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {summary.activeBatchNumber}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            ₹{activeBatch ? activeBatch.price : 0} (₹{summary.activePricePerEgg}/egg)
          </div>
        </div>

        {/* Total Eggs Purchased */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Eggs Purchased</span>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.totalEggsPurchased}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Across {batches.length} batches
          </div>
        </div>

        {/* Total Eggs Consumed */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Eggs Consumed</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.totalEggsConsumed}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            House cumulative count
          </div>
        </div>

        {/* House Total Pending Amount */}
        <div className="glass-card p-5 glass-card-hover border-amber-300 dark:border-amber-900/50 col-span-1 sm:col-span-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Total Pending Amount</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            ₹{summary.totalPendingAmount}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Total amount to collect from all bachelor members
          </div>
        </div>

      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Consumption Trend (Bar Chart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Daily Consumption Trend (Last 7 Days)
            </h3>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" name="Eggs Consumed" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Consumer Share (Donut Chart) */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" />
              Top Consumers Breakdown
            </h3>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consumerData}
                  dataKey="eggs"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  label={(entry: any) => `${(entry.name || '').split(' ')[0]}: ${entry.eggs}`}
                >
                  {consumerData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* House Member Outstanding Bill Summary Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            House Member Consumption & Pending Bills
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200/60 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Total Consumed</th>
                <th className="py-3 px-4 text-right">Pending Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60 font-medium">
              {consumerData.map(c => (
                <tr key={c.user_id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                    {c.user_id}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                    {c.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                    {availableUsers.find(u => u.user_id === c.user_id)?.email}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {c.eggs} Eggs
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400">
                    ₹{c.pending}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Purge All System Data */}
      <div className="glass-card p-6 border-rose-300 dark:border-rose-900/50 bg-rose-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone — Purge All System Data
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Permanently delete all egg batches, consumption history, and house users (except Admin). Requires Admin password.
          </p>
        </div>
        <button
          onClick={() => {
            setPurgePassword('');
            setPurgeError('');
            setShowPurgeModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-rose-900/20 shrink-0 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>Purge All Data</span>
        </button>
      </div>

      {/* Password Confirmation Modal for Purge All Data */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border-2 border-rose-500/50 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-rose-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <span>Confirm System Purge</span>
              </div>
              <button
                onClick={() => setShowPurgeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs font-semibold space-y-1">
              <p>⚠️ <strong>Warning:</strong> This will delete:</p>
              <ul className="list-disc list-inside text-[11px] opacity-90 space-y-0.5 pl-1">
                <li>All egg batches & active stock</li>
                <li>All consumption records & pending balances</li>
                <li>All house users (except Admin)</li>
                <li>All activity & email logs</li>
              </ul>
            </div>

            {purgeError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{purgeError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmPurge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter Admin Password to Confirm
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={purgePassword}
                    onChange={e => setPurgePassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurgeModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm Delete All</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

const ShieldIcon = (props: any) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
