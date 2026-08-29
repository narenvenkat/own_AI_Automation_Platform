import express from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  return res.status(200).json({
    success: true,
    platform: 'Agentic AI Automation Platform (Agentflow_AI)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy',
    environment: env.NODE_ENV,
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'in-memory',
    },
    orchestration: {
      langGraph: 'available',
      agents: ['planner', 'execution', 'validation', 'recovery', 'monitoring'],
    },
    providers: {
      openRouter: Boolean(env.OPENROUTER_API_KEY),
      gemini: Boolean(env.GEMINI_API_KEY),
      gmail: Boolean(env.GMAIL.CLIENT_ID),
      slack: Boolean(env.SLACK.CLIENT_ID),
      discord: Boolean(env.DISCORD.CLIENT_ID || env.DISCORD.BOT_TOKEN),
      googleSheets: Boolean(env.GOOGLE_SHEETS.CLIENT_ID),
    },
  });
});

export default router;
