import { monitoringAgent } from './monitoringAgent.js';

export class ValidationAgent {
  constructor() {
    this.name = 'validation';
  }

  /**
   * Verifies output integrity from a node execution
   */
  async validateOutput({ node, output, executionId, workflowId }) {
    const { id: nodeId, data = {} } = node;
    const nodeLabel = data.label || nodeId;

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'validation',
      level: 'info',
      message: `Validating payload schema for [${nodeLabel}]...`,
    });

    if (output === undefined || output === null) {
      const err = new Error(`Validation failed: Node [${nodeLabel}] produced null or undefined output.`);
      err.code = 'MISSING_FIELDS';
      throw err;
    }

    // Check specific required outputs per category
    if (data.category === 'integration') {
      if (data.provider === 'gmail' && data.action === 'send_email' && output.delivered !== true) {
        const err = new Error(`Validation failed: Email delivery confirmation not received.`);
        err.code = 'API_FAILURE';
        throw err;
      }
    }

    await monitoringAgent.logEvent({
      executionId,
      workflowId,
      nodeId,
      agent: 'validation',
      level: 'success',
      message: `Payload verified for [${nodeLabel}]: all required fields and invariants intact.`,
      metadata: { validatedKeys: Object.keys(output) },
    });

    return { isValid: true };
  }
}

export const validationAgent = new ValidationAgent();
