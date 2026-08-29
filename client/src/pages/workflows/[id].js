import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Save,
  Play,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  GitFork,
  Check,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/index.js';
import AppShell from '../../components/AppShell/index.js';
import NodePalette from '../../components/NodePalette/index.js';
import WorkflowCanvas from '../../components/WorkflowCanvas/index.js';
import NodeConfigPanel from '../../components/NodeConfigPanel/index.js';
import { useWorkflowStore } from '../../store/workflowStore.js';
import api from '../../services/api.js';

export default function WorkflowEditorPage() {
  const router = useRouter();
  const { id } = router.query;

  const {
    currentWorkflow,
    setWorkflow,
    saveWorkflow,
    isSaving,
    executeCurrentWorkflow,
    isExecuting,
    addNode,
  } = useWorkflowStore();

  const [loading, setLoading] = useState(true);
  const [saveNotification, setSaveNotification] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState('');

  useEffect(() => {
    if (id && id !== 'new') {
      setLoading(true);
      api.get(`/workflows/${id}`)
        .then((res) => {
          if (res.success && res.data) {
            setWorkflow(res.data);
            setWorkflowTitle(res.data.name || 'Untitled Automation');
          }
        })
        .catch((err) => {
          console.warn('Failed to load workflow:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, setWorkflow]);

  const handleSave = async () => {
    if (currentWorkflow) {
      currentWorkflow.name = workflowTitle;
    }
    const res = await saveWorkflow();
    if (res?.success) {
      setSaveNotification(true);
      setTimeout(() => setSaveNotification(false), 2500);
    }
  };

  const handleExecute = async () => {
    // Save state first
    await handleSave();
    const res = await executeCurrentWorkflow({ source: 'canvas_editor_trigger' });
    if (res?.success && res.executionId) {
      router.push(`/executions/${res.executionId}`);
    }
  };

  const handleDropNode = (nodeType, position, customData) => {
    addNode(nodeType, position, customData);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppShell>
          <div className="min-h-full flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-xs">Loading workflow canvas...</p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="h-full flex flex-col overflow-hidden bg-[#090d16]">
          {/* Top Control Bar */}
          <div className="h-14 px-4 sm:px-6 border-b border-slate-800/80 bg-[#0c1220]/80 flex items-center justify-between flex-shrink-0 z-20">
            {/* Left: Back & Title */}
            <div className="flex items-center space-x-3">
              <Link
                href="/workflows"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={workflowTitle}
                  onChange={(e) => setWorkflowTitle(e.target.value)}
                  className="bg-transparent font-bold text-sm text-slate-100 focus:outline-none focus:bg-slate-900/60 px-2 py-1 rounded-lg border border-transparent focus:border-slate-700 transition-colors"
                />
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase">
                  v{currentWorkflow?.version || 1}
                </span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {saveNotification && (
                <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved</span>
                </span>
              )}

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save</span>
              </button>

              <button
                onClick={handleExecute}
                disabled={isExecuting}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all hover:scale-105 disabled:opacity-50"
              >
                {isExecuting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>Execute Run</span>
              </button>
            </div>
          </div>

          {/* Canvas Workspace Layout */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Left Node Palette */}
            <NodePalette />

            {/* Center Canvas */}
            <div className="flex-1 relative">
              <WorkflowCanvas onDropNode={handleDropNode} />
            </div>

            {/* Right Node Config Panel */}
            <NodeConfigPanel />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
