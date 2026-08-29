import axios from 'axios';
import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(state) {
    const rootUrl = 'https://discord.com/api/oauth2/authorize';
    const options = {
      client_id: env.DISCORD.CLIENT_ID,
      permissions: '2048', // SEND_MESSAGES
      scope: 'bot applications.commands identify',
      redirect_uri: env.DISCORD.REDIRECT_URI,
      response_type: 'code',
      state: state || 'discord_auth',
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    try {
      const url = 'https://discord.com/api/oauth2/token';
      const values = {
        client_id: env.DISCORD.CLIENT_ID,
        client_secret: env.DISCORD.CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: env.DISCORD.REDIRECT_URI,
      };
      const res = await axios.post(url, new URLSearchParams(values).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in, guild } = res.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        accountName: guild?.name || 'Discord Guild',
        scopes: ['bot', 'identify'],
        metadata: {
          guildId: guild?.id,
        },
      };
    } catch (err) {
      throw new Error(`Discord OAuth exchange failed: ${err.message}`);
    }
  }

  async testConnection(credentials) {
    const token = credentials?.botToken || env.DISCORD.BOT_TOKEN || credentials?.accessToken;
    if (!token && !credentials?.webhookUrl) {
      return { isHealthy: false, message: 'No Discord bot token or webhook provided' };
    }
    try {
      if (token) {
        const res = await axios.get('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bot ${token}` },
        });
        return { isHealthy: true, username: res.data.username };
      }
      return { isHealthy: true, message: 'Discord webhook configured' };
    } catch (err) {
      return { isHealthy: false, message: err.message };
    }
  }

  async execute(action, params = {}, credentials) {
    const token = credentials?.botToken || env.DISCORD.BOT_TOKEN || credentials?.accessToken;
    const webhookUrl = credentials?.webhookUrl || params.webhookUrl;

    if (!token && !webhookUrl && !credentials?.mock) {
      const err = new Error('Discord integration is not configured. Set Bot Token or Webhook in Integrations.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { channelId, content, embeds } = params;

    switch (action) {
      case 'post_message': {
        if (!content && !embeds) {
          throw new Error('Message content or embeds are required to send Discord message.');
        }

        if (credentials?.mock || (!token && !webhookUrl)) {
          return {
            delivered: true,
            channelId: channelId || 'simulated-channel',
            content,
            status: 'Delivered to Discord (Simulated Execution)',
            timestamp: new Date().toISOString(),
          };
        }

        if (webhookUrl) {
          const res = await axios.post(webhookUrl, {
            content,
            embeds: embeds || [],
          });
          return { delivered: true, status: 'Sent via Discord Webhook' };
        }

        if (!channelId) {
          throw new Error('channelId is required to post message using Discord Bot');
        }

        const res = await axios.post(
          `https://discord.com/api/v10/channels/${channelId}/messages`,
          { content, embeds },
          { headers: { Authorization: `Bot ${token}` } }
        );

        return {
          delivered: true,
          id: res.data.id,
          channelId: res.data.channel_id,
        };
      }

      default:
        throw new Error(`Unsupported Discord action: ${action}`);
    }
  }
}
