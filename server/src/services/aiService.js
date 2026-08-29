import axios from 'axios';
import { env } from '../config/env.js';

/**
 * Deterministic Rule-Based Graph Builder (Fallback when no API keys are present)
 */
export const buildDeterministicWorkflow = (prompt) => {
  const lower = prompt.toLowerCase();
  const timestamp = Date.now();

  let name = 'Automated AI Workflow';
  let description = prompt;
  let nodes = [];
  let edges = [];

  // Pattern 1: Email automation / Customer lead
  if (lower.includes('email') || lower.includes('gmail') || lower.includes('lead') || lower.includes('inquiry')) {
    name = 'Lead Intake & Automated Email Response';
    nodes = [
      {
        id: 'node-trigger-1',
        type: 'triggerNode',
        position: { x: 100, y: 180 },
        data: {
          label: 'Incoming Lead / Email Trigger',
          category: 'trigger',
          provider: 'webhook',
          event: 'lead_form_submitted',
          description: 'Triggers when a new customer form or webhook is received',
          config: {
            source: 'Web Contact Form',
            fields: ['name', 'email', 'company', 'message', 'budget'],
          },
        },
      },
      {
        id: 'node-ai-2',
        type: 'aiNode',
        position: { x: 420, y: 180 },
        data: {
          label: 'AI Sentiment & Opportunity Analyzer',
          category: 'ai',
          model: 'gemini-1.5-flash',
          provider: 'gemini',
          description: 'Analyzes user intent, lead value score, and drafts personalized reply',
          config: {
            prompt: 'Analyze lead from {{steps.node-trigger-1.data.name}} with budget {{steps.node-trigger-1.data.budget}}. Classify priority (HIGH/MED/LOW) and write a custom welcome email.',
            temperature: 0.7,
            maxTokens: 500,
          },
        },
      },
      {
        id: 'node-cond-3',
        type: 'conditionNode',
        position: { x: 740, y: 180 },
        data: {
          label: 'Check High Priority',
          category: 'logic',
          description: 'Routes high-value leads to VIP notification and instant Gmail response',
          config: {
            field: '{{steps.node-ai-2.output.priority}}',
            operator: 'equals',
            value: 'HIGH',
          },
        },
      },
      {
        id: 'node-gmail-4',
        type: 'integrationNode',
        position: { x: 1060, y: 100 },
        data: {
          label: 'Send Gmail Response',
          category: 'integration',
          provider: 'gmail',
          action: 'send_email',
          description: 'Sends personalized email via Gmail OAuth',
          config: {
            to: '{{steps.node-trigger-1.data.email}}',
            subject: 'Thank you for reaching out to Agentflow AI',
            body: '{{steps.node-ai-2.output.emailDraft}}',
          },
        },
      },
      {
        id: 'node-slack-5',
        type: 'integrationNode',
        position: { x: 1060, y: 280 },
        data: {
          label: 'Alert Team on Slack',
          category: 'integration',
          provider: 'slack',
          action: 'post_message',
          description: 'Broadcasts lead notification to #sales-leads',
          config: {
            channel: '#sales-leads',
            message: '🚀 *New High-Priority Lead*: {{steps.node-trigger-1.data.name}} (Budget: {{steps.node-trigger-1.data.budget}})',
          },
        },
      },
    ];

    edges = [
      { id: 'e1-2', source: 'node-trigger-1', target: 'node-ai-2', animated: true },
      { id: 'e2-3', source: 'node-ai-2', target: 'node-cond-3', animated: true },
      { id: 'e3-4', source: 'node-cond-3', target: 'node-gmail-4', label: 'True / High', animated: true },
      { id: 'e3-5', source: 'node-cond-3', target: 'node-slack-5', label: 'Always notify', animated: true },
    ];
  }
  // Pattern 2: Invoice Routing / Google Sheets
  else if (lower.includes('invoice') || lower.includes('sheet') || lower.includes('expense') || lower.includes('table')) {
    name = 'Invoice Processing & Google Sheet Ledger';
    nodes = [
      {
        id: 'node-trigger-1',
        type: 'triggerNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Invoice File Ingestion',
          category: 'trigger',
          provider: 'webhook',
          event: 'file_uploaded',
          description: 'Triggers upon receiving new invoice document',
          config: {
            fileTypes: ['pdf', 'png', 'jpg'],
          },
        },
      },
      {
        id: 'node-ai-2',
        type: 'aiNode',
        position: { x: 440, y: 200 },
        data: {
          label: 'AI OCR & Line Item Extractor',
          category: 'ai',
          model: 'openrouter/anthropic/claude-3.5-sonnet',
          description: 'Extracts vendor, line items, taxes, and total amount',
          config: {
            prompt: 'Extract vendor_name, invoice_number, date, total_amount, currency from {{steps.node-trigger-1.data.file}}',
            responseSchema: 'JSON',
          },
        },
      },
      {
        id: 'node-sheets-3',
        type: 'integrationNode',
        position: { x: 780, y: 200 },
        data: {
          label: 'Append to Finance Sheet',
          category: 'integration',
          provider: 'google-sheets',
          action: 'append_row',
          description: 'Inserts row into Google Sheets ledger',
          config: {
            spreadsheetId: 'FINANCE_LEDGER_SHEET_ID',
            range: 'Invoices!A1',
            values: ['{{steps.node-ai-2.output.date}}', '{{steps.node-ai-2.output.vendor_name}}', '{{steps.node-ai-2.output.total_amount}}', 'PENDING_AUDIT'],
          },
        },
      },
      {
        id: 'node-discord-4',
        type: 'integrationNode',
        position: { x: 1100, y: 200 },
        data: {
          label: 'Finance Discord Notification',
          category: 'integration',
          provider: 'discord',
          action: 'post_message',
          description: 'Posts invoice summary embed to #finance Discord',
          config: {
            channelId: 'finance-channel-id',
            content: '📄 *New Invoice Logged*: ${{steps.node-ai-2.output.total_amount}} from {{steps.node-ai-2.output.vendor_name}}',
          },
        },
      },
    ];

    edges = [
      { id: 'e1-2', source: 'node-trigger-1', target: 'node-ai-2', animated: true },
      { id: 'e2-3', source: 'node-ai-2', target: 'node-sheets-3', animated: true },
      { id: 'e3-4', source: 'node-sheets-3', target: 'node-discord-4', animated: true },
    ];
  }
  // Pattern 3: Discord / Slack Community & Sentiment Alerts
  else if (lower.includes('discord') || lower.includes('slack') || lower.includes('sentiment') || lower.includes('support')) {
    name = 'Community Support & Triage Pipeline';
    nodes = [
      {
        id: 'node-trigger-1',
        type: 'triggerNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'User Message / Ticket Received',
          category: 'trigger',
          provider: 'webhook',
          event: 'support_ticket_created',
          description: 'Fired when user sends inquiry or ticket',
          config: { fields: ['ticketId', 'user', 'message', 'channel'] },
        },
      },
      {
        id: 'node-ai-2',
        type: 'aiNode',
        position: { x: 440, y: 200 },
        data: {
          label: 'AI Sentiment & Triage Classifier',
          category: 'ai',
          model: 'gemini-1.5-flash',
          description: 'Evaluates sentiment polarity, tags category, and proposes resolution',
          config: {
            prompt: 'Classify sentiment (URGENT/NORMAL/FRUSTRATED) and category for: {{steps.node-trigger-1.data.message}}',
          },
        },
      },
      {
        id: 'node-slack-3',
        type: 'integrationNode',
        position: { x: 780, y: 120 },
        data: {
          label: 'Post to Slack Ops',
          category: 'integration',
          provider: 'slack',
          action: 'post_message',
          description: 'Sends triage alert to internal operations room',
          config: {
            channel: '#ops-triage',
            message: '🚨 *Ticket {{steps.node-trigger-1.data.ticketId}}* ({{steps.node-ai-2.output.sentiment}}): {{steps.node-trigger-1.data.message}}',
          },
        },
      },
      {
        id: 'node-discord-4',
        type: 'integrationNode',
        position: { x: 780, y: 280 },
        data: {
          label: 'Post to Discord Bot Channel',
          category: 'integration',
          provider: 'discord',
          action: 'post_message',
          description: 'Updates community status channel',
          config: {
            channelId: 'support-status',
            content: 'User inquiry triaged and assigned to on-call engineer.',
          },
        },
      },
    ];

    edges = [
      { id: 'e1-2', source: 'node-trigger-1', target: 'node-ai-2', animated: true },
      { id: 'e2-3', source: 'node-ai-2', target: 'node-slack-3', animated: true },
      { id: 'e2-4', source: 'node-ai-2', target: 'node-discord-4', animated: true },
    ];
  }
  // Generic Multi-Stage AI Automation
  else {
    name = `AI Pipeline: ${prompt.slice(0, 40)}`;
    nodes = [
      {
        id: 'node-trigger-1',
        type: 'triggerNode',
        position: { x: 100, y: 200 },
        data: {
          label: 'Manual / Scheduled Trigger',
          category: 'trigger',
          provider: 'schedule',
          event: 'schedule_or_manual',
          description: 'Initiates workflow on operator request or schedule',
          config: { interval: '1h' },
        },
      },
      {
        id: 'node-ai-2',
        type: 'aiNode',
        position: { x: 440, y: 200 },
        data: {
          label: 'Agentic AI Reasoning Step',
          category: 'ai',
          model: 'openrouter/auto',
          description: `Processes prompt requirements: ${prompt}`,
          config: {
            prompt: `Execute goal: ${prompt}. Extract actionable structured insights.`,
          },
        },
      },
      {
        id: 'node-slack-3',
        type: 'integrationNode',
        position: { x: 780, y: 200 },
        data: {
          label: 'Dispatch Execution Results',
          category: 'integration',
          provider: 'slack',
          action: 'post_message',
          description: 'Notifies operator console or communication channel',
          config: {
            channel: '#agent-outputs',
            message: '✅ *Agentflow Execution Finished*: {{steps.node-ai-2.output.summary}}',
          },
        },
      },
    ];

    edges = [
      { id: 'e1-2', source: 'node-trigger-1', target: 'node-ai-2', animated: true },
      { id: 'e2-3', source: 'node-ai-2', target: 'node-slack-3', animated: true },
    ];
  }

  return {
    name,
    description: prompt,
    nodes,
    edges,
    triggerConfig: {
      type: 'manual',
      event: 'manual_trigger',
    },
    version: 1,
    tags: ['AI-Generated', 'Agentflow'],
    generator: 'deterministic-rule-engine',
  };
};

/**
 * Generate Workflow from Natural Language Prompt
 * Prioritizes: OpenRouter -> Google Gemini -> Deterministic Engine
 */
export const generateWorkflowFromPrompt = async (prompt) => {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Prompt is required for workflow generation');
  }

  const systemInstruction = `
You are an expert AI Operations Workflow Architect for the Agentic AI Automation Platform (Agentflow_AI).
Given a natural language automation request, generate a valid JSON workflow graph that can be rendered directly in React Flow.

Supported node types:
1. 'triggerNode' (category: 'trigger') - sources: webhook, schedule, manual
2. 'aiNode' (category: 'ai') - AI processing (prompt, model, inputs)
3. 'integrationNode' (category: 'integration') - provider: 'gmail'|'slack'|'discord'|'google-sheets', actions: 'send_email', 'post_message', 'append_row', 'read_range'
4. 'conditionNode' (category: 'logic') - branching logic
5. 'outputNode' (category: 'output') - final state or summary

Output Format: You MUST return ONLY valid JSON in this exact schema without backticks or markdown fences:
{
  "name": "Concise workflow name",
  "description": "Clear workflow description",
  "nodes": [
    {
      "id": "node-1",
      "type": "triggerNode",
      "position": { "x": 100, "y": 200 },
      "data": {
        "label": "Human readable node name",
        "category": "trigger",
        "provider": "webhook",
        "description": "Short explanation",
        "config": {}
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "node-1",
      "target": "node-2",
      "animated": true
    }
  ],
  "triggerConfig": {
    "type": "manual"
  },
  "tags": ["Tag1", "Tag2"]
}
`;

  // 1. Try OpenRouter
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log('[AIService] Generating workflow using OpenRouter...');
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: `Generate a workflow graph for this prompt: "${prompt}"` },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': env.CLIENT_URL,
            'X-Title': 'Agentflow AI',
          },
          timeout: 25000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
        parsed.generator = 'openrouter';
        return parsed;
      }
    } catch (err) {
      console.warn('[AIService] OpenRouter generation failed, trying Gemini fallback:', err.message);
    }
  }

  // 2. Try Google Gemini
  if (env.GEMINI_API_KEY) {
    try {
      console.log('[AIService] Generating workflow using Google Gemini...');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [
                { text: `${systemInstruction}\n\nUser Prompt: "${prompt}"` }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          }
        },
        { timeout: 25000 }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const parsed = JSON.parse(text);
        parsed.generator = 'gemini';
        return parsed;
      }
    } catch (err) {
      console.warn('[AIService] Gemini generation failed, using deterministic builder fallback:', err.message);
    }
  }

  // 3. Deterministic Builder Fallback
  console.log('[AIService] Using deterministic rule-engine graph builder...');
  return buildDeterministicWorkflow(prompt);
};
