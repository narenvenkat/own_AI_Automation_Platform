import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { orchestrator } from '../agents/orchestrator.js';

let redisClient = null;
let executionQueue = null;
let executionWorker = null;
let isInMemoryQueue = false;

export const initExecutionQueue = () => {
  try {
    if (env.USE_IN_MEMORY_QUEUE === 'true') {
      console.log('[Queue] Configured to use In-Memory Queue Runner.');
      isInMemoryQueue = true;
      return;
    }

    console.log(`[Queue] Attempting connection to Redis at: ${env.REDIS_URL}`);
    redisClient = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      connectTimeout: 2500,
      retryStrategy: (times) => {
        if (times > 2) {
          console.warn('[Queue] Redis unavailable. Falling back to In-Memory Queue.');
          isInMemoryQueue = true;
          return null; // Stop retrying
        }
        return 1000;
      },
    });

    redisClient.on('error', (err) => {
      if (!isInMemoryQueue) {
        console.warn(`[Queue] Redis connection issue (${err.message}). Using In-Memory queue fallback.`);
        isInMemoryQueue = true;
      }
    });

    redisClient.on('connect', () => {
      console.log('[Queue] Redis connected successfully. Initializing BullMQ execution queue...');
      executionQueue = new Queue('executionQueue', { connection: redisClient });

      executionWorker = new Worker(
        'executionQueue',
        async (job) => {
          const { executionId, workflow, userId, inputs } = job.data;
          console.log(`[Queue Worker] Processing background execution job ${job.id} for execution ${executionId}`);
          return orchestrator.runWorkflow({ executionId, workflow, userId, initialInputs: inputs });
        },
        { connection: redisClient }
      );

      executionWorker.on('completed', (job) => {
        console.log(`[Queue Worker] Job ${job.id} completed.`);
      });

      executionWorker.on('failed', (job, err) => {
        console.error(`[Queue Worker] Job ${job.id} failed:`, err.message);
      });
    });
  } catch (err) {
    console.warn('[Queue] BullMQ initialization fallback to In-Memory:', err.message);
    isInMemoryQueue = true;
  }
};

/**
 * Queue a workflow execution job
 */
export const queueExecution = async ({ executionId, workflow, userId, inputs = {} }) => {
  if (!isInMemoryQueue && executionQueue) {
    try {
      const job = await executionQueue.add('run-workflow', { executionId, workflow, userId, inputs });
      return { queued: true, jobId: job.id, mode: 'redis-bullmq' };
    } catch (e) {
      console.warn('[Queue] BullMQ push failed, running in-memory:', e.message);
    }
  }

  // In-Memory Asynchronous Job Runner
  console.log(`[Queue] Running execution ${executionId} via asynchronous In-Memory runner...`);
  setImmediate(async () => {
    try {
      await orchestrator.runWorkflow({ executionId, workflow, userId, initialInputs: inputs });
    } catch (err) {
      console.error(`[Queue] In-memory job execution error:`, err);
    }
  });

  return { queued: true, jobId: `mem_${Date.now()}`, mode: 'in-memory-runner' };
};
