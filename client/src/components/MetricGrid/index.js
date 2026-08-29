import React from 'react';
import {
  GitFork,
  Activity,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Zap,
  ShieldCheck,
} from 'lucide-react';

export default function MetricGrid({ stats }) {
  const {
    totalWorkflows = 0,
    activeWorkflows = 0,
    totalExecutions = 0,
    completedExecutions = 0,
    failedExecutions = 0,
    successRate = 100,
  } = stats || {};

  const cards = [
    {
      label: 'Active Workflows',
      value: `${activeWorkflows} / ${totalWorkflows}`,
      subtext: 'Automations in active state',
      icon: GitFork,
      color: 'from-indigo-500 to-violet-500',
      textColor: 'text-indigo-400',
      bgColor: 'bg-indigo-950/30',
      borderColor: 'border-indigo-800/40',
    },
    {
      label: 'Success Reliability',
      value: `${successRate}%`,
      subtext: `${completedExecutions} successful runs`,
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-800/40',
    },
    {
      label: 'Total Executions',
      value: totalExecutions,
      subtext: `${failedExecutions} failed or escalated`,
      icon: Zap,
      color: 'from-cyan-500 to-blue-500',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-950/30',
      borderColor: 'border-cyan-800/40',
    },
    {
      label: 'Agent Cooperative Chain',
      value: '5 / 5 Online',
      subtext: 'Planner · Executor · Validator · Recovery · Monitor',
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-800/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl glass-panel ${card.borderColor} relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/5`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.label}</span>
              <div className={`p-2.5 rounded-xl ${card.bgColor} ${card.textColor} border ${card.borderColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-slate-400 flex items-center space-x-1 truncate">
                <span>{card.subtext}</span>
              </p>
            </div>

            {/* Subtle bottom gradient highlight line */}
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.color} opacity-60`} />
          </div>
        );
      })}
    </div>
  );
}
