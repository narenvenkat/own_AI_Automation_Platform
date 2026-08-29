import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Mail, MessageSquare, Table, Hash, CheckCircle2 } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

const IntegrationNode = ({ id, data, selected }) => {
  const { nodeStatuses } = useWorkflowStore();
  const status = nodeStatuses[id] || 'idle';

  const getProviderMeta = () => {
    switch (data?.provider) {
      case 'gmail':
        return { icon: Mail, color: 'text-rose-400', bg: 'bg-rose-950/60', border: 'border-rose-800/40', handle: '!bg-rose-400' };
      case 'slack':
        return { icon: Hash, color: 'text-emerald-400', bg: 'bg-emerald-950/60', border: 'border-emerald-800/40', handle: '!bg-emerald-400' };
      case 'discord':
        return { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-950/60', border: 'border-indigo-800/40', handle: '!bg-indigo-400' };
      case 'google-sheets':
        return { icon: Table, color: 'text-teal-400', bg: 'bg-teal-950/60', border: 'border-teal-800/40', handle: '!bg-teal-400' };
      default:
        return { icon: MessageSquare, color: 'text-indigo-400', bg: 'bg-indigo-950/60', border: 'border-indigo-800/40', handle: '!bg-indigo-400' };
    }
  };

  const meta = getProviderMeta();
  const Icon = meta.icon;

  const getStatusBorder = () => {
    if (status === 'running') return 'border-amber-400 ring-2 ring-amber-500/50 animate-pulse';
    if (status === 'completed') return 'border-emerald-500/80 ring-1 ring-emerald-500/30';
    if (status === 'failed') return 'border-rose-500 ring-1 ring-rose-500/30';
    if (selected) return 'border-indigo-500 ring-2 ring-indigo-500/40';
    return `${meta.border} hover:border-slate-600`;
  };

  return (
    <div className={`w-64 rounded-2xl bg-[#0e1626] border ${getStatusBorder()} shadow-xl backdrop-blur-md p-4 transition-all duration-200`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className={`!w-3 !h-3 ${meta.handle} !border-2 !border-[#090d16]`}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg ${meta.bg} border ${meta.border}`}>
            <Icon className={`w-4 h-4 ${meta.color}`} />
          </div>
          <div>
            <span className={`text-[10px] font-mono uppercase tracking-wider ${meta.color} font-bold block`}>
              {data.provider || 'INTEGRATION'}
            </span>
            <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[140px]">
              {data.label || 'Action'}
            </h4>
          </div>
        </div>

        {status !== 'idle' && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
            status === 'running' ? 'bg-amber-950 text-amber-300 border border-amber-700' :
            status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
            'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="pt-2.5 space-y-1">
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
          {data.description || 'Executes third-party API action.'}
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
          <span>Action: {data.action || 'default'}</span>
          <span className="text-emerald-400 flex items-center space-x-0.5">
            <CheckCircle2 className="w-3 h-3" />
            <span>OAuth Secure</span>
          </span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className={`!w-3 !h-3 ${meta.handle} !border-2 !border-[#090d16]`}
      />
    </div>
  );
};

export default memo(IntegrationNode);
