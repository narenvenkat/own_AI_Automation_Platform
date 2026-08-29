import React from 'react';
import { Trash2, X, Sparkles, Variable, HelpCircle } from 'lucide-react';
import { useWorkflowStore } from '../../store/workflowStore.js';

export default function NodeConfigPanel() {
  const { selectedNodeId, getSelectedNode, updateNodeData, deleteNode, setSelectedNodeId } = useWorkflowStore();
  const selectedNode = getSelectedNode();

  if (!selectedNode) return null;

  const { id, type, data = {} } = selectedNode;
  const config = data.config || {};

  const handleFieldChange = (field, value) => {
    updateNodeData(id, {
      config: {
        ...config,
        [field]: value,
      },
    });
  };

  const handleLabelChange = (e) => {
    updateNodeData(id, { label: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    updateNodeData(id, { description: e.target.value });
  };

  return (
    <div className="w-80 bg-[#0c1220] border-l border-slate-800/80 flex flex-col h-full z-10 animate-in slide-in-from-right-4 duration-150">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">
            CONFIGURATION
          </span>
          <h3 className="font-bold text-sm text-slate-100 truncate max-w-[170px]">
            {data.label || 'Node Properties'}
          </h3>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => deleteNode(id)}
            title="Delete Node"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSelectedNodeId(null)}
            title="Close Panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Label & Description */}
        <div className="space-y-3 pb-3 border-b border-slate-800/60">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Step Label</label>
            <input
              type="text"
              value={data.label || ''}
              onChange={handleLabelChange}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-medium mb-1">Description</label>
            <input
              type="text"
              value={data.description || ''}
              onChange={handleDescriptionChange}
              placeholder="What does this step do?"
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Dynamic Config by Node Type */}

        {/* 1. AI Node Config */}
        {(type === 'aiNode' || data.category === 'ai') && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">AI Model Engine</label>
              <select
                value={data.model || 'gemini-1.5-flash'}
                onChange={(e) => updateNodeData(id, { model: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
              >
                <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Fast)</option>
                <option value="openrouter/anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Deep Reasoning)</option>
                <option value="openrouter/meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (OpenRouter)</option>
                <option value="deterministic-agentic-model">Deterministic Rule Model</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">Prompt Template</label>
                <span className="text-[10px] text-indigo-400 flex items-center space-x-1">
                  <Variable className="w-3 h-3" />
                  <span>Supports {'{{...}}'}</span>
                </span>
              </div>
              <textarea
                rows={5}
                value={config.prompt || ''}
                onChange={(e) => handleFieldChange('prompt', e.target.value)}
                placeholder="Analyze {{steps.trigger.data.message}} and extract priority score..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* 2. Integration Node Config */}
        {(type === 'integrationNode' || data.category === 'integration') && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Provider</label>
              <select
                value={data.provider || 'slack'}
                onChange={(e) => updateNodeData(id, { provider: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500 font-mono uppercase"
              >
                <option value="gmail">Gmail</option>
                <option value="slack">Slack</option>
                <option value="discord">Discord</option>
                <option value="google-sheets">Google Sheets</option>
              </select>
            </div>

            {/* Provider specific inputs */}
            {data.provider === 'gmail' && (
              <>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Recipient Email (To)</label>
                  <input
                    type="text"
                    value={config.to || ''}
                    onChange={(e) => handleFieldChange('to', e.target.value)}
                    placeholder="user@example.com or {{steps.lead.data.email}}"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Subject</label>
                  <input
                    type="text"
                    value={config.subject || ''}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    placeholder="Important Update"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Body</label>
                  <textarea
                    rows={4}
                    value={config.body || ''}
                    onChange={(e) => handleFieldChange('body', e.target.value)}
                    placeholder="Hello, {{steps.ai.output.emailDraft}}"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </>
            )}

            {data.provider === 'slack' && (
              <>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Channel</label>
                  <input
                    type="text"
                    value={config.channel || '#general'}
                    onChange={(e) => handleFieldChange('channel', e.target.value)}
                    placeholder="#general or #alerts"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Message Text</label>
                  <textarea
                    rows={4}
                    value={config.message || ''}
                    onChange={(e) => handleFieldChange('message', e.target.value)}
                    placeholder="🚀 Alert: {{steps.ai.output.summary}}"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </>
            )}

            {data.provider === 'discord' && (
              <>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Discord Channel ID / Webhook</label>
                  <input
                    type="text"
                    value={config.channelId || config.webhookUrl || ''}
                    onChange={(e) => handleFieldChange('channelId', e.target.value)}
                    placeholder="123456789012345678"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    value={config.content || ''}
                    onChange={(e) => handleFieldChange('content', e.target.value)}
                    placeholder="🔔 Community Alert: {{steps.ai.output.result}}"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </>
            )}

            {data.provider === 'google-sheets' && (
              <>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Spreadsheet ID</label>
                  <input
                    type="text"
                    value={config.spreadsheetId || ''}
                    onChange={(e) => handleFieldChange('spreadsheetId', e.target.value)}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Target Range</label>
                  <input
                    type="text"
                    value={config.range || 'Sheet1!A1'}
                    onChange={(e) => handleFieldChange('range', e.target.value)}
                    placeholder="Sheet1!A1"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. Condition Node Config */}
        {(type === 'conditionNode' || data.category === 'logic') && (
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Field Path</label>
              <input
                type="text"
                value={config.field || ''}
                onChange={(e) => handleFieldChange('field', e.target.value)}
                placeholder="{{steps.ai.output.priority}}"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => handleFieldChange('operator', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200"
              >
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="contains">Contains</option>
                <option value="greater_than">Greater Than</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-medium mb-1">Target Value</label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => handleFieldChange('value', e.target.value)}
                placeholder="HIGH"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono"
              />
            </div>
          </div>
        )}

        {/* Variable Helper Callout */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 mt-4">
          <div className="flex items-center space-x-1 text-slate-300 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interpolation Variables</span>
          </div>
          <p>Reference previous outputs dynamically:</p>
          <code className="text-cyan-300 font-mono text-[10px] block">
            {'{{steps.<node-id>.output.<field>}}'}
          </code>
        </div>
      </div>
    </div>
  );
}
