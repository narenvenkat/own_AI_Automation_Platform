import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Puzzle,
  Mail,
  Hash,
  MessageSquare,
  Table,
  Sparkles,
  CheckCircle2,
  XCircle,
  Link2,
  Unlink,
  RefreshCw,
  Play,
  Key,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import ProtectedRoute from '../components/ProtectedRoute/index.js';
import AppShell from '../components/AppShell/index.js';
import api from '../services/api.js';

export default function IntegrationsPage() {
  const router = useRouter();
  const [integrations, setIntegrations] = useState([]);
  const [healthStatus, setHealthStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const [listRes, statusRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/status'),
      ]);
      if (listRes.success) setIntegrations(listRes.data || []);
      if (statusRes.success) setHealthStatus(statusRes.data || {});
    } catch (err) {
      console.warn('Integrations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOAuthConnect = async (provider) => {
    setActionLoading(provider);
    try {
      const res = await api.get(`/integrations/oauth/${provider}/start`);
      if (res.success && res.authUrl) {
        window.location.href = res.authUrl;
      }
    } catch (err) {
      // If OAuth not configured in env, offer instant mock connection for testing
      const enableMock = confirm(
        `OAuth credentials not configured for ${provider} in server/.env.\n\nWould you like to enable Simulated Mock credentials so you can test workflows immediately?`
      );
      if (enableMock) {
        await api.post('/integrations', {
          provider,
          credentials: { mock: true, accessToken: 'simulated_dev_token' },
          accountName: `Demo ${provider.toUpperCase()}`,
        });
        fetchIntegrations();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Disconnect ${provider}? Workflows using this integration may fail.`)) return;
    setActionLoading(provider);
    try {
      await api.delete(`/integrations/${provider}`);
      fetchIntegrations();
    } catch (err) {
      alert(err.message || 'Disconnect failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestTrigger = async (provider) => {
    setActionLoading(provider);
    setTestResult(null);
    try {
      let action = 'post_message';
      let params = { message: 'Agentflow AI integration test ping' };

      if (provider === 'gmail') {
        action = 'send_email';
        params = { to: 'test@example.com', subject: 'Agentflow Test', body: 'Test execution OK' };
      } else if (provider === 'google-sheets') {
        action = 'read_range';
        params = { spreadsheetId: 'test_sheet_id', range: 'Sheet1!A1:D5' };
      }

      const res = await api.post(`/integrations/${provider}/test`, { action, params });
      setTestResult({ provider, data: res.data });
    } catch (err) {
      setTestResult({ provider, error: err.message || 'Test action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const getProviderCardMeta = (provider) => {
    switch (provider) {
      case 'gmail':
        return {
          title: 'Gmail API',
          description: 'Send and read email threads with full MIME encoding and OAuth 2.0 authorization.',
          icon: Mail,
          color: 'text-rose-400',
          bg: 'bg-rose-950/40',
          border: 'border-rose-800/40',
        };
      case 'slack':
        return {
          title: 'Slack App / Webhook',
          description: 'Post rich messages, blocks, channel announcements, and incident alerts.',
          icon: Hash,
          color: 'text-emerald-400',
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-800/40',
        };
      case 'discord':
        return {
          title: 'Discord Bot & Webhooks',
          description: 'Dispatch community bot messages, status alerts, and formatted channel embeds.',
          icon: MessageSquare,
          color: 'text-indigo-400',
          bg: 'bg-indigo-950/40',
          border: 'border-indigo-800/40',
        };
      case 'google-sheets':
        return {
          title: 'Google Sheets API',
          description: 'Append rows, log finance transactions, and sync tabular operational data.',
          icon: Table,
          color: 'text-teal-400',
          bg: 'bg-teal-950/40',
          border: 'border-teal-800/40',
        };
      default:
        return {
          title: provider.toUpperCase(),
          description: 'Third-party integration provider with AES-256 encrypted credential storage.',
          icon: Puzzle,
          color: 'text-indigo-400',
          bg: 'bg-indigo-950/40',
          border: 'border-indigo-800/40',
        };
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
                <Puzzle className="w-6 h-6 text-indigo-400" />
                <span>Third-Party Tool Integrations</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage OAuth 2.0 connections with zero-leak AES-256-GCM token encryption at rest.
              </p>
            </div>

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 Encrypted</span>
            </div>
          </div>

          {/* Test Action Output Modal / Toast */}
          {testResult && (
            <div className="p-4 rounded-2xl glass-panel border border-indigo-500/50 shadow-xl flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block mb-1">
                  Test Execution Result for {testResult.provider}
                </span>
                {testResult.error ? (
                  <p className="text-xs text-rose-400 font-mono">{testResult.error}</p>
                ) : (
                  <pre className="text-xs font-mono text-emerald-300 overflow-x-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
              <button
                onClick={() => setTestResult(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800 rounded-lg"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Integrations Grid */}
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-400">Verifying credential health...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations
                .filter((item) => ['gmail', 'slack', 'discord', 'google-sheets'].includes(item.provider))
                .map((intg) => {
                  const meta = getProviderCardMeta(intg.provider);
                  const Icon = meta.icon;
                  const health = healthStatus[intg.provider];

                  return (
                    <div
                      key={intg.provider}
                      className="glass-panel p-6 rounded-3xl border border-slate-800/90 hover:border-slate-700 flex flex-col justify-between transition-all"
                    >
                      <div>
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2.5 rounded-2xl ${meta.bg} ${meta.border} border`}>
                              <Icon className={`w-5 h-5 ${meta.color}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-100">{meta.title}</h3>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {intg.accountName || intg.provider}
                              </span>
                            </div>
                          </div>

                          {intg.isConnected ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Connected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700">
                              <XCircle className="w-3 h-3" />
                              <span>Not Connected</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {meta.description}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                        {intg.isConnected ? (
                          <>
                            <button
                              onClick={() => handleTestTrigger(intg.provider)}
                              disabled={actionLoading === intg.provider}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                            >
                              <Play className="w-3 h-3 text-emerald-400 fill-current" />
                              <span>Test Invocation</span>
                            </button>

                            <button
                              onClick={() => handleDisconnect(intg.provider)}
                              disabled={actionLoading === intg.provider}
                              className="px-3 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 text-xs font-medium flex items-center space-x-1.5 transition-colors"
                            >
                              <Unlink className="w-3 h-3" />
                              <span>Disconnect</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleOAuthConnect(intg.provider)}
                            disabled={actionLoading === intg.provider}
                            className="w-full py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-2 transition-all"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Connect with OAuth</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
