import * as executionService from '../services/executionService.js';

export const listExecutions = async (req, res, next) => {
  try {
    const { page, limit, status, workflowId } = req.query;
    const result = await executionService.listExecutions(req.user._id, { page, limit, status, workflowId });
    return res.status(200).json({
      success: true,
      data: result.executions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionById = async (req, res, next) => {
  try {
    const execution = await executionService.getExecutionById(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      data: execution,
    });
  } catch (error) {
    next(error);
  }
};

export const getTimeline = async (req, res, next) => {
  try {
    const timeline = await executionService.getExecutionTimeline(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

export const pauseExecution = async (req, res, next) => {
  try {
    const result = await executionService.pauseExecution(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Execution paused.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resumeExecution = async (req, res, next) => {
  try {
    const result = await executionService.resumeExecution(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Execution resumed.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelExecution = async (req, res, next) => {
  try {
    const result = await executionService.cancelExecution(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Execution cancelled.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
