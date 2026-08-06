import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Search } from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activities } = useApp();
  const [filterUser, setFilterUser] = useState('');

  const filteredLogs = activities.filter(a =>
    a.user.toLowerCase().includes(filterUser.toLowerCase()) ||
    a.action.toLowerCase().includes(filterUser.toLowerCase()) ||
    a.description.toLowerCase().includes(filterUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            System Activity Logs
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Immutable audit log of all egg consumption, batch creations, price edits, and user status changes.
          </p>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter logs by keyword..."
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-amber-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Activity Timeline Table */}
      <div className="glass-card p-6 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No activity log entries found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-amber-200/60 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60 font-medium">
                {filteredLogs.map(log => {
                  const date = new Date(log.timestamp);
                  return (
                    <tr key={log.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                        {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} at{' '}
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600 dark:text-amber-400">
                        {log.user}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">
                        {log.description}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
