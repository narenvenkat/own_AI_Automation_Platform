import * as integrationService from '../services/integrationService.js';
import { env } from '../config/env.js';

export const listIntegrations = async (req, res, next) => {
  try {
    const list = await integrationService.getUserIntegrations(req.user._id);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (req, res, next) => {
  try {
    const list = await integrationService.getUserIntegrations(req.user._id);
    const health = {};

    for (const item of list) {
      if (['gmail', 'slack', 'discord', 'google-sheets'].includes(item.provider)) {
        try {
          const provider = integrationService.getProvider(item.provider);
          const creds = await integrationService.getDecryptedCredentials(req.user._id, item.provider);
          const check = await provider.testConnection(creds);
          health[item.provider] = check;
        } catch (e) {
          health[item.provider] = { isHealthy: false, message: e.message };
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};

export const startOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const providerInstance = integrationService.getProvider(provider);
    const state = JSON.stringify({ userId: req.user._id.toString(), provider, timestamp: Date.now() });
    const encodedState = Buffer.from(state).toString('base64');
    const authUrl = providerInstance.getAuthUrl(encodedState);

    return res.status(200).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const handleOAuthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(error)}`);
    }

    let userId = req.user?._id;
    if (!userId && state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        userId = decoded.userId;
      } catch (e) {
        console.warn('[OAuth] State decode warning:', e.message);
      }
    }

    if (!userId) {
      return res.redirect(`${env.CLIENT_URL}/integrations?error=SESSION_EXPIRED`);
    }

    const providerInstance = integrationService.getProvider(provider);
    const tokenResult = await providerInstance.handleCallback(code);

    await integrationService.saveIntegration(userId, provider, {
      credentials: tokenResult,
      accountName: tokenResult.accountName || provider,
      accountEmail: tokenResult.accountEmail || '',
      scopes: tokenResult.scopes || [],
      metadata: tokenResult.metadata || {},
    });

    return res.redirect(`${env.CLIENT_URL}/integrations?connected=${provider}`);
  } catch (error) {
    return res.redirect(`${env.CLIENT_URL}/integrations?error=${encodeURIComponent(error.message)}`);
  }
};

export const saveManualIntegration = async (req, res, next) => {
  try {
    const { provider, credentials, accountName, accountEmail } = req.body;
    if (!provider || !credentials) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Provider and credentials are required.' },
      });
    }

    const result = await integrationService.saveIntegration(req.user._id, provider, {
      credentials,
      accountName: accountName || provider,
      accountEmail,
    });

    return res.status(200).json({
      success: true,
      message: `${provider} integration saved successfully.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const disconnect = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const result = await integrationService.disconnectIntegration(req.user._id, provider);
    return res.status(200).json({
      success: true,
      message: `${provider} disconnected.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const testAction = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { action, params } = req.body;
    const result = await integrationService.executeIntegrationAction(req.user._id, provider, action, params);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
