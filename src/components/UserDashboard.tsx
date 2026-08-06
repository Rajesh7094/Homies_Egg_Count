import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Egg, Plus, Calendar, AlertTriangle, CheckCircle, Clock, DollarSign, UserCheck, Lock } from 'lucide-react';

export const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    activeBatch,
    consumptions,
    consumeEgg,
    getUserConsumptionCount,
    getUserTodayConsumptionCount,
    getUserPendingAmount,
  } = useApp();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  const remainingEggs = activeBatch ? activeBatch.remaining_eggs : 0;
  const userTotalConsumed = getUserConsumptionCount(currentUser.id);
  const userTodayConsumed = getUserTodayConsumptionCount(currentUser.id);
  const userPendingAmount = getUserPendingAmount(currentUser.id);
  const pricePerEgg = activeBatch ? activeBatch.price_per_egg : 0;
  const batchPrice = activeBatch ? activeBatch.price : 0;

  // Filter recent consumptions by current user
  const userRecentHistory = consumptions
    .filter(c => c.user_id === currentUser.id)
    .sort((a, b) => new Date(b.consumed_at).getTime() - new Date(a.consumed_at).getTime())
    .slice(0, 8);

  const handleConfirmConsume = async () => {
    setIsSubmitting(true);
    await consumeEgg(currentUser);
    setIsSubmitting(false);
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Header Banner */}
      <div className="glass-card p-6 border-l-4 border-l-amber-500 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
              <span>User ID: {currentUser.user_id}</span>
              <span>•</span>
              <span>{currentUser.email}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>👤 Welcome</span>
              <span className="bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
                {currentUser.name}
              </span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Track your daily egg consumption and household stock transparently.
            </p>
          </div>

          {/* +1 Egg Main Action Button */}
          <div>
            {remainingEggs > 0 ? (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                <div className="p-1 rounded-lg bg-slate-950 text-amber-400">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <span>+1 Egg</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed border border-slate-400/30"
              >
                <Lock className="w-4 h-4 text-rose-500" />
                <span>+1 Egg (Locked)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zero Stock Warning Banner */}
      {remainingEggs === 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500/80 text-rose-900 dark:text-rose-200 flex items-start gap-4 shadow-xl red-glow animate-pulse">
          <AlertTriangle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h3 className="text-lg font-black text-rose-700 dark:text-rose-300">
              Egg Stock Finished
            </h3>
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
              Please wait for Admin (<span className="underline">rajesherode2004@gmail.com</span>) to refill the inventory.
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              An automated email alert with batch consumption details has been dispatched to the Admin.
            </p>
          </div>
        </div>
      )}

      {/* Low Stock Warning Banner */}
      {remainingEggs > 0 && remainingEggs <= 5 && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/60 text-amber-900 dark:text-amber-200 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm font-bold">
            Only {remainingEggs} Eggs Left in stock! Please inform Admin to refill soon.
          </p>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Remaining Eggs Card */}
        <div className={`glass-card p-5 glass-card-hover ${remainingEggs === 0 ? 'border-rose-400/80' : ''}`}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>House Remaining</span>
            <Egg className={`w-4 h-4 ${remainingEggs === 0 ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-black ${remainingEggs === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
              {remainingEggs}
            </span>
            <span className="text-xs font-medium text-slate-500">/ {activeBatch ? activeBatch.total_eggs : 0} Eggs</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            Active: {activeBatch ? activeBatch.batch_number : 'None'}
          </div>
        </div>

        {/* Eggs Consumed By You */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Consumed By You</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {userTotalConsumed}
          </div>
          <div className="mt-2 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Total lifetime eggs
          </div>
        </div>

        {/* Current Egg Price */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Egg Price</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            ₹{pricePerEgg}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            ₹{batchPrice} for {activeBatch ? activeBatch.total_eggs : 30} eggs
          </div>
        </div>

        {/* Your Pending Amount */}
        <div className="glass-card p-5 glass-card-hover border-amber-300 dark:border-amber-900/50">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Your Pending</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            ₹{userPendingAmount}
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500">
            {userTotalConsumed} eggs × ₹{pricePerEgg}
          </div>
        </div>

        {/* Today's Consumption */}
        <div className="glass-card p-5 glass-card-hover">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Today's Count</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {userTodayConsumed}
          </div>
          <div className="mt-2 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
            Consumed today
          </div>
        </div>

      </div>

      {/* Recent History Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Your Recent History
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing last {userRecentHistory.length} logs
          </span>
        </div>

        {userRecentHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No egg consumption records found yet. Click <strong>+1 Egg</strong> to log your first egg!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200/60 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">Egg Count</th>
                  <th className="py-3 px-4">Price / Egg</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60 font-medium">
                {userRecentHistory.map(item => {
                  const date = new Date(item.consumed_at);
                  return (
                    <tr key={item.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at{' '}
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300">
                          {item.batch_number}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        +{item.egg_count} Egg
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        ₹{item.price_per_egg}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-600 dark:text-amber-400">
                        ₹{item.amount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border-2 border-amber-400/80 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Egg className="w-8 h-8 fill-amber-400 text-amber-800 dark:text-amber-200" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Confirm Consumption
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Active Batch: {activeBatch?.batch_number} (₹{pricePerEgg} / egg)
                </p>
              </div>
            </div>

            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 text-center py-2">
              Did you consume one egg?
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirmConsume}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all"
              >
                {isSubmitting ? (
                  <span>Recording...</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                    <span>Yes, Confirm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
