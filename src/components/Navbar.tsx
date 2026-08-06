import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Egg, Shield, User as UserIcon, AlertCircle, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { activeBatch } = useApp();
  const { theme, toggleTheme } = useTheme();

  const remaining = activeBatch ? activeBatch.remaining_eggs : 0;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-amber-200/50 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30">
            <Egg className="w-6 h-6 fill-amber-100 text-slate-950" />
            {remaining <= 5 && remaining > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            )}
            {remaining === 0 && activeBatch && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
            )}
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent leading-none">
              Bachelor Egg Manager
            </h1>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {activeBatch ? activeBatch.batch_number : 'No Batch Active'}
            </span>
          </div>
        </div>

        {/* Live Stock Warning Badge */}
        <div className="hidden md:flex items-center gap-2">
          {!activeBatch ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 text-xs font-semibold">
              No Active Batch
            </div>
          ) : remaining > 5 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Stock: {remaining} Eggs
            </div>
          ) : remaining > 0 ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-400 text-amber-900 dark:text-amber-300 text-xs font-bold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Only {remaining} Eggs Left!
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 dark:bg-rose-950/80 border border-rose-400 text-rose-900 dark:text-rose-200 text-xs font-extrabold red-glow">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Stock Finished (0 Left)
            </div>
          )}
        </div>

        {/* Right: Current User Info, Theme Toggle, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Current User Display */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100/70 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <UserIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-semibold hidden sm:inline truncate max-w-[100px]">
              {currentUser?.name.split(' ')[0]}
            </span>
            <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold">
              {currentUser?.user_id}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Role Badge + Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wide hidden sm:flex items-center gap-1 ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
            }`}>
              {isAdmin ? (
                <>
                  <Shield className="w-3 h-3" /> Admin
                </>
              ) : 'User'}
            </span>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
