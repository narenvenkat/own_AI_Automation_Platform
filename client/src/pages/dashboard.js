import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sparkles,
  PlayCircle,
  GitFork,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/index.js';
import AppShell from '../components/AppShell/index.js';
import MetricGrid from '../components/MetricGrid/index.js';
import api from '../services/api.js';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-rose-950/80 text-rose-300 border border-rose-700/50">
            <XCircle className="w-3 h-3" />
            <span>Failed</span>
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-700/50 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Running</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
            <span>{status || 'Pending'}</span>
          </span>
        );
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
                <span>Autonomous Operator Console</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  Live
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Active workflow graph monitoring, cooperative agent health, and execution stream telemetry.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>Prompt to Workflow</span>
              </Link>
              <Link
                href="/workflows"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Blank Canvas</span>
              </Link>
            </div>
          </div>

          {/* Metric Grid KPIs */}
          <MetricGrid stats={stats} />

          {/* Dual Panel: Recent Workflows & Recent Executions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Workflows Panel */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <GitFork className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm text-slate-100">Active Workflows</h3>
                  </div>
                  <Link
                    href="/workflows"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {!stats?.recentWorkflows || stats.recentWorkflows.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No workflows created yet. Click "Prompt to Workflow" to build your first automation.
                    </div>
                  ) : (
                    stats.recentWorkflows.map((wf) => (
                      <Link
                        key={wf._id}
                        href={`/workflows/${wf._id}`}
                        className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-indigo-500/40 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                              {wf.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate max-w-xs">
                              {wf.description || 'Configured automation graph'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                            {wf.nodes?.length || 0} nodes
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded uppercase">
                            v{wf.version || 1}
                          </span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Fast AI synthesis ready</span>
                <Link href="/workflows/builder" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Generate with Prompt →
                </Link>
              </div>
            </div>

            {/* Recent Executions Stream */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <PlayCircle className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-sm text-slate-100">Live Execution Audit Feed</h3>
                  </div>
                  <Link
                    href="/executions"
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition-colors"
                  >
                    <span>Full history</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {!stats?.recentExecutions || stats.recentExecutions.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 text-xs">
                      No executions yet. Trigger a workflow run to view real-time timeline events.
                    </div>
                  ) : (
                    stats.recentExecutions.map((exec) => (
                      <Link
                        key={exec._id}
                        href={`/executions/${exec._id}`}
                        className="p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between transition-all group"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-xs text-slate-200 group-hover:text-white truncate">
                              {exec.workflowId?.name || 'Workflow Run'}
                            </h4>
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{new Date(exec.createdAt).toLocaleTimeString()}</span>
                            <span>·</span>
                            <span>{exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'Processing'}</span>
                          </div>
                        </div>

                        <div>{getStatusBadge(exec.status)}</div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Multi-agent timeline persisted</span>
                <Link href="/executions" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                  Inspect Run Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
