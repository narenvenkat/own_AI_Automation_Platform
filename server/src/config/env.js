import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Database & Redis
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/agentflow_ai',
  USE_IN_MEMORY_DB: process.env.USE_IN_MEMORY_DB || 'auto',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  USE_IN_MEMORY_QUEUE: process.env.USE_IN_MEMORY_QUEUE || 'auto',
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_dev_agentflow_platform_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CREDENTIAL_ENCRYPTION_KEY: process.env.CREDENTIAL_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  
  // AI Keys
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  
  // Third-Party Integrations
  GMAIL: {
    CLIENT_ID: process.env.GMAIL_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET || '',
    REDIRECT_URI: process.env.GMAIL_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/gmail/callback',
  },
  SLACK: {
    CLIENT_ID: process.env.SLACK_CLIENT_ID || '',
    CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET || '',
    REDIRECT_URI: process.env.SLACK_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/slack/callback',
  },
  DISCORD: {
    CLIENT_ID: process.env.DISCORD_CLIENT_ID || '',
    CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET || '',
    BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || '',
    REDIRECT_URI: process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/discord/callback',
  },
  GOOGLE_SHEETS: {
    CLIENT_ID: process.env.GOOGLE_SHEETS_CLIENT_ID || '',
    CLIENT_SECRET: process.env.GOOGLE_SHEETS_CLIENT_SECRET || '',
    REDIRECT_URI: process.env.GOOGLE_SHEETS_REDIRECT_URI || 'http://localhost:5000/api/integrations/oauth/google-sheets/callback',
  }
};
