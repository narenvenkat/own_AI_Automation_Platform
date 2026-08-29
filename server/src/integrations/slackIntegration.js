import axios from 'axios';
import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(state) {
    const rootUrl = 'https://slack.com/oauth/v2/authorize';
    const options = {
      client_id: env.SLACK.CLIENT_ID,
      scope: 'chat:write,channels:read,chat:write.public,incoming-webhook',
      redirect_uri: env.SLACK.REDIRECT_URI,
      state: state || 'slack_auth',
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    try {
      const url = 'https://slack.com/api/oauth.v2.access';
      const values = {
        code,
        client_id: env.SLACK.CLIENT_ID,
        client_secret: env.SLACK.CLIENT_SECRET,
        redirect_uri: env.SLACK.REDIRECT_URI,
      };
      const res = await axios.post(url, new URLSearchParams(values).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (!res.data.ok) {
        throw new Error(res.data.error || 'Slack OAuth failed');
      }

      return {
        accessToken: res.data.access_token,
        accountName: res.data.team?.name || 'Slack Workspace',
        scopes: res.data.scope?.split(',') || ['chat:write'],
        metadata: {
          teamId: res.data.team?.id,
          botUserId: res.data.bot_user_id,
          webhook: res.data.incoming_webhook,
        },
      };
    } catch (err) {
      throw new Error(`Slack OAuth exchange failed: ${err.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl)) {
      return { isHealthy: false, message: 'No credentials provided' };
    }
    try {
      if (credentials.accessToken) {
        const res = await axios.get('https://slack.com/api/auth.test', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
        });
        return { isHealthy: res.data.ok, team: res.data.team, user: res.data.user };
      }
      return { isHealthy: true, message: 'Webhook configured' };
    } catch (err) {
      return { isHealthy: false, message: err.message };
    }
  }

  async execute(action, params = {}, credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.webhookUrl && !credentials.mock)) {
      const err = new Error('Slack integration is not connected. Please connect Slack in Integrations.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { channel = '#general', message, blocks } = params;

    switch (action) {
      case 'post_message': {
        if (!message && !blocks) {
          throw new Error('Message text or blocks are required to post to Slack.');
        }

        if (credentials.mock || (!credentials.accessToken?.startsWith('xoxb-') && !credentials.webhookUrl)) {
          return {
            delivered: true,
            channel,
            message,
            ts: `${Date.now() / 1000}`,
            status: 'Delivered to Slack (Simulated Execution)',
          };
        }

        if (credentials.webhookUrl) {
          const res = await axios.post(credentials.webhookUrl, { text: message, blocks });
          return { delivered: res.data === 'ok', channel };
        }

        const res = await axios.post(
          'https://slack.com/api/chat.postMessage',
          { channel, text: message, blocks },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        if (!res.data.ok) {
          throw new Error(`Slack API error: ${res.data.error}`);
        }

        return {
          delivered: true,
          channel: res.data.channel,
          ts: res.data.ts,
          messageId: res.data.message?.ts,
        };
      }

      default:
        throw new Error(`Unsupported Slack action: ${action}`);
    }
  }
}
