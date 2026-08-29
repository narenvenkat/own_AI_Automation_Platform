import * as workflowService from '../services/workflowService.js';

export const listWorkflows = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await workflowService.listWorkflows(req.user._id, { page, limit, search, status });
    return res.status(200).json({
      success: true,
      data: result.workflows,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await workflowService.getWorkflowDashboardStats(req.user._id);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const createWorkflow = async (req, res, next) => {
  try {
    const workflow = await workflowService.createWorkflow(req.user._id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Workflow created successfully.',
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

export const generateWorkflow = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    const result = await workflowService.generateWorkflow(req.user._id, prompt);
    return res.status(201).json({
      success: true,
      message: 'Workflow graph generated successfully from prompt.',
      data: result.workflow,
      generator: result.generator,
    });
  } catch (error) {
    next(error);
  }
};

export const getWorkflowById = async (req, res, next) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    next(error);
  }
};

export const updateWorkflow = async (req, res, next) => {
  try {
    const updated = await workflowService.updateWorkflow(req.user._id, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Workflow updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const duplicateWorkflow = async (req, res, next) => {
  try {
    const clone = await workflowService.duplicateWorkflow(req.user._id, req.params.id);
    return res.status(201).json({
      success: true,
      message: 'Workflow duplicated successfully.',
      data: clone,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteWorkflow = async (req, res, next) => {
  try {
    const result = await workflowService.deleteWorkflow(req.user._id, req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Workflow deleted successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const executeWorkflow = async (req, res, next) => {
  try {
    const { inputs } = req.body || {};
    const result = await workflowService.executeWorkflow(req.user._id, req.params.id, inputs);
    return res.status(200).json({
      success: true,
      message: 'Workflow execution triggered.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
