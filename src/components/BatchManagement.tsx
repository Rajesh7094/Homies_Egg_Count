import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Layers, Plus, Edit3, CheckCircle, Package, DollarSign, Tag } from 'lucide-react';

export const BatchManagement: React.FC = () => {
  const { isAdmin, currentUser } = useAuth();
  const { batches, activeBatch, refillStock, updateActiveBatchPrice } = useApp();

  const [showRefillModal, setShowRefillModal] = useState(false);
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);

  // New Batch Form State
  const [newTotalEggs, setNewTotalEggs] = useState(30);
  const [newPrice, setNewPrice] = useState(210);

  // Edit Active Price Form State
  const [editTotalEggs, setEditTotalEggs] = useState(activeBatch?.total_eggs || 30);
  const [editPrice, setEditPrice] = useState(activeBatch?.price || 210);

  const handleRefillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    refillStock(Number(newTotalEggs), Number(newPrice), currentUser.user_id);
    setShowRefillModal(false);
  };

  const handleUpdatePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveBatchPrice(Number(editTotalEggs), Number(editPrice));
    setShowUpdatePriceModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Inventory Stock History</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Egg Batches & Price Management
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Every batch maintains its own total stock, purchase cost, and per-egg rate without mutating historic records.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditTotalEggs(activeBatch?.total_eggs || 30);
                setEditPrice(activeBatch?.price || 210);
                setShowUpdatePriceModal(true);
              }}
              disabled={!activeBatch}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Active Price</span>
            </button>

            <button
              onClick={() => setShowRefillModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Purchase New Batch</span>
            </button>
          </div>
        )}
      </div>

      {/* Batches Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200/60 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Purchased</th>
                <th className="py-3 px-4">Remaining Eggs</th>
                <th className="py-3 px-4">Batch Price</th>
                <th className="py-3 px-4">Price Per Egg</th>
                <th className="py-3 px-4">Date Created</th>
                <th className="py-3 px-4 text-right">Created By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60 font-medium">
              {batches.map(b => (
                <tr
                  key={b.id}
                  className={`hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                    b.is_active ? 'bg-amber-50/70 dark:bg-slate-800/60 font-bold' : 'opacity-80'
                  }`}
                >
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-200/60 dark:bg-slate-800 text-amber-950 dark:text-amber-300">
                      {b.batch_number}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {b.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-400">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Archived
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                    {b.total_eggs} Eggs
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${b.remaining_eggs === 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                      {b.remaining_eggs} Left
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    ₹{b.price}
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                    ₹{b.price_per_egg} / egg
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400 text-xs">
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-slate-500">
                    {b.created_by}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Purchase New Batch */}
      {showRefillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border-2 border-amber-400/80 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Package className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Purchase New Egg Batch
                </h4>
                <p className="text-xs text-slate-500">
                  Creates new active batch (e.g. Batch-002) and deactivates prior batch.
                </p>
              </div>
            </div>

            <form onSubmit={handleRefillSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Eggs Purchased (e.g., 30, 60, 90)
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={newTotalEggs}
                    onChange={e => setNewTotalEggs(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Batch Price in ₹ (e.g., 210, 225, 240)
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={newPrice}
                    onChange={e => setNewPrice(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>

              {/* Rate Preview */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-900 dark:text-amber-300 flex justify-between items-center">
                <span>Calculated Unit Price:</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  ₹{(newPrice / (newTotalEggs || 1)).toFixed(2)} / egg
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRefillModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-md shadow-amber-500/20"
                >
                  Confirm & Refill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Active Batch Price */}
      {showUpdatePriceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 space-y-5 border-2 border-amber-400/80 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Edit3 className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Update Active Price ({activeBatch?.batch_number})
                </h4>
                <p className="text-xs text-slate-500">
                  Updates price and recalculates remaining egg rate.
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdatePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Total Eggs
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editTotalEggs}
                  onChange={e => setEditTotalEggs(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Total Batch Price in ₹
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={editPrice}
                  onChange={e => setEditPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold text-sm"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-900 dark:text-amber-300 flex justify-between items-center">
                <span>Updated Unit Rate:</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  ₹{(editPrice / (editTotalEggs || 1)).toFixed(2)} / egg
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdatePriceModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm"
                >
                  Save Price
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
