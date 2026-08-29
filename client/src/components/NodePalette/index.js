import React, { useState } from 'react';
import {
  Zap,
  Clock,
  Sparkles,
  Cpu,
  Mail,
  Hash,
  MessageSquare,
  Table,
  GitBranch,
  Flag,
  Search,
  Plus,
  GripVertical,
} from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

export default function NodePalette() {
  const [searchTerm, setSearchTerm] = useState('');
  const { addNode } = useWorkflowStore();

  const paletteItems = [
    {
      category: 'Triggers',
      items: [
        {
          type: 'triggerNode',
          label: 'Webhook Trigger',
          icon: Zap,
          color: 'text-cyan-400',
          bg: 'bg-cyan-950/40',
          border: 'border-cyan-800/40',
          description: 'Fires on incoming HTTP webhook payload',
          data: { provider: 'webhook', event: 'webhook_received' },
        },
        {
          type: 'triggerNode',
          label: 'Schedule Trigger',
          icon: Clock,
          color: 'text-amber-400',
          bg: 'bg-amber-950/40',
          border: 'border-amber-800/40',
          description: 'Fires periodically via cron interval',
          data: { provider: 'schedule', event: 'cron_schedule' },
        },
      ],
    },
    {
      category: 'AI Reasoning',
      items: [
        {
          type: 'aiNode',
          label: 'AI Reasoning Prompt',
          icon: Sparkles,
          color: 'text-violet-400',
          bg: 'bg-violet-950/40',
          border: 'border-violet-800/40',
          description: 'Runs prompt through Gemini / OpenRouter',
          data: { model: 'gemini-1.5-flash', category: 'ai' },
        },
        {
          type: 'aiNode',
          label: 'AI Sentiment & Triage',
          icon: Cpu,
          color: 'text-purple-400',
          bg: 'bg-purple-950/40',
          border: 'border-purple-800/40',
          description: 'Classifies urgency and extracts key metrics',
          data: { model: 'claude-3.5-sonnet', category: 'ai' },
        },
      ],
    },
    {
      category: 'Integrations',
      items: [
        {
          type: 'integrationNode',
          label: 'Gmail Send Email',
          icon: Mail,
          color: 'text-rose-400',
          bg: 'bg-rose-950/40',
          border: 'border-rose-800/40',
          description: 'Dispatches email via Gmail OAuth',
          data: { provider: 'gmail', action: 'send_email' },
        },
        {
          type: 'integrationNode',
          label: 'Slack Post Message',
          icon: Hash,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-800/40',
          description: 'Sends message or card to Slack channel',
          data: { provider: 'slack', action: 'post_message' },
        },
        {
          type: 'integrationNode',
          label: 'Discord Send Alert',
          icon: MessageSquare,
          color: 'text-indigo-400',
          bg: 'bg-indigo-950/40',
          border: 'border-indigo-800/40',
          description: 'Posts bot message to Discord channel',
          data: { provider: 'discord', action: 'post_message' },
        },
        {
          type: 'integrationNode',
          label: 'Google Sheets Append',
          icon: Table,
          color: 'text-teal-400',
          bg: 'bg-teal-950/40',
          border: 'border-teal-800/40',
          description: 'Inserts row into Google Sheets ledger',
          data: { provider: 'google-sheets', action: 'append_row' },
        },
      ],
    },
    {
      category: 'Logic & Output',
      items: [
        {
          type: 'conditionNode',
          label: 'Condition Branch',
          icon: GitBranch,
          color: 'text-amber-400',
          bg: 'bg-amber-950/40',
          border: 'border-amber-800/40',
          description: 'Routes execution based on rules',
          data: { category: 'logic' },
        },
        {
          type: 'outputNode',
          label: 'Workflow Output',
          icon: Flag,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-800/40',
          description: 'Records final execution result',
          data: { category: 'output' },
        },
      ],
    },
  ];

  const onDragStart = (event, nodeType, customData) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType);
    event.dataTransfer.setData('application/reactflow/data', JSON.stringify(customData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredCategories = paletteItems
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="w-72 bg-[#0c1220] border-r border-slate-800/80 flex flex-col h-full select-none z-10">
      {/* Palette Header */}
      <div className="p-4 border-b border-slate-800/80">
        <h3 className="font-bold text-sm text-slate-100 mb-2.5">Node Palette</h3>
        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Node Category List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {filteredCategories.map((category) => (
          <div key={category.category}>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2 px-1">
              {category.category}
            </span>
            <div className="space-y-2">
              {category.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.type, { ...item.data, label: item.label, description: item.description })}
                    className="p-3 rounded-xl glass-panel border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-800/40 cursor-grab active:cursor-grabbing transition-all group relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5">
                        <div className={`p-1.5 rounded-lg ${item.bg} ${item.border} border mt-0.5`}>
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div>
                          <h5 className="text-xs font-semibold text-slate-200 group-hover:text-white">
                            {item.label}
                          </h5>
                          <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => addNode(item.type, { x: 300, y: 200 }, { ...item.data, label: item.label, description: item.description })}
                        title="Click to add to canvas"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
