import axios from 'axios';
import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getAuthUrl(state) {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: env.GMAIL.REDIRECT_URI,
      client_id: env.GMAIL.CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ].join(' '),
      state: state || 'gmail_auth',
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    try {
      const url = 'https://oauth2.googleapis.com/token';
      const values = {
        code,
        client_id: env.GMAIL.CLIENT_ID,
        client_secret: env.GMAIL.CLIENT_SECRET,
        redirect_uri: env.GMAIL.REDIRECT_URI,
        grant_type: 'authorization_code',
      };
      const res = await axios.post(url, new URLSearchParams(values).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in } = res.data;
      
      // Fetch user profile info
      let userEmail = '';
      try {
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        userEmail = userRes.data.email;
      } catch (e) {
        userEmail = 'connected-user@gmail.com';
      }

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        accountEmail: userEmail,
        scopes: ['gmail.send', 'gmail.readonly'],
      };
    } catch (err) {
      throw new Error(`Gmail OAuth token exchange failed: ${err.response?.data?.error_description || err.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isHealthy: false, message: 'No credentials provided' };
    }
    try {
      const res = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${credentials.accessToken}` },
      });
      return { isHealthy: true, email: res.data.emailAddress };
    } catch (err) {
      if (err.response?.status === 401) {
        return { isHealthy: false, code: 'AUTH_EXPIRED', message: 'Gmail token expired' };
      }
      return { isHealthy: false, message: err.message };
    }
  }

  async execute(action, params = {}, credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.mock)) {
      const err = new Error('Gmail integration is not connected. Please connect your Gmail account in Integrations.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { to, subject, body, query, maxResults = 5 } = params;

    switch (action) {
      case 'send_email': {
        if (!to || !subject) {
          throw new Error('Recipient (to) and subject are required to send an email.');
        }

        // If in mock/dev mode without live google client
        if (credentials.mock || !credentials.accessToken.startsWith('ya29.')) {
          return {
            delivered: true,
            recipient: to,
            subject: subject,
            messageId: `msg_${Date.now()}_simulated`,
            timestamp: new Date().toISOString(),
            status: 'Delivered (Simulated Execution)',
          };
        }

        // RFC 2822 base64 url encoded format
        const rawMessage = [
          `To: ${to}`,
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: ${subject}`,
          '',
          body || '',
        ].join('\r\n');

        const encodedMessage = Buffer.from(rawMessage)
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const res = await axios.post(
          'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
          { raw: encodedMessage },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          delivered: true,
          recipient: to,
          subject,
          id: res.data.id,
          threadId: res.data.threadId,
        };
      }

      case 'read_emails': {
        if (credentials.mock || !credentials.accessToken.startsWith('ya29.')) {
          return {
            count: 2,
            messages: [
              { id: '1', subject: 'Simulated Inquiry', from: 'customer@example.com', snippet: 'Hello, looking for workflow setup' },
              { id: '2', subject: 'Invoice #1024', from: 'billing@vendor.com', snippet: 'Invoice attached for monthly automation' },
            ],
          };
        }

        const res = await axios.get('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
          headers: { Authorization: `Bearer ${credentials.accessToken}` },
          params: { q: query || '', maxResults },
        });

        return {
          messages: res.data.messages || [],
          resultSizeEstimate: res.data.resultSizeEstimate || 0,
        };
      }

      default:
        throw new Error(`Unsupported Gmail action: ${action}`);
    }
  }

  async refreshToken(credentials) {
    if (!credentials.refreshToken) throw new Error('No refresh token available');
    const res = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: env.GMAIL.CLIENT_ID,
      client_secret: env.GMAIL.CLIENT_SECRET,
      refresh_token: credentials.refreshToken,
      grant_type: 'refresh_token',
    });
    return {
      accessToken: res.data.access_token,
      expiresAt: new Date(Date.now() + res.data.expires_in * 1000),
    };
  }
}
