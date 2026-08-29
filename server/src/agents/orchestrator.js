import { Execution } from '../models/Execution.js';
import { Notification } from '../models/Notification.js';
import { plannerAgent } from './plannerAgent.js';
import { executionAgent } from './executionAgent.js';
import { validationAgent } from './validationAgent.js';
import { recoveryAgent } from './recoveryAgent.js';
import { monitoringAgent } from './monitoringAgent.js';
import { emitNotification } from '../config/socket.js';

// In-memory active execution state controllers (for pause/resume/cancel signals)
const activeRunControllers = new Map();

export class MultiAgentOrchestrator {
  constructor() {
    this.langGraphStatus = 'available';
  }

  /**
   * Register execution cancel / pause handler
   */
  registerController(executionId) {
    const controller = {
      isPaused: false,
      isCancelled: false,
      resumePromise: null,
      resumeResolver: null,
    };
    activeRunControllers.set(executionId.toString(), controller);
    return controller;
  }

  getController(executionId) {
    return activeRunControllers.get(executionId.toString());
  }

  pauseExecution(executionId) {
    const ctrl = this.getController(executionId);
    if (ctrl) {
      ctrl.isPaused = true;
      ctrl.resumePromise = new Promise((resolve) => {
        ctrl.resumeResolver = resolve;
      });
      return true;
    }
    return false;
  }

  resumeExecution(executionId) {
    const ctrl = this.getController(executionId);
    if (ctrl && ctrl.isPaused) {
      ctrl.isPaused = false;
      if (ctrl.resumeResolver) {
        ctrl.resumeResolver();
        ctrl.resumePromise = null;
        ctrl.resumeResolver = null;
      }
      return true;
    }
    return false;
  }

  cancelExecution(executionId) {
    const ctrl = this.getController(executionId);
    if (ctrl) {
      ctrl.isCancelled = true;
      if (ctrl.resumeResolver) {
        ctrl.resumeResolver();
      }
      return true;
    }
    return false;
  }

  /**
   * Main entry point to orchestrate a workflow run
   */
  async runWorkflow({ executionId, workflow, userId, initialInputs = {} }) {
    const startTime = Date.now();
    const execution = await Execution.findById(executionId);
    if (!execution) {
      throw new Error(`Execution record ${executionId} not found.`);
    }

    const controller = this.registerController(executionId);

    execution.status = 'RUNNING';
    execution.startTime = new Date(startTime);
    execution.langGraphStatus = this.langGraphStatus;
    await execution.save();

    await monitoringAgent.emitExecutionStatus(executionId, 'RUNNING', {
      langGraph: this.langGraphStatus,
      agentsChain: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
    });

    const workflowSnapshot = execution.workflowSnapshot || workflow;
    const executionContext = {
      inputs: initialInputs,
      steps: {},
      workflow: { id: workflowSnapshot._id, name: workflowSnapshot.name },
    };

    try {
      // 1. Plan Phase
      const { plan, confidenceScore } = await plannerAgent.createPlan(workflowSnapshot, executionId);

      // 2. Iterate through plan
      for (let i = 0; i < plan.length; i++) {
        // Check for cancellation
        if (controller.isCancelled) {
          execution.status = 'CANCELLED';
          execution.endTime = new Date();
          execution.duration = Date.now() - startTime;
          await execution.save();

          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflowSnapshot._id,
            agent: 'monitoring',
            level: 'warning',
            message: 'Execution was cancelled by operator.',
          });
          await monitoringAgent.emitExecutionStatus(executionId, 'CANCELLED');
          activeRunControllers.delete(executionId.toString());
          return execution;
        }

        // Check for pause
        if (controller.isPaused) {
          execution.status = 'PAUSED';
          await execution.save();
          await monitoringAgent.emitExecutionStatus(executionId, 'PAUSED');
          await monitoringAgent.logEvent({
            executionId,
            workflowId: workflowSnapshot._id,
            agent: 'monitoring',
            level: 'info',
            message: 'Execution paused. Awaiting operator resume signal...',
          });

          // Wait until resumed or cancelled
          if (controller.resumePromise) {
            await controller.resumePromise;
          }

          if (controller.isCancelled) {
            execution.status = 'CANCELLED';
            execution.endTime = new Date();
            execution.duration = Date.now() - startTime;
            await execution.save();
            await monitoringAgent.emitExecutionStatus(executionId, 'CANCELLED');
            activeRunControllers.delete(executionId.toString());
            return execution;
          }

          execution.status = 'RUNNING';
          await execution.save();
          await monitoringAgent.emitExecutionStatus(executionId, 'RUNNING');
        }

        const { nodeId, node } = plan[i];
        execution.currentNode = nodeId;
        await execution.save();

        let stepSuccess = false;
        let nodeRetryCount = 0;
        let stepOutput = null;

        while (!stepSuccess) {
          try {
            // Execution Agent Step
            stepOutput = await executionAgent.executeNode({
              node,
              executionId,
              workflowId: workflowSnapshot._id,
              userId,
              context: executionContext,
            });

            // Validation Agent Step
            await validationAgent.validateOutput({
              node,
              output: stepOutput,
              executionId,
              workflowId: workflowSnapshot._id,
            });

            // Record in context for downstream steps
            executionContext.steps[nodeId] = {
              status: 'COMPLETED',
              output: stepOutput,
            };

            stepSuccess = true;
          } catch (stepError) {
            // Recovery Agent Step
            const recoveryDecision = await recoveryAgent.handleFailure({
              error: stepError,
              node,
              executionId,
              workflowId: workflowSnapshot._id,
              retryCount: nodeRetryCount,
            });

            if (recoveryDecision.action === 'retry_with_backoff') {
              nodeRetryCount = recoveryDecision.nextRetryCount;
              execution.retryCount = (execution.retryCount || 0) + 1;
              execution.status = 'RETRYING';
              await execution.save();
              await monitoringAgent.emitExecutionStatus(executionId, 'RETRYING', {
                retryCount: nodeRetryCount,
                backoffMs: recoveryDecision.backoffMs,
              });

              // Wait backoff duration
              await new Promise((r) => setTimeout(r, recoveryDecision.backoffMs));
              execution.status = 'RUNNING';
              await execution.save();
            } else {
              // Escalate & Fail Execution
              execution.status = 'FAILED';
              execution.error = {
                message: stepError.message,
                code: stepError.code || 'STEP_FAILED',
                failedNode: nodeId,
                classification: recoveryDecision.classification,
              };
              execution.endTime = new Date();
              execution.duration = Date.now() - startTime;
              await execution.save();

              await monitoringAgent.emitExecutionStatus(executionId, 'FAILED', {
                error: execution.error,
              });

              // Push Escalation Notification
              const notif = await Notification.create({
                owner: userId,
                workflowId: workflowSnapshot._id,
                executionId,
                type: 'escalation',
                title: `Workflow Run Failed: ${workflowSnapshot.name}`,
                message: `Failed at step [${node.data?.label || nodeId}]: ${stepError.message}`,
              });
              emitNotification(userId, notif);

              activeRunControllers.delete(executionId.toString());
              return execution;
            }
          }
        }
      }

      // Workflow Completed Successfully
      execution.status = 'COMPLETED';
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;
      execution.outputs = executionContext.steps;
      execution.currentNode = null;
      await execution.save();

      await monitoringAgent.logEvent({
        executionId,
        workflowId: workflowSnapshot._id,
        agent: 'monitoring',
        level: 'success',
        message: `Workflow completed in ${(execution.duration / 1000).toFixed(2)}s across ${plan.length} steps.`,
        metadata: { totalDurationMs: execution.duration },
      });

      await monitoringAgent.emitExecutionStatus(executionId, 'COMPLETED', {
        duration: execution.duration,
        outputs: execution.outputs,
      });

      // Push Success Notification
      const notif = await Notification.create({
        owner: userId,
        workflowId: workflowSnapshot._id,
        executionId,
        type: 'success',
        title: `Workflow Run Succeeded`,
        message: `${workflowSnapshot.name} finished successfully in ${(execution.duration / 1000).toFixed(2)}s.`,
      });
      emitNotification(userId, notif);

      activeRunControllers.delete(executionId.toString());
      return execution;
    } catch (err) {
      console.error('[Orchestrator] Catastrophic failure:', err);
      execution.status = 'FAILED';
      execution.error = { message: err.message, stack: err.stack };
      execution.endTime = new Date();
      execution.duration = Date.now() - startTime;
      await execution.save();

      await monitoringAgent.emitExecutionStatus(executionId, 'FAILED', { error: execution.error });
      activeRunControllers.delete(executionId.toString());
      return execution;
    }
  }
}

export const orchestrator = new MultiAgentOrchestrator();
