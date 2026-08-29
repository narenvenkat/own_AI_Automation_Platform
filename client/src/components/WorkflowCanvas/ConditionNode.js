import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitCompare, GitBranch } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

const ConditionNode = ({ id, data, selected }) => {
  const { nodeStatuses } = useWorkflowStore();
  const status = nodeStatuses[id] || 'idle';

  const getStatusBorder = () => {
    if (status === 'running') return 'border-amber-400 ring-2 ring-amber-500/50 animate-pulse';
    if (status === 'completed') return 'border-emerald-500/80 ring-1 ring-emerald-500/30';
    if (status === 'failed') return 'border-rose-500 ring-1 ring-rose-500/30';
    if (selected) return 'border-amber-500 ring-2 ring-amber-500/40';
    return 'border-amber-500/30 hover:border-amber-400/60';
  };

  return (
    <div className={`w-64 rounded-2xl bg-[#0e1626] border ${getStatusBorder()} shadow-xl backdrop-blur-md p-4 transition-all duration-200`}>
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-[#090d16]"
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40">
            <GitBranch className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
              LOGIC BRANCH
            </span>
            <h4 className="text-xs font-semibold text-slate-100 truncate max-w-[140px]">
              {data.label || 'Condition'}
            </h4>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pt-2.5 space-y-1">
        <p className="text-[11px] text-slate-400 leading-snug">
          {data.config?.field ? `If ${data.config.field} ${data.config.operator || 'equals'} "${data.config.value}"` : (data.description || 'Evaluates condition')}
        </p>
      </div>

      {/* Output Handles (True / False) */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '35%' }}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-[#090d16]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '65%' }}
        className="!w-3 !h-3 !bg-rose-400 !border-2 !border-[#090d16]"
      />
    </div>
  );
};

export default memo(ConditionNode);
