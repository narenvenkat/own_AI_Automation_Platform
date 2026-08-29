import { Workflow } from '../models/Workflow.js';
import { Execution } from '../models/Execution.js';
import { generateWorkflowFromPrompt } from './aiService.js';
import { queueExecution } from '../queues/executionQueue.js';

export const listWorkflows = async (userId, { page = 1, limit = 10, search = '', status = '' }) => {
  const query = { owner: userId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [workflows, total] = await Promise.all([
    Workflow.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
    Workflow.countDocuments(query),
  ]);

  return {
    workflows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getWorkflowDashboardStats = async (userId) => {
  const [
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    completedExecutions,
    failedExecutions,
    recentExecutions,
    recentWorkflows,
  ] = await Promise.all([
    Workflow.countDocuments({ owner: userId }),
    Workflow.countDocuments({ owner: userId, status: 'active' }),
    Execution.countDocuments({ triggeredBy: userId }),
    Execution.countDocuments({ triggeredBy: userId, status: 'COMPLETED' }),
    Execution.countDocuments({ triggeredBy: userId, status: 'FAILED' }),
    Execution.find({ triggeredBy: userId }).sort({ createdAt: -1 }).limit(5).populate('workflowId', 'name'),
    Workflow.find({ owner: userId }).sort({ updatedAt: -1 }).limit(5),
  ]);

  const successRate = totalExecutions > 0 ? ((completedExecutions / totalExecutions) * 100).toFixed(1) : '100.0';

  return {
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    completedExecutions,
    failedExecutions,
    successRate: parseFloat(successRate),
    recentExecutions,
    recentWorkflows,
  };
};

export const createWorkflow = async (userId, data) => {
  const workflow = await Workflow.create({
    name: data.name || 'Untitled Automation',
    description: data.description || '',
    owner: userId,
    status: data.status || 'draft',
    triggerConfig: data.triggerConfig || { type: 'manual' },
    nodes: data.nodes || [],
    edges: data.edges || [],
    tags: data.tags || ['Custom'],
    version: 1,
  });
  return workflow;
};

export const generateWorkflow = async (userId, prompt) => {
  const generated = await generateWorkflowFromPrompt(prompt);
  const workflow = await Workflow.create({
    name: generated.name || 'AI Generated Automation',
    description: generated.description || prompt,
    owner: userId,
    status: 'draft',
    triggerConfig: generated.triggerConfig || { type: 'manual' },
    nodes: generated.nodes || [],
    edges: generated.edges || [],
    tags: generated.tags || ['AI-Generated'],
    version: 1,
  });
  return { workflow, generator: generated.generator };
};

export const getWorkflowById = async (userId, workflowId) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) {
    const error = new Error('Workflow not found');
    error.statusCode = 404;
    error.code = 'WORKFLOW_NOT_FOUND';
    throw error;
  }
  return workflow;
};

export const updateWorkflow = async (userId, workflowId, updateData) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) {
    const error = new Error('Workflow not found');
    error.statusCode = 404;
    error.code = 'WORKFLOW_NOT_FOUND';
    throw error;
  }

  if (updateData.name) workflow.name = updateData.name;
  if (updateData.description !== undefined) workflow.description = updateData.description;
  if (updateData.status) workflow.status = updateData.status;
  if (updateData.triggerConfig) workflow.triggerConfig = updateData.triggerConfig;
  if (updateData.nodes) workflow.nodes = updateData.nodes;
  if (updateData.edges) workflow.edges = updateData.edges;
  if (updateData.tags) workflow.tags = updateData.tags;
  workflow.version = (workflow.version || 1) + 1;

  await workflow.save();
  return workflow;
};

export const duplicateWorkflow = async (userId, workflowId) => {
  const original = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!original) {
    const error = new Error('Workflow not found');
    error.statusCode = 404;
    error.code = 'WORKFLOW_NOT_FOUND';
    throw error;
  }

  const clone = await Workflow.create({
    name: `${original.name} (Copy)`,
    description: original.description,
    owner: userId,
    status: 'draft',
    triggerConfig: original.triggerConfig,
    nodes: original.nodes,
    edges: original.edges,
    tags: [...original.tags, 'Cloned'],
    version: 1,
  });

  return clone;
};

export const deleteWorkflow = async (userId, workflowId) => {
  const deleted = await Workflow.findOneAndDelete({ _id: workflowId, owner: userId });
  if (!deleted) {
    const error = new Error('Workflow not found');
    error.statusCode = 404;
    error.code = 'WORKFLOW_NOT_FOUND';
    throw error;
  }
  return { id: workflowId, deleted: true };
};

export const executeWorkflow = async (userId, workflowId, inputs = {}) => {
  const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
  if (!workflow) {
    const error = new Error('Workflow not found');
    error.statusCode = 404;
    error.code = 'WORKFLOW_NOT_FOUND';
    throw error;
  }

  // Create runtime execution document with snapshot
  const execution = await Execution.create({
    workflowId: workflow._id,
    workflowSnapshot: workflow.toObject(),
    status: 'PENDING',
    inputs,
    triggeredBy: userId,
    langGraphStatus: 'available',
  });

  // Queue execution
  const queueResult = await queueExecution({
    executionId: execution._id,
    workflow: workflow.toObject(),
    userId,
    inputs,
  });

  return {
    executionId: execution._id,
    status: execution.status,
    queueResult,
  };
};
