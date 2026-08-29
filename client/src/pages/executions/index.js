import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Eye,
  Loader2,
  Cpu,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/index.js';
import AppShell from '../../components/AppShell/index.js';
import api from '../../services/api.js';

export default function ExecutionsListPage() {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/executions', {
        params: { status: statusFilter },
      });
      if (res.success) {
        setExecutions(res.data || []);
      }
    } catch (err) {
      console.warn('Executions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
    const interval = setInterval(fetchExecutions, 10000);
    return () => clearInterval(interval);
  }, [statusFilter]);

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
      case 'PAUSED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-700/50">
            <span>Paused</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
            <span>Cancelled</span>
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
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
                <PlayCircle className="w-6 h-6 text-cyan-400" />
                <span>Execution Timeline & Audit Runs</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time agent execution stream, step outputs, diagnostic recovery logs, and duration metrics.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchExecutions}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Execution Statuses</option>
              <option value="RUNNING">Running</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="PAUSED">Paused</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Execution Runs Table / List */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading execution audit log...</p>
            </div>
          ) : executions.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto">
              <PlayCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-200">No Executions Found</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Trigger an execution from your workflows or canvas editor to see live multi-agent events.
              </p>
              <Link
                href="/workflows"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <span>View Workflows</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0c1220] border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Workflow</th>
                      <th className="py-3.5 px-5">Started At</th>
                      <th className="py-3.5 px-5">Duration</th>
                      <th className="py-3.5 px-5">Retries</th>
                      <th className="py-3.5 px-5 text-right">Inspect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {executions.map((exec) => (
                      <tr key={exec._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-5">{getStatusBadge(exec.status)}</td>
                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-200 block text-xs truncate max-w-xs">
                            {exec.workflowId?.name || 'Automation Graph'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {exec._id.slice(-8)}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-400 font-mono">
                          {new Date(exec.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-300">
                          {exec.duration ? `${(exec.duration / 1000).toFixed(2)}s` : 'Running...'}
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-400">
                          {exec.retryCount || 0}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <Link
                            href={`/executions/${exec._id}`}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-xl text-slate-300 font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Timeline</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
