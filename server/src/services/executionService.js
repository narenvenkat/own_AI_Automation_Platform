import { Execution } from '../models/Execution.js';
import { ExecutionLog } from '../models/ExecutionLog.js';
import { orchestrator } from '../agents/orchestrator.js';

export const listExecutions = async (userId, { page = 1, limit = 15, status = '', workflowId = '' }) => {
  const query = { triggeredBy: userId };

  if (status && status !== 'all') {
    query.status = status;
  }

  if (workflowId) {
    query.workflowId = workflowId;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [executions, total] = await Promise.all([
    Execution.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('workflowId', 'name description tags'),
    Execution.countDocuments(query),
  ]);

  return {
    executions,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

export const getExecutionById = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, triggeredBy: userId }).populate('workflowId', 'name description tags nodes edges');
  if (!execution) {
    const error = new Error('Execution not found');
    error.statusCode = 404;
    error.code = 'EXECUTION_NOT_FOUND';
    throw error;
  }
  return execution;
};

export const getExecutionTimeline = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, triggeredBy: userId });
  if (!execution) {
    const error = new Error('Execution not found');
    error.statusCode = 404;
    error.code = 'EXECUTION_NOT_FOUND';
    throw error;
  }

  const logs = await ExecutionLog.find({ executionId }).sort({ timestamp: 1 });
  return logs;
};

export const pauseExecution = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, triggeredBy: userId });
  if (!execution) {
    const error = new Error('Execution not found');
    error.statusCode = 404;
    error.code = 'EXECUTION_NOT_FOUND';
    throw error;
  }

  const paused = orchestrator.pauseExecution(executionId);
  if (paused) {
    execution.status = 'PAUSED';
    await execution.save();
  }

  return { executionId, status: 'PAUSED', paused };
};

export const resumeExecution = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, triggeredBy: userId });
  if (!execution) {
    const error = new Error('Execution not found');
    error.statusCode = 404;
    error.code = 'EXECUTION_NOT_FOUND';
    throw error;
  }

  const resumed = orchestrator.resumeExecution(executionId);
  if (resumed) {
    execution.status = 'RUNNING';
    await execution.save();
  }

  return { executionId, status: 'RUNNING', resumed };
};

export const cancelExecution = async (userId, executionId) => {
  const execution = await Execution.findOne({ _id: executionId, triggeredBy: userId });
  if (!execution) {
    const error = new Error('Execution not found');
    error.statusCode = 404;
    error.code = 'EXECUTION_NOT_FOUND';
    throw error;
  }

  const cancelled = orchestrator.cancelExecution(executionId);
  if (cancelled) {
    execution.status = 'CANCELLED';
    await execution.save();
  }

  return { executionId, status: 'CANCELLED', cancelled };
};
