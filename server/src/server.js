import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { initExecutionQueue } from './queues/executionQueue.js';

const httpServer = http.createServer(app);

// Initialize real-time Socket.IO layer
initSocket(httpServer);

const startServer = async () => {
  try {
    // 1. Connect Database (with automatic in-memory fallback)
    await connectDB();

    // 2. Initialize Queue (with automatic in-memory runner fallback)
    initExecutionQueue();

    // 3. Start Listening
    httpServer.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Agentic AI Automation Platform (Agentflow_AI)`);
      console.log(`📡 Backend Server listening on http://localhost:${env.PORT}`);
      console.log(`🌐 Allowed Client Origin: ${env.CLIENT_URL}`);
      console.log(`🤖 Multi-Agent Chain: Planner -> Execution -> Validation -> Recovery -> Monitoring`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
};

startServer();
