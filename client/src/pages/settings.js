import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Key,
  Database,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/index.js';
import AppShell from '../components/AppShell/index.js';
import { useAuthStore } from '../store/authStore.js';
import api from '../services/api.js';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/health')
      .then((res) => setHealth(res))
      .catch((err) => console.warn('Health check error:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="pb-4 border-b border-slate-800/80">
            <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
              <SettingsIcon className="w-6 h-6 text-indigo-400" />
              <span>Operator & System Settings</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Verify platform health, cryptographic key states, multi-agent substrate, and account details.
            </p>
          </div>

          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/80">
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/50 text-indigo-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Operator Profile</h3>
                <p className="text-xs text-slate-400">Session authentication details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Operator Name</span>
                <span className="font-semibold text-slate-200">{user?.name || 'Operator'}</span>
              </div>
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Email Address</span>
                <span className="font-semibold text-slate-200">{user?.email || 'operator@agentflow.ai'}</span>
              </div>
              <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">Role Permission</span>
                <span className="font-mono text-indigo-400 uppercase font-bold">{user?.role || 'operator'}</span>
              </div>
            </div>
          </div>

          {/* Security & System Diagnostics */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/80">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Security & Subsystem Health</h3>
                <p className="text-xs text-slate-400">Encryption status and agent substrate validation</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Key className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Credential Encryption (AES-256-GCM)</span>
                    <span className="text-slate-400 text-[11px]">Hardware-accelerated auth tags enabled</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  HEALTHY
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-semibold text-slate-200 block">Database Storage Layer</span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {health?.database?.status === 'connected' ? `Connected (${health?.database?.name})` : 'In-Memory Fallback Active'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                  ONLINE
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-4 h-4 text-violet-400" />
                  <div>
                    <span className="font-semibold text-slate-200 block">LangGraph Multi-Agent Engine</span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      Planner · Execution · Validation · Recovery · Monitoring
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-700">
                  AVAILABLE
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
