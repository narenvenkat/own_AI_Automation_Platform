import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Loader2,
  Cpu,
  Layers,
  Send,
  Zap,
  CheckCircle2,
  Flame,
  FileCode,
  Edit3,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute/index.js';
import AppShell from '../../components/AppShell/index.js';
import WorkflowCanvas from '../../components/WorkflowCanvas/index.js';
import { useWorkflowStore } from '../../store/workflowStore.js';
import api from '../../services/api.js';

export default function AIWorkflowBuilderPage() {
  const router = useRouter();
  const { setWorkflow } = useWorkflowStore();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWorkflow, setGeneratedWorkflow] = useState(null);
  const [generatorModel, setGeneratorModel] = useState(null);
  const [error, setError] = useState('');

  const templatePrompts = [
    {
      title: 'Customer Triage & Slack Alert',
      prompt: 'When a new support ticket arrives, run an AI sentiment classification with Gemini, determine urgency, and notify the #ops-triage Slack channel with a triage summary.',
    },
    {
      title: 'Lead Outreach & Gmail Welcome',
      prompt: 'When a website lead form is submitted, analyze the budget with AI, generate a personalized executive welcome letter, and send an email via Gmail.',
    },
    {
      title: 'Invoice Line Items & Google Sheets',
      prompt: 'Extract vendor name, invoice date, line items, and total amount from incoming invoice files, and append the row to Google Sheets finance ledger.',
    },
    {
      title: 'Discord Community Monitor',
      prompt: 'Listen for community questions, draft answers using Claude/Gemini, and dispatch an automated bot embed to Discord.',
    },
  ];

  const handleGenerate = async (targetPrompt) => {
    const textToRun = targetPrompt || prompt;
    if (!textToRun || !textToRun.trim()) {
      setError('Please provide a prompt describing your automation.');
      return;
    }

    setError('');
    setIsGenerating(true);
    try {
      const res = await api.post('/workflows/generate', { prompt: textToRun });
      if (res.success && res.data) {
        setGeneratedWorkflow(res.data);
        setGeneratorModel(res.generator || 'AI Engine');
        setWorkflow(res.data);
      }
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="h-full flex flex-col overflow-hidden bg-[#090d16]">
          {/* Top Bar */}
          <div className="p-4 px-6 border-b border-slate-800/80 bg-[#0c1220]/70 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                  <span>AI Prompt-to-Workflow Synthesizer</span>
                  {generatorModel && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800 uppercase">
                      Generated via {generatorModel}
                    </span>
                  )}
                </h1>
                <p className="text-[11px] text-slate-400">Describe your process in plain English to build an executable DAG graph</p>
              </div>
            </div>

            {generatedWorkflow?._id && (
              <Link
                href={`/workflows/${generatedWorkflow._id}`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Open in Canvas Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Builder Body (Dual Layout) */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Prompt Input Panel */}
            <div className="w-full lg:w-96 p-6 border-r border-slate-800/80 bg-[#0c1220]/50 overflow-y-auto flex flex-col justify-between flex-shrink-0">
              <div className="space-y-5">
                {/* Prompt Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Describe your desired automation:
                  </label>
                  <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. When a new customer inquiry arrives, summarize intent with AI and post a notification to Slack #support..."
                    className="w-full p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  />

                  {error && (
                    <p className="mt-2 text-xs text-rose-400 font-medium">{error}</p>
                  )}

                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Workflow Graph...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Workflow Graph</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Preset Prompt Pills */}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-2 font-bold">
                    Quick Automation Templates
                  </span>
                  <div className="space-y-2">
                    {templatePrompts.map((tmpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPrompt(tmpl.prompt);
                          handleGenerate(tmpl.prompt);
                        }}
                        disabled={isGenerating}
                        className="w-full p-3 rounded-xl glass-panel border border-slate-800 text-left hover:border-indigo-500/50 hover:bg-slate-800/40 transition-all group"
                      >
                        <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-200 group-hover:text-indigo-300">
                          <Zap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{tmpl.title}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {tmpl.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subsystem Note */}
              <div className="pt-4 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
                Multi-tier engine: OpenRouter → Gemini → Deterministic Rule Engine
              </div>
            </div>

            {/* Right Canvas Graph Preview */}
            <div className="flex-1 relative bg-[#090d16]">
              {isGenerating ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#090d16]/80 backdrop-blur-sm">
                  <div className="p-6 rounded-3xl glass-panel border border-indigo-500/40 text-center max-w-sm">
                    <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto mb-3" />
                    <h4 className="font-bold text-sm text-slate-100 mb-1">Synthesizing DAG Topology</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Reasoning over node relationships, integration actions, and data contracts...
                    </p>
                  </div>
                </div>
              ) : null}

              {generatedWorkflow ? (
                <WorkflowCanvas readOnly={false} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                  <Layers className="w-16 h-16 text-slate-700 mb-4" />
                  <h3 className="font-bold text-base text-slate-300">Graph Preview Area</h3>
                  <p className="text-xs text-slate-500 max-w-md mt-1">
                    Enter a prompt or select a template on the left to watch your automation graph materialize in real time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
