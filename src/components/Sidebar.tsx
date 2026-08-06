import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  Users,
  History,
  FileSpreadsheet,
  Mail,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export type TabType = 'user-dashboard' | 'admin-dashboard' | 'batches' | 'users' | 'activity' | 'reports' | 'emails';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isAdmin, currentUser } = useAuth();

  const navItems = [
    {
      id: 'user-dashboard' as TabType,
      label: 'My Consumption',
      icon: UserCheck,
      badge: currentUser?.user_id,
      adminOnly: false,
    },
    {
      id: 'admin-dashboard' as TabType,
      label: 'Admin Overview',
      icon: LayoutDashboard,
      badge: 'Admin',
      adminOnly: true,
    },
    {
      id: 'batches' as TabType,
      label: 'Egg Batches',
      icon: Layers,
      adminOnly: false,
    },
    {
      id: 'users' as TabType,
      label: 'User Directory',
      icon: Users,
      badge: 'Admin',
      adminOnly: true,
    },
    {
      id: 'activity' as TabType,
      label: 'Activity Logs',
      icon: History,
      adminOnly: false,
    },
    {
      id: 'reports' as TabType,
      label: 'Reports & Export',
      icon: FileSpreadsheet,
      adminOnly: false,
    },
    {
      id: 'emails' as TabType,
      label: 'Refill Email Logs',
      icon: Mail,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl border border-amber-200/50 dark:border-slate-800/80 p-3 h-fit space-y-1">
      <div className="px-3 py-2 text-[11px] font-bold text-amber-950/60 dark:text-slate-400 tracking-wider uppercase">
        Navigation
      </div>

      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const isDisabled = item.adminOnly && !isAdmin;

        return (
          <button
            key={item.id}
            onClick={() => !isDisabled && setActiveTab(item.id)}
            disabled={isDisabled}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : isDisabled
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'
                : 'text-slate-700 dark:text-slate-300 hover:bg-amber-100/60 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-600 dark:text-amber-400'}`} />
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isActive
                    ? 'bg-slate-950 text-amber-300'
                    : 'bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-slate-700'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}

      {!isAdmin && (
        <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            You are viewing as standard user <strong>{currentUser?.name}</strong>. Admin tabs require Admin permissions.
          </span>
        </div>
      )}
    </aside>
  );
};
