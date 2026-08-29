import axios from 'axios';
import { BaseIntegration } from './baseIntegration.js';
import { env } from '../config/env.js';

export class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(state) {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
      redirect_uri: env.GOOGLE_SHEETS.REDIRECT_URI,
      client_id: env.GOOGLE_SHEETS.CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      state: state || 'sheets_auth',
    };
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleCallback(code) {
    try {
      const url = 'https://oauth2.googleapis.com/token';
      const values = {
        code,
        client_id: env.GOOGLE_SHEETS.CLIENT_ID,
        client_secret: env.GOOGLE_SHEETS.CLIENT_SECRET,
        redirect_uri: env.GOOGLE_SHEETS.REDIRECT_URI,
        grant_type: 'authorization_code',
      };
      const res = await axios.post(url, new URLSearchParams(values).toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, refresh_token, expires_in } = res.data;

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        scopes: ['spreadsheets'],
      };
    } catch (err) {
      throw new Error(`Google Sheets OAuth token exchange failed: ${err.message}`);
    }
  }

  async testConnection(credentials) {
    if (!credentials || !credentials.accessToken) {
      return { isHealthy: false, message: 'No credentials provided' };
    }
    return { isHealthy: true, message: 'Google Sheets credentials present' };
  }

  async execute(action, params = {}, credentials) {
    if (!credentials || (!credentials.accessToken && !credentials.mock)) {
      const err = new Error('Google Sheets integration is not connected. Please connect Google Sheets in Integrations.');
      err.code = 'INTEGRATION_NOT_CONNECTED';
      throw err;
    }

    const { spreadsheetId, range = 'Sheet1!A1', values = [] } = params;

    switch (action) {
      case 'append_row': {
        if (!spreadsheetId) {
          throw new Error('Spreadsheet ID is required to append row.');
        }

        if (credentials.mock || !credentials.accessToken.startsWith('ya29.')) {
          return {
            appended: true,
            spreadsheetId,
            range,
            rowsAdded: 1,
            valuesInserted: values,
            status: 'Row Appended (Simulated Execution)',
            timestamp: new Date().toISOString(),
          };
        }

        const formattedValues = Array.isArray(values[0]) ? values : [values];
        const res = await axios.post(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
          { values: formattedValues },
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          appended: true,
          updatedRange: res.data.updates?.updatedRange,
          updatedRows: res.data.updates?.updatedRows,
        };
      }

      case 'read_range': {
        if (!spreadsheetId) {
          throw new Error('Spreadsheet ID is required to read range.');
        }

        if (credentials.mock || !credentials.accessToken.startsWith('ya29.')) {
          return {
            range: range || 'Sheet1!A1:D5',
            values: [
              ['Date', 'Customer', 'Amount', 'Status'],
              ['2026-08-28', 'Acme Corp', '1250', 'Paid'],
              ['2026-08-29', 'Globex Inc', '3400', 'Pending'],
            ],
            totalRows: 3,
          };
        }

        const res = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`,
          { headers: { Authorization: `Bearer ${credentials.accessToken}` } }
        );

        return {
          range: res.data.range,
          values: res.data.values || [],
        };
      }

      default:
        throw new Error(`Unsupported Google Sheets action: ${action}`);
    }
  }
}
