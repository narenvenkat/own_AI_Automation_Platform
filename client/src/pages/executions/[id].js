import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  PlayCircle,
  ArrowLeft,
  Pause,
  Play,
  Square,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Layers,
  Terminal,
  Shield,
  Zap,
  Eye,
  Activity,
  Cpu,
  CornerDownRight,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/index.js';
import AppShell from '../../components/AppShell/index.js';
import { subscribeToExecution } from '../../services/socket.js';
import api from '../../services/api.js';

export default function ExecutionDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [execution, setExecution] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'payload'
  const logEndRef = useRef(null);

  const fetchExecution = async () => {
    if (!id) return;
    try {
      const [execRes, timelineRes] = await Promise.all([
        api.get(`/executions/${id}`),
        api.get(`/executions/${id}/timeline`),
      ]);

      if (execRes.success) setExecution(execRes.data);
      if (timelineRes.success) setLogs(timelineRes.data || []);
    } catch (err) {
      console.warn('Execution fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecution();

    if (!id) return;

    // Subscribe to live WebSocket updates
    const unsubscribe = subscribeToExecution(id, {
      onLog: (newLog) => {
        setLogs((prev) => [...prev, newLog]);
      },
      onNodeStatus: (nodeEvent) => {
        setExecution((prev) => prev ? { ...prev, currentNode: nodeEvent.nodeId } : prev);
      },
      onStatusChange: (statusEvent) => {
        setExecution((prev) => prev ? { ...prev, status: statusEvent.status, outputs: statusEvent.details?.outputs || prev.outputs } : prev);
      },
    });

    return () => unsubscribe && unsubscribe();
  }, [id]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/pause`);
      fetchExecution();
    } catch (e) {
      alert(e.message || 'Pause failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/resume`);
      fetchExecution();
    } catch (e) {
      alert(e.message || 'Resume failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this execution?')) return;
    setActionLoading(true);
    try {
      await api.post(`/executions/${id}/cancel`);
      fetchExecution();
    } catch (e) {
      alert(e.message || 'Cancel failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getAgentBadge = (agent) => {
    switch (agent) {
      case 'planner':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono uppercase bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-[10px] flex items-center space-x-1">
            <Layers className="w-3 h-3" />
            <span>Planner</span>
          </span>
        );
      case 'execution':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono uppercase bg-violet-950/80 text-violet-300 border border-violet-800/60 text-[10px] flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Execution</span>
          </span>
        );
      case 'validation':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 text-[10px] flex items-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Validation</span>
          </span>
        );
      case 'recovery':
        return (
          <span className="px-2 py-0.5 rounded-full font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-700/60 text-[10px] flex items-center space-x-1">
            <RefreshCw className="w-3 h-3" />
            <span>Recovery</span>
          </span>
        );
      case 'monitoring':
      default:
        return (
          <span className="px-2 py-0.5 rounded-full font-mono uppercase bg-pink-950/80 text-pink-300 border border-pink-700/60 text-[10px] flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>Monitoring</span>
          </span>
        );
    }
  };

  const getLevelBorder = (level) => {
    if (level === 'error') return 'border-rose-800/60 bg-rose-950/30';
    if (level === 'warning') return 'border-amber-800/60 bg-amber-950/30';
    if (level === 'success') return 'border-emerald-800/60 bg-emerald-950/30';
    return 'border-slate-800 bg-slate-900/60';
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="h-full flex flex-col overflow-hidden bg-[#090d16]">
          {/* Top Info & Control Bar */}
          <div className="h-16 px-6 border-b border-slate-800/80 bg-[#0c1220]/90 flex items-center justify-between flex-shrink-0 z-20">
            <div className="flex items-center space-x-4">
              <Link
                href="/executions"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="font-bold text-sm text-slate-100">
                    {execution?.workflowSnapshot?.name || execution?.workflowId?.name || 'Workflow Execution'}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                    execution?.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                    execution?.status === 'FAILED' ? 'bg-rose-950 text-rose-300 border-rose-700' :
                    execution?.status === 'RUNNING' ? 'bg-indigo-950 text-indigo-300 border-indigo-700 animate-pulse' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {execution?.status || 'PENDING'}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono mt-0.5">
                  <span>ID: {id?.slice(-8)}</span>
                  <span>·</span>
                  <span>Duration: {execution?.duration ? `${(execution.duration / 1000).toFixed(2)}s` : 'Live'}</span>
                  <span>·</span>
                  <span className="text-indigo-400">LangGraph: {execution?.langGraphStatus || 'available'}</span>
                </div>
              </div>
            </div>

            {/* Run Controls: Pause, Resume, Cancel */}
            <div className="flex items-center space-x-2.5">
              {execution?.status === 'RUNNING' && (
                <button
                  onClick={handlePause}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition-colors"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}

              {execution?.status === 'PAUSED' && (
                <button
                  onClick={handleResume}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-emerald-700 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume</span>
                </button>
              )}

              {['RUNNING', 'PAUSED', 'RETRYING'].includes(execution?.status) && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 border border-rose-800/60 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Cancel Run</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Selection: Timeline vs Payload */}
          <div className="px-6 border-b border-slate-800 bg-[#0c1220]/50 flex items-center space-x-6 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'timeline'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Cooperating Agents Timeline ({logs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('payload')}
              className={`py-3 border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'payload'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Step Outputs & Payloads</span>
            </button>
          </div>

          {/* Main Body */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
            {activeTab === 'timeline' ? (
              <div className="max-w-4xl mx-auto space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center py-20 text-slate-500 text-xs font-mono">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
                    Waiting for agent events to stream over WebSocket...
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={log._id || index}
                      className={`p-4 rounded-2xl border ${getLevelBorder(log.level)} shadow-md text-xs transition-all`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2.5">
                          {getAgentBadge(log.agent)}
                          {log.nodeId && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                              Node: {log.nodeId}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Live'}
                        </span>
                      </div>

                      <p className="text-slate-200 font-medium leading-relaxed">
                        {log.message}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-black/40 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
                          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Inputs */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-xs text-slate-300 mb-2 uppercase font-mono tracking-wider">
                    Initial Execution Inputs
                  </h4>
                  <pre className="p-3 bg-black/40 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(execution?.inputs || {}, null, 2)}
                  </pre>
                </div>

                {/* Outputs */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                  <h4 className="font-bold text-xs text-slate-300 mb-2 uppercase font-mono tracking-wider">
                    Per-Node Outputs & Context Memory
                  </h4>
                  <pre className="p-3 bg-black/40 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto border border-slate-800">
                    {JSON.stringify(execution?.outputs || {}, null, 2)}
                  </pre>
                </div>

                {/* Error diagnostics */}
                {execution?.error && (
                  <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800/60">
                    <h4 className="font-bold text-xs text-rose-300 mb-2 uppercase font-mono tracking-wider">
                      Error Classification & Escalation
                    </h4>
                    <pre className="p-3 bg-black/40 rounded-xl text-xs font-mono text-rose-300 overflow-x-auto border border-rose-900/50">
                      {JSON.stringify(execution?.error, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
