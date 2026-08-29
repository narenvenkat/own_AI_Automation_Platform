import { Integration } from '../models/Integration.js';
import { GmailIntegration } from '../integrations/gmailIntegration.js';
import { SlackIntegration } from '../integrations/slackIntegration.js';
import { DiscordIntegration } from '../integrations/discordIntegration.js';
import { GoogleSheetsIntegration } from '../integrations/googleSheetsIntegration.js';
import { encryptCredential, decryptCredential } from './encryptionService.js';

// Provider Registry
const providers = {
  gmail: new GmailIntegration(),
  slack: new SlackIntegration(),
  discord: new DiscordIntegration(),
  'google-sheets': new GoogleSheetsIntegration(),
};

/**
 * Get provider instance by name
 */
export const getProvider = (providerName) => {
  const provider = providers[providerName];
  if (!provider) {
    throw new Error(`Unsupported integration provider: ${providerName}`);
  }
  return provider;
};

/**
 * List all integrations for a user with sanitized connection states
 */
export const getUserIntegrations = async (userId) => {
  const connectedIntegrations = await Integration.find({ owner: userId });
  const connectedMap = {};
  connectedIntegrations.forEach((intg) => {
    connectedMap[intg.provider] = intg;
  });

  const allSupported = ['gmail', 'slack', 'discord', 'google-sheets', 'openrouter', 'gemini'];

  return allSupported.map((provider) => {
    const existing = connectedMap[provider];
    return {
      provider,
      isConnected: Boolean(existing?.isConnected),
      accountName: existing?.accountName || null,
      accountEmail: existing?.accountEmail || null,
      scopes: existing?.scopes || [],
      expiresAt: existing?.expiresAt || null,
      updatedAt: existing?.updatedAt || null,
    };
  });
};

/**
 * Get decrypted credentials for an integration
 */
export const getDecryptedCredentials = async (userId, providerName) => {
  const integration = await Integration.findOne({ owner: userId, provider: providerName }).select('+encryptedData');
  if (!integration || !integration.isConnected) {
    return null;
  }
  if (integration.encryptedData) {
    return decryptCredential(integration.encryptedData);
  }
  return null;
};

/**
 * Save / update integration credentials securely
 */
export const saveIntegration = async (userId, providerName, { credentials, accountName, accountEmail, scopes = [], metadata = {} }) => {
  const encrypted = encryptCredential(credentials);

  const integration = await Integration.findOneAndUpdate(
    { owner: userId, provider: providerName },
    {
      isConnected: true,
      accountName: accountName || providerName,
      accountEmail: accountEmail || '',
      scopes,
      encryptedData: encrypted,
      expiresAt: credentials.expiresAt || null,
      metadata,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return {
    provider: integration.provider,
    isConnected: integration.isConnected,
    accountName: integration.accountName,
    accountEmail: integration.accountEmail,
  };
};

/**
 * Disconnect an integration
 */
export const disconnectIntegration = async (userId, providerName) => {
  await Integration.findOneAndUpdate(
    { owner: userId, provider: providerName },
    {
      isConnected: false,
      encryptedData: null,
      accountName: '',
      accountEmail: '',
    }
  );
  return { provider: providerName, isConnected: false };
};

/**
 * Executes a tool action through the integration layer
 */
export const executeIntegrationAction = async (userId, providerName, action, params = {}) => {
  const provider = getProvider(providerName);
  let credentials = await getDecryptedCredentials(userId, providerName);

  if (!credentials) {
    // If no real credentials, check if simulated mock execution can proceed
    credentials = { mock: true };
  }

  return provider.execute(action, params, credentials);
};
