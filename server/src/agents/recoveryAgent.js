import { monitoringAgent } from './monitoringAgent.js';

export class RecoveryAgent {
  constructor() {
    this.name = 'recovery';
    this.maxRetries = 3;
  }

  /**
   * Classifies error category
   * @param {Error} error
   * @returns {'MISSING_FIELDS' | 'API_FAILURE' | 'AUTH_EXPIRED' | 'RATE_LIMIT' | 'TRANSIENT'}
   */
  classifyError(error) {
    if (error.code === 'MISSING_FIELDS' || error.message?.includes('missing') || error.message?.includes('required')) {
      return 'MISSING_FIELDS';
    }
    if (error.code === 'AUTH_EXPIRED' || error.code === 'INTEGRATION_NOT_CONNECTED' || error.message?.includes('auth') || error.message?.includes('token')) {
      return 'AUTH_EXPIRED';
    }
    if (error.code === 'RATE_LIMIT' || error.message?.includes('rate limit') || error.message?.includes('429')) {
      return 'RATE_LIMIT';
    }
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.message?.includes('timeout') || error.message?.includes('socket')) {
      return 'TRANSIENT';
    }
    return 'API_FAILURE';
  }

  /**
   * Handles error event and decides whether to retry or escalate
   */
  async handleFailure({ error, node, executionId, workflowId, retryCount = 0 }) {
    const { id: nodeId, data = {} } = node || {};
    const classification = this.classifyError(error);

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'recovery',
      level: 'warning',
      message: `Diagnosed node failure: Category [${classification}] - ${error.message}`,
      metadata: { classification, retryCount, originalError: error.message },
    });

    // Unrecoverable errors -> Escalate immediately
    if (classification === 'AUTH_EXPIRED' || classification === 'MISSING_FIELDS') {
      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'recovery',
        level: 'error',
        message: `Escalating failure: [${classification}] requires operator intervention and cannot auto-recover.`,
        metadata: { action: 'escalate', reason: error.message },
      });
      return {
        action: 'escalate',
        classification,
        backoffMs: 0,
        reason: error.message,
      };
    }

    // Recoverable errors -> Check retry threshold
    if (retryCount < this.maxRetries) {
      // Exponential backoff formula: 2^retryCount * 1000ms
      const backoffMs = Math.pow(2, retryCount) * 1000;

      await monitoringAgent.logEvent({
        executionId,
        workflowId,
        nodeId,
        agent: 'recovery',
        level: 'info',
        message: `Attempting auto-recovery: Scheduling retry #${retryCount + 1}/${this.maxRetries} in ${backoffMs}ms with backoff...`,
        metadata: { action: 'retry_with_backoff', backoffMs, nextAttempt: retryCount + 1 },
      });

      return {
        action: 'retry_with_backoff',
        classification,
        backoffMs,
        nextRetryCount: retryCount + 1,
      };
    }

    // Max retries exceeded -> Escalate
    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'recovery',
      level: 'error',
      message: `Max retries (${this.maxRetries}) exceeded. Escalating run failure to operator alert drawer.`,
      metadata: { action: 'escalate', attempts: retryCount },
    });

    return {
      action: 'escalate',
      classification,
      backoffMs: 0,
      reason: `Exceeded maximum retry attempts (${this.maxRetries}).`,
    };
  }
}

export const recoveryAgent = new RecoveryAgent();
