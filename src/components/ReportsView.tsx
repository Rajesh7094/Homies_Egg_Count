import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Download, FileText, Table, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsView: React.FC = () => {
  const { availableUsers } = useAuth();
  const { consumptions, batches, getUserConsumptionCount, getUserPendingAmount } = useApp();

  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const filteredConsumptions = consumptions.filter(c => {
    const matchBatch = selectedBatch === 'all' || c.batch_id === selectedBatch;
    const matchUser = selectedUser === 'all' || c.user_id === selectedUser;
    return matchBatch && matchUser;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Record ID', 'User ID', 'User Name', 'Batch Number', 'Egg Count', 'Price Per Egg', 'Amount (INR)', 'Date & Time'];
    const rows = filteredConsumptions.map(c => [
      c.id,
      c.custom_user_id,
      `"${c.user_name}"`,
      c.batch_number,
      c.egg_count,
      c.price_per_egg,
      c.amount,
      `"${new Date(c.consumed_at).toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bachelor_Egg_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Bachelor Egg Manager - Audit Consumption Report', 14, 20);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 14, 28);
    doc.text(`Batch Filter: ${selectedBatch === 'all' ? 'All Batches' : selectedBatch}`, 14, 34);

    const tableData = filteredConsumptions.map(c => [
      c.custom_user_id,
      c.user_name,
      c.batch_number,
      `+${c.egg_count}`,
      `Rs. ${c.price_per_egg}`,
      `Rs. ${c.amount}`,
      new Date(c.consumed_at).toLocaleDateString('en-IN'),
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['User ID', 'Name', 'Batch', 'Eggs', 'Unit Price', 'Total', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: [0, 0, 0] },
    });

    doc.save(`Bachelor_Egg_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Financial Reporting</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Export Consumption & Settlement Reports
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Export complete egg consumption logs and user pending bill calculations to Excel CSV or PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={exportToPDF}
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-amber-500" /> Filter Options:
        </div>

        {/* Batch Filter */}
        <select
          value={selectedBatch}
          onChange={e => setSelectedBatch(e.target.value)}
          className="px-3 py-2 rounded-xl border border-amber-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All Batches</option>
          {batches.map(b => (
            <option key={b.id} value={b.id}>
              {b.batch_number} (₹{b.price_per_egg}/egg)
            </option>
          ))}
        </select>

        {/* User Filter */}
        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="px-3 py-2 rounded-xl border border-amber-200/60 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="all">All House Users</option>
          {availableUsers.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.user_id})
            </option>
          ))}
        </select>
      </div>

      {/* User Summary Aggregation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {availableUsers.map(user => {
          const count = getUserConsumptionCount(user.id, selectedBatch === 'all' ? undefined : selectedBatch);
          const pending = getUserPendingAmount(user.id);
          return (
            <div key={user.id} className="glass-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-slate-800 text-amber-900 dark:text-amber-300">
                  {user.user_id}
                </span>
                <span className="text-xs font-semibold text-slate-500">{user.name}</span>
              </div>
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-lg font-black text-slate-900 dark:text-white">{count} Eggs</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">₹{pending}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtered Consumption Table */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-amber-500" />
            Filtered Log Details ({filteredConsumptions.length} records)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-amber-200/60 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Batch</th>
                <th className="py-3 px-4">Egg Count</th>
                <th className="py-3 px-4">Price Per Egg</th>
                <th className="py-3 px-4 text-right">Calculated Cost</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 dark:divide-slate-800/60 font-medium">
              {filteredConsumptions.map(c => (
                <tr key={c.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                    {c.custom_user_id}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-bold">
                    {c.user_name}
                  </td>
                  <td className="py-3 px-4 text-xs font-mono text-slate-600 dark:text-slate-400">
                    {c.batch_number}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    +{c.egg_count}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    ₹{c.price_per_egg}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-600 dark:text-amber-400">
                    ₹{c.amount}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-slate-500 font-mono">
                    {new Date(c.consumed_at).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
