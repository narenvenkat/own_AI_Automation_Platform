import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Sparkles,
  Activity,
  GitFork,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Lock,
  Layers,
  Terminal,
  Cpu,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  const agents = [
    {
      name: 'Planner Agent',
      role: 'Topological sequencing & DAG resolution',
      badge: '99.4% Confidence',
      icon: Layers,
      color: 'from-cyan-500 to-blue-500',
    },
    {
      name: 'Execution Agent',
      role: 'Tool invocation, LLM routing & interpolation',
      badge: 'Zero-Leak Env',
      icon: Zap,
      color: 'from-violet-500 to-indigo-500',
    },
    {
      name: 'Validation Agent',
      role: 'Payload schema & invariant verification',
      badge: 'Strict Contract',
      icon: Shield,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      name: 'Recovery Agent',
      role: 'Exponential backoff & escalation triage',
      badge: 'Self-Healing',
      icon: RefreshCw,
      color: 'from-amber-500 to-orange-500',
    },
    {
      name: 'Monitoring Agent',
      role: 'Socket.IO event stream & audit log persistence',
      badge: 'Live WebSocket',
      icon: Eye,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="h-20 border-b border-slate-800/80 bg-[#0c1220]/80 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Agentflow<span className="text-indigo-400">_AI</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Launch Console
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 sm:px-12 max-w-7xl mx-auto text-center flex-1 flex flex-col items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 rounded-full blur-[130px] pointer-events-none" />

        {/* Eyebrow Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-semibold mb-8 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span>Multi-Agent Autonomous Operations Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
          Turn Plain English Into{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-400 bg-clip-text text-transparent">
            Self-Healing Agent Workflows
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed mb-10">
          Describe any enterprise automation in natural language. Agentflow AI synthesizes executable visual DAG graphs, coordinates a 5-agent cooperative chain, integrates with Gmail, Slack, Discord & Sheets, and handles live recovery automatically.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-105"
          >
            <span>Open Operator Console</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-medium text-sm transition-all"
          >
            Sign In with Demo Account
          </Link>
        </div>

        {/* 5-Agent Chain Showcase */}
        <div className="w-full mt-20 pt-10 border-t border-slate-800/80">
          <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-8">
            Cooperating 5-Agent Autonomous Subsystem
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-left">
            {agents.map((agent, i) => {
              const Icon = agent.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
                      Step {i + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-200">{agent.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-snug">{agent.role}</p>

                  <div className="mt-3 pt-3 border-t border-slate-800/60">
                    <span className="text-[10px] font-mono text-indigo-300 font-semibold">
                      {agent.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 text-center text-xs text-slate-400">
        <p>© 2026 Agentic AI Automation Platform (Agentflow_AI). Built with LangGraph substrate & Next.js.</p>
      </footer>
    </div>
  );
}
