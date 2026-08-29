import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Clock, Globe, ArrowRight } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

const TriggerNode = ({ id, data, selected }) => {
  const { nodeStatuses } = useWorkflowStore();
  const status = nodeStatuses[id] || 'idle';

  const getIcon = () => {
    if (data?.provider === 'schedule') return <Clock className="w-4 h-4 text-amber-400" />;
    return <Zap className="w-4 h-4 text-cyan-400" />;
  };

  const getStatusBorder = () => {
    if (status === 'running') return 'border-indigo-400 ring-2 ring-indigo-500/50 animate-pulse';
    if (status === 'completed') return 'border-emerald-500/80 ring-1 ring-emerald-500/30';
    if (status === 'failed') return 'border-rose-500 ring-1 ring-rose-500/30';
    if (selected) return 'border-indigo-500 ring-2 ring-indigo-500/40';
    return 'border-cyan-500/30 hover:border-cyan-400/60';
  };

  return (
    <div className={`w-64 rounded-2xl bg-[#0e1626] border ${getStatusBorder()} shadow-xl backdrop-blur-md p-4 transition-all duration-200`}>
      {/* Node Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40">
            {getIcon()}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              TRIGGER
            </span>
            <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[140px]">
              {data.label || 'Trigger'}
            </h4>
          </div>
        </div>

        {status !== 'idle' && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
            status === 'running' ? 'bg-indigo-950 text-indigo-300 border border-indigo-700' :
            status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
            'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {status}
          </span>
        )}
      </div>

      {/* Node Body */}
      <div className="pt-2.5 space-y-1">
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
          {data.description || 'Fires the workflow automatically.'}
        </p>
        <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span>Source: {data.provider || 'Webhook'}</span>
          <span>Event: {data.event || 'Manual'}</span>
        </div>
      </div>

      {/* React Flow Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-400 !border-2 !border-[#090d16]"
      />
    </div>
  );
};

export default memo(TriggerNode);
