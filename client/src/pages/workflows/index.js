import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  GitFork,
  Plus,
  Sparkles,
  Search,
  Play,
  Copy,
  Trash2,
  Edit,
  Layers,
  Clock,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/index.js';
import AppShell from '../../components/AppShell/index.js';
import api from '../../services/api.js';

export default function WorkflowsListPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workflows', {
        params: { search, status: statusFilter },
      });
      if (res.success) {
        setWorkflows(res.data || []);
      }
    } catch (err) {
      console.warn('Error fetching workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [search, statusFilter]);

  const handleDuplicate = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.post(`/workflows/${id}/duplicate`);
      if (res.success) {
        setMessage('Workflow duplicated successfully.');
        fetchWorkflows();
      }
    } catch (err) {
      alert(err.message || 'Duplication failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    setActionLoadingId(id);
    try {
      const res = await api.delete(`/workflows/${id}`);
      if (res.success) {
        setMessage('Workflow deleted.');
        fetchWorkflows();
      }
    } catch (err) {
      alert(err.message || 'Deletion failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExecute = async (id) => {
    setActionLoadingId(id);
    try {
      const res = await api.post(`/workflows/${id}/execute`, { inputs: { trigger: 'manual_list' } });
      if (res.success && res.data?.executionId) {
        router.push(`/executions/${res.data.executionId}`);
      }
    } catch (err) {
      alert(err.message || 'Trigger failed');
      setActionLoadingId(null);
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
                <GitFork className="w-6 h-6 text-indigo-400" />
                <span>Workflow Repository</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage visual automation DAG graphs, version history, and execution triggers.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/workflows/builder"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Prompt Generator</span>
              </Link>
              <button
                onClick={async () => {
                  const res = await api.post('/workflows', { name: 'Untitled Workflow', nodes: [], edges: [] });
                  if (res.success) router.push(`/workflows/${res.data._id}`);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Blank</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search workflows by name, tags, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Workflows Grid */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Loading workflows...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center max-w-lg mx-auto">
              <Layers className="w-12 h-12 text-indigo-400/60 mx-auto mb-4" />
              <h3 className="font-bold text-base text-slate-200">No Workflows Found</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Start by generating a workflow from natural language or creating a blank canvas.
              </p>
              <Link
                href="/workflows/builder"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Synthesize with AI</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workflows.map((wf) => (
                <div
                  key={wf._id}
                  className="glass-panel p-5 rounded-3xl border border-slate-800/90 hover:border-indigo-500/50 flex flex-col justify-between transition-all duration-200 group relative"
                >
                  <div>
                    {/* Top Meta */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase border ${
                        wf.status === 'active' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50' :
                        wf.status === 'draft' ? 'bg-amber-950/60 text-amber-300 border-amber-700/50' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {wf.status || 'draft'}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        v{wf.version || 1}
                      </span>
                    </div>

                    <Link href={`/workflows/${wf._id}`} className="block group-hover:text-indigo-300 transition-colors">
                      <h3 className="font-bold text-sm text-slate-100 truncate mb-1">
                        {wf.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {wf.description || 'No description configured.'}
                      </p>
                    </Link>

                    {/* Tags */}
                    {wf.tags && wf.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {wf.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Actions */}
                  <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                      <span>{wf.nodes?.length || 0} nodes</span>
                      <span>·</span>
                      <span>{wf.edges?.length || 0} edges</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleExecute(wf._id)}
                        disabled={actionLoadingId === wf._id}
                        title="Trigger Execution"
                        className="p-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-800/50 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(wf._id)}
                        disabled={actionLoadingId === wf._id}
                        title="Clone Workflow"
                        className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <Link
                        href={`/workflows/${wf._id}`}
                        title="Open Canvas Editor"
                        className="p-2 rounded-xl bg-indigo-950/40 hover:bg-indigo-600 hover:text-white text-indigo-400 border border-indigo-800/50 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(wf._id)}
                        disabled={actionLoadingId === wf._id}
                        title="Delete Workflow"
                        className="p-2 rounded-xl bg-rose-950/30 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-800/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
