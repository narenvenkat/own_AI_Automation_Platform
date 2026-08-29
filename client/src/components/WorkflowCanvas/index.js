import React, { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
} from '@xyflow/react';
import { useWorkflowStore } from '../../store/workflowStore.js';

import TriggerNode from './TriggerNode.js';
import AiNode from './AiNode.js';
import IntegrationNode from './IntegrationNode.js';
import ConditionNode from './ConditionNode.js';
import OutputNode from './OutputNode.js';

export default function WorkflowCanvas({ onDropNode, readOnly = false }) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
  } = useWorkflowStore();

  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      aiNode: AiNode,
      integrationNode: IntegrationNode,
      conditionNode: ConditionNode,
      outputNode: OutputNode,
    }),
    []
  );

  const onNodeClick = useCallback(
    (event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const nodeType = event.dataTransfer.getData('application/reactflow/type');
      const nodeDataRaw = event.dataTransfer.getData('application/reactflow/data');

      if (!nodeType) return;

      let customData = {};
      try {
        if (nodeDataRaw) customData = JSON.parse(nodeDataRaw);
      } catch (e) {}

      // Get drop position in canvas bounds
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 40,
      };

      if (onDropNode) {
        onDropNode(nodeType, position, customData);
      }
    },
    [onDropNode]
  );

  return (
    <div className="w-full h-full relative bg-[#090d16]" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="rgba(255, 255, 255, 0.08)"
        />
        <Controls position="bottom-left" showInteractive={!readOnly} />
        <MiniMap
          nodeColor={(n) => {
            if (n.type === 'triggerNode') return '#06b6d4';
            if (n.type === 'aiNode') return '#8b5cf6';
            if (n.type === 'integrationNode') return '#f59e0b';
            if (n.type === 'conditionNode') return '#eab308';
            return '#10b981';
          }}
          maskColor="rgba(9, 13, 22, 0.7)"
          position="bottom-right"
        />
      </ReactFlow>
    </div>
  );
}
