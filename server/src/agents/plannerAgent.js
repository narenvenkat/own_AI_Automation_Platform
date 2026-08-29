import { AgentMemory } from '../models/AgentMemory.js';
import { monitoringAgent } from './monitoringAgent.js';

export class PlannerAgent {
  constructor() {
    this.name = 'planner';
  }

  /**
   * Plans the execution order of nodes using topological sorting
   * @param {object} workflowSnapshot 
   * @param {string} executionId 
   * @returns {Promise<{ plan: Array<{ nodeId: string, node: object, dependencies: string[] }>, confidenceScore: number }>}
   */
  async createPlan(workflowSnapshot, executionId) {
    const { nodes = [], edges = [], _id: workflowId } = workflowSnapshot;

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'info',
      message: `Analyzing graph topology with ${nodes.length} nodes and ${edges.length} edges...`,
    });

    if (nodes.length === 0) {
      throw new Error('PlannerAgent: Cannot execute empty workflow with 0 nodes.');
    }

    // Build Adjacency List and In-Degree Map
    const inDegree = {};
    const adjList = {};
    const nodeMap = {};

    nodes.forEach((node) => {
      inDegree[node.id] = 0;
      adjList[node.id] = [];
      nodeMap[node.id] = node;
    });

    edges.forEach((edge) => {
      if (adjList[edge.source] && inDegree[edge.target] !== undefined) {
        adjList[edge.source].push(edge.target);
        inDegree[edge.target] = (inDegree[edge.target] || 0) + 1;
      }
    });

    // Kahn's Algorithm for Topological Sort
    const queue = [];
    nodes.forEach((node) => {
      if (inDegree[node.id] === 0) {
        queue.push(node.id);
      }
    });

    const orderedNodeIds = [];
    const inDegreeCopy = { ...inDegree };

    while (queue.length > 0) {
      const u = queue.shift();
      orderedNodeIds.push(u);

      for (const v of adjList[u] || []) {
        inDegreeCopy[v]--;
        if (inDegreeCopy[v] === 0) {
          queue.push(v);
        }
      }
    }

    // Check for cycles
    if (orderedNodeIds.length !== nodes.length) {
      // Find remaining nodes that couldn't be resolved
      const unreached = nodes.filter((n) => !orderedNodeIds.includes(n.id)).map((n) => n.id);
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        agent: 'planner',
        level: 'warning',
        message: `Cycle or unreachable branch detected in nodes: ${unreached.join(', ')}. Resolving linear order.`,
      });
      // Append unreached gracefully
      unreached.forEach((id) => orderedNodeIds.push(id));
    }

    // Formulate structured execution plan
    const plan = orderedNodeIds.map((nodeId) => {
      const node = nodeMap[nodeId];
      const incomingEdges = edges.filter((e) => e.target === nodeId);
      const dependencies = incomingEdges.map((e) => e.source);
      return {
        nodeId,
        node,
        dependencies,
      };
    });

    // Compute Confidence Score based on graph integrity
    let confidenceScore = 1.0;
    if (orderedNodeIds.length !== nodes.length) confidenceScore -= 0.15;
    if (edges.length === 0 && nodes.length > 1) confidenceScore -= 0.2;

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      agent: 'planner',
      level: 'success',
      message: `Plan generated successfully: ${orderedNodeIds.length} steps sequenced with ${(confidenceScore * 100).toFixed(0)}% confidence score.`,
      metadata: { sequence: orderedNodeIds, confidenceScore },
    });

    // Save planner memory
    try {
      await AgentMemory.create({
        workflowId,
        executionId,
        agentId: 'planner',
        key: 'execution_plan',
        value: { plan, sequence: orderedNodeIds },
        confidenceScore,
      });
    } catch (e) {
      // ignore memory insert error
    }

    return { plan, confidenceScore };
  }
}

export const plannerAgent = new PlannerAgent();
