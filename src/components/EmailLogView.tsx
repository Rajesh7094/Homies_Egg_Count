import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Send } from 'lucide-react';

export const EmailLogView: React.FC = () => {
  const { emailLogs } = useApp();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">
          <Mail className="w-3.5 h-3.5" />
          <span>Automated Notifications</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          Stock Depletion Email Alerts Log
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          When remaining eggs reach 0, an automated email is sent to <strong>rajesherode2004@gmail.com</strong> (once per batch).
        </p>
      </div>

      {/* Email Log Table */}
      <div className="glass-card p-6 space-y-4">
        {emailLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Mail className="w-10 h-10 mx-auto text-slate-400 opacity-50" />
            <p className="text-sm font-semibold">No refill email alerts triggered yet.</p>
            <p className="text-xs text-slate-500">Emails trigger automatically when remaining eggs reach 0.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emailLogs.map(email => (
              <div key={email.id} className="p-4 rounded-xl border border-amber-200/80 dark:border-slate-800 bg-amber-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/40 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500 text-slate-950">
                      {email.batch_number}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      To: {email.recipient}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-1">
                      <Send className="w-3 h-3" /> Dispatched / Simulated
                    </span>
                    <span>{new Date(email.sent_at).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                    Subject: {email.subject}
                  </h4>
                  <pre className="mt-2 p-3 rounded-lg bg-slate-950 text-amber-300 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                    {email.body}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
