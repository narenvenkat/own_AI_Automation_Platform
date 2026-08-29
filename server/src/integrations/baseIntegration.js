/**
 * Base Integration Abstract Class
 * All third-party providers (Gmail, Slack, Discord, Google Sheets) implement this contract.
 */
export class BaseIntegration {
  constructor(providerName) {
    if (this.constructor === BaseIntegration) {
      throw new Error('Abstract class BaseIntegration cannot be instantiated directly.');
    }
    this.providerName = providerName;
  }

  /**
   * Generates OAuth authorization URL
   * @param {string} state - CSRF state token
   * @returns {string} authorization URL
   */
  getAuthUrl(state) {
    throw new Error(`getAuthUrl() not implemented in ${this.providerName}`);
  }

  /**
   * Exchanges auth code for tokens
   * @param {string} code
   * @returns {Promise<{ accessToken: string, refreshToken?: string, expiresAt?: Date, metadata?: object }>}
   */
  async handleCallback(code) {
    throw new Error(`handleCallback() not implemented in ${this.providerName}`);
  }

  /**
   * Verifies if stored credentials are functional
   * @param {object} credentials
   * @returns {Promise<{ isHealthy: boolean, details?: any }>}
   */
  async testConnection(credentials) {
    throw new Error(`testConnection() not implemented in ${this.providerName}`);
  }

  /**
   * Executes a node action (send email, post message, append row, etc.)
   * @param {string} action
   * @param {object} params
   * @param {object} credentials
   * @returns {Promise<{ success: boolean, data?: any, error?: any }>}
   */
  async execute(action, params, credentials) {
    throw new Error(`execute() not implemented in ${this.providerName}`);
  }

  /**
   * Refreshes expired access tokens
   * @param {object} credentials
   * @returns {Promise<{ accessToken: string, expiresAt?: Date }>}
   */
  async refreshToken(credentials) {
    throw new Error(`refreshToken() not implemented in ${this.providerName}`);
  }
}
