import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please provide both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const redirect = router.query.redirect || '/dashboard';
      router.push(redirect);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 group mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Agentflow<span className="text-indigo-400">_AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Operator Console Login</h2>
          <p className="text-xs text-slate-400 mt-1">Authenticate to access autonomous workflow control</p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
          {(formError || error) && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{formError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@agentflow.ai"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <span className="text-[11px] font-mono uppercase text-slate-400 block text-center mb-2.5">
              Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@agentflow.ai', 'password123')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition-colors text-center"
              >
                Admin Account
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('operator@agentflow.ai', 'password123')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 transition-colors text-center"
              >
                Operator Account
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an operator account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
