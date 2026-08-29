import { ExecutionLog } from '../models/ExecutionLog.js';
import { emitExecutionEvent } from '../config/socket.js';

export class MonitoringAgent {
  constructor() {
    this.name = 'monitoring';
  }

  /**
   * Log an event, broadcast via Socket.IO, and persist to MongoDB
   */
  async logEvent({ executionId, workflowId, nodeId = null, agent, level = 'info', message, metadata = {} }) {
    const timestamp = new Date();
    
    // Broadcast live event immediately to connected browser client
    emitExecutionEvent(executionId, 'execution:log', {
      executionId,
      workflowId,
      nodeId,
      agent,
      level,
      message,
      metadata,
      timestamp,
    });

    // Also persist log to database
    try {
      const logEntry = await ExecutionLog.create({
        executionId,
        workflowId,
        nodeId,
        agent,
        level,
        message,
        metadata,
        timestamp,
      });
      return logEntry;
    } catch (err) {
      console.error('[MonitoringAgent] Failed to persist log entry:', err.message);
      return null;
    }
  }

  async emitNodeStatus(executionId, nodeId, status, data = {}) {
    emitExecutionEvent(executionId, 'execution:node_status', {
      executionId,
      nodeId,
      status, // 'running', 'completed', 'failed', 'retrying'
      data,
      timestamp: new Date(),
    });
  }

  async emitExecutionStatus(executionId, status, details = {}) {
    emitExecutionEvent(executionId, 'execution:status_change', {
      executionId,
      status,
      details,
      timestamp: new Date(),
    });
  }
}

export const monitoringAgent = new MonitoringAgent();
