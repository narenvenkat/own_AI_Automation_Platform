import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Sparkles, Cpu } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

const AiNode = ({ id, data, selected }) => {
  const { nodeStatuses } = useWorkflowStore();
  const status = nodeStatuses[id] || 'idle';

  const getStatusBorder = () => {
    if (status === 'running') return 'border-violet-400 ring-2 ring-violet-500/50 animate-pulse';
    if (status === 'completed') return 'border-emerald-500/80 ring-1 ring-emerald-500/30';
    if (status === 'failed') return 'border-rose-500 ring-1 ring-rose-500/30';
    if (selected) return 'border-violet-500 ring-2 ring-violet-500/40';
    return 'border-violet-500/30 hover:border-violet-400/60';
  };

  return (
    <div className={`w-64 rounded-2xl bg-[#0e1626] border ${getStatusBorder()} shadow-xl backdrop-blur-md p-4 transition-all duration-200`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-[#090d16]"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-violet-950/60 border border-violet-800/40">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 font-bold block">
              AI REASONING
            </span>
            <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[140px]">
              {data.label || 'AI Step'}
            </h4>
          </div>
        </div>

        {status !== 'idle' && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono uppercase ${
            status === 'running' ? 'bg-violet-950 text-violet-300 border border-violet-700' :
            status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' :
            'bg-rose-950 text-rose-300 border border-rose-700'
          }`}>
            {status}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="pt-2.5 space-y-1.5">
        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
          {data.config?.prompt || data.description || 'Executes prompt logic'}
        </p>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3 h-3 text-violet-400" />
            <span>{data.model || 'Gemini 1.5'}</span>
          </span>
          <span className="text-violet-300 font-semibold">Structured Output</span>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-violet-400 !border-2 !border-[#090d16]"
      />
    </div>
  );
};

export default memo(AiNode);
