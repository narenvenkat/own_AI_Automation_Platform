import { create } from 'zustand';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import api from '../services/api.js';

export const useWorkflowStore = create((set, get) => ({
  currentWorkflow: null,
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isSaving: false,
  isGenerating: false,
  isExecuting: false,
  nodeStatuses: {}, // { nodeId: 'running' | 'completed' | 'failed' | 'idle' }
  activeExecutionId: null,

  setWorkflow: (workflow) => {
    set({
      currentWorkflow: workflow,
      nodes: workflow?.nodes || [],
      edges: workflow?.edges || [],
      selectedNodeId: null,
      nodeStatuses: {},
      activeExecutionId: null,
    });
  },

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    });
  },

  setSelectedNodeId: (nodeId) => {
    set({ selectedNodeId: nodeId });
  },

  getSelectedNode: () => {
    const { nodes, selectedNodeId } = get();
    return nodes.find((n) => n.id === selectedNodeId) || null;
  },

  addNode: (nodeType, position = { x: 250, y: 150 }, customData = {}) => {
    const id = `node-${Date.now().toString().slice(-6)}`;
    const defaultLabels = {
      triggerNode: 'Webhook Trigger',
      aiNode: 'AI Prompt Processor',
      integrationNode: 'Third-Party Action',
      conditionNode: 'Branch Condition',
      outputNode: 'Workflow Output',
    };

    const newNode = {
      id,
      type: nodeType,
      position,
      data: {
        label: customData.label || defaultLabels[nodeType] || 'Custom Step',
        category: customData.category || nodeType.replace('Node', ''),
        provider: customData.provider || (nodeType === 'integrationNode' ? 'slack' : 'webhook'),
        description: customData.description || 'Configurable automation step',
        config: customData.config || {},
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id,
    });
    return newNode;
  },

  updateNodeData: (nodeId, newData) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
              config: {
                ...(node.data.config || {}),
                ...(newData.config || {}),
              },
            },
          };
        }
        return node;
      }),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  setNodeStatus: (nodeId, status) => {
    set({
      nodeStatuses: {
        ...get().nodeStatuses,
        [nodeId]: status,
      },
    });
  },

  resetNodeStatuses: () => {
    set({ nodeStatuses: {} });
  },

  saveWorkflow: async () => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow) return null;

    set({ isSaving: true });
    try {
      const payload = {
        name: currentWorkflow.name,
        description: currentWorkflow.description,
        status: currentWorkflow.status,
        triggerConfig: currentWorkflow.triggerConfig,
        tags: currentWorkflow.tags,
        nodes,
        edges,
      };

      let response;
      if (currentWorkflow._id) {
        response = await api.put(`/workflows/${currentWorkflow._id}`, payload);
      } else {
        response = await api.post('/workflows', payload);
      }

      const updated = response.data;
      set({ currentWorkflow: updated, isSaving: false });
      return { success: true, workflow: updated };
    } catch (err) {
      set({ isSaving: false });
      return { success: false, error: err.message || 'Failed to save workflow' };
    }
  },

  executeCurrentWorkflow: async (inputs = {}) => {
    const { currentWorkflow, nodes, edges } = get();
    if (!currentWorkflow?._id) {
      // Save first if not yet created
      await get().saveWorkflow();
    }

    set({ isExecuting: true, nodeStatuses: {} });
    try {
      const response = await api.post(`/workflows/${get().currentWorkflow._id}/execute`, { inputs });
      const { executionId } = response.data;
      set({ activeExecutionId: executionId, isExecuting: false });
      return { success: true, executionId };
    } catch (err) {
      set({ isExecuting: false });
      return { success: false, error: err.message || 'Execution trigger failed' };
    }
  },
}));
