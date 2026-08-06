import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Egg, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 300));

    const result = login(email, password);
    if (!result.success) {
      setErrorMsg(result.error || 'Login failed. Please check your credentials.');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-500/10 via-slate-900/5 to-amber-600/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

      <div className="max-w-md w-full space-y-6">

        {/* Logo Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 shadow-xl shadow-amber-500/30">
            <Egg className="w-12 h-12 fill-amber-100 text-slate-950" />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent">
              Bachelor Egg Manager
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
              Shared Household Egg Stock & Cost Tracker
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8 space-y-6 border-2 border-amber-300/60 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email and password provided by the house Admin.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-700 dark:text-rose-300 text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Info note */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an account? Ask the house Admin{' '}
              <span className="font-mono text-amber-600 dark:text-amber-400">
                rajesherode2004@gmail.com
              </span>{' '}
              to create one for you.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
