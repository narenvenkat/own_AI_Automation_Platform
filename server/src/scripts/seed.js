import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Workflow } from '../models/Workflow.js';
import { Integration } from '../models/Integration.js';
import { encryptCredential } from '../services/encryptionService.js';

const seedData = async () => {
  console.log('[Seed] Starting database seeding...');
  await connectDB();

  // Create demo admin and operator users
  let admin = await User.findOne({ email: 'admin@agentflow.ai' });
  if (!admin) {
    admin = await User.create({
      name: 'System Admin',
      email: 'admin@agentflow.ai',
      password: 'password123',
      role: 'admin',
    });
    console.log('✅ Created Admin user: admin@agentflow.ai (password: password123)');
  }

  let operator = await User.findOne({ email: 'operator@agentflow.ai' });
  if (!operator) {
    operator = await User.create({
      name: 'Operations Lead',
      email: 'operator@agentflow.ai',
      password: 'password123',
      role: 'operator',
    });
    console.log('✅ Created Operator user: operator@agentflow.ai (password: password123)');
  }

  // Create Sample Workflows
  const sampleWorkflows = [
    {
      name: 'Customer Support AI Triage & Slack Alert',
      description: 'Ingests incoming customer tickets, performs AI sentiment classification, and dispatches urgent alerts to Slack.',
      owner: operator._id,
      status: 'active',
      tags: ['Support', 'AI-Triage', 'Slack'],
      version: 1,
      nodes: [
        {
          id: 'node-1',
          type: 'triggerNode',
          position: { x: 100, y: 150 },
          data: {
            label: 'Support Ticket Trigger',
            category: 'trigger',
            provider: 'webhook',
            event: 'ticket_created',
            description: 'Fires on Zendesk or customer portal webhook',
            config: {
              source: 'Customer Portal',
              fields: ['ticketId', 'customerEmail', 'message', 'severity'],
            },
          },
        },
        {
          id: 'node-2',
          type: 'aiNode',
          position: { x: 420, y: 150 },
          data: {
            label: 'AI Sentiment & Urgency Classifier',
            category: 'ai',
            model: 'gemini-1.5-flash',
            provider: 'gemini',
            description: 'Analyzes tone, identifies key issue, and drafts response',
            config: {
              prompt: 'Evaluate customer message: "{{steps.node-1.data.message}}". Classify sentiment and generate an action plan.',
            },
          },
        },
        {
          id: 'node-3',
          type: 'integrationNode',
          position: { x: 760, y: 150 },
          data: {
            label: 'Post to Slack #support-ops',
            category: 'integration',
            provider: 'slack',
            action: 'post_message',
            description: 'Broadcasts triage card to Slack channel',
            config: {
              channel: '#support-ops',
              message: '🚨 *New Ticket Triaged*: {{steps.node-2.output.summary}}',
            },
          },
        },
      ],
      edges: [
        { id: 'e1-2', source: 'node-1', target: 'node-2', animated: true },
        { id: 'e2-3', source: 'node-2', target: 'node-3', animated: true },
      ],
    },
    {
      name: 'Lead Qualification & Gmail Welcome Campaign',
      description: 'Captures new website leads, generates tailored introductory messaging, and emails the prospect via Gmail.',
      owner: operator._id,
      status: 'active',
      tags: ['Sales', 'Gmail', 'Outreach'],
      version: 1,
      nodes: [
        {
          id: 'lead-trigger',
          type: 'triggerNode',
          position: { x: 100, y: 200 },
          data: {
            label: 'Website Lead Form',
            category: 'trigger',
            provider: 'webhook',
            event: 'form_submit',
            description: 'Triggered when a lead signs up',
            config: { fields: ['name', 'email', 'interest', 'company'] },
          },
        },
        {
          id: 'lead-ai',
          type: 'aiNode',
          position: { x: 440, y: 200 },
          data: {
            label: 'AI Prospect Pitch Generator',
            category: 'ai',
            model: 'openrouter/anthropic/claude-3.5-sonnet',
            description: 'Drafts highly personalized introductory email',
            config: {
              prompt: 'Draft an enthusiastic welcome email to {{steps.lead-trigger.data.name}} from {{steps.lead-trigger.data.company}}.',
            },
          },
        },
        {
          id: 'lead-gmail',
          type: 'integrationNode',
          position: { x: 800, y: 200 },
          data: {
            label: 'Dispatch Welcome Email',
            category: 'integration',
            provider: 'gmail',
            action: 'send_email',
            description: 'Sends email through connected Gmail OAuth account',
            config: {
              to: '{{steps.lead-trigger.data.email}}',
              subject: 'Welcome to Agentflow AI!',
              body: '{{steps.lead-ai.output.emailDraft}}',
            },
          },
        },
      ],
      edges: [
        { id: 'e-lead-1', source: 'lead-trigger', target: 'lead-ai', animated: true },
        { id: 'e-lead-2', source: 'lead-ai', target: 'lead-gmail', animated: true },
      ],
    },
  ];

  for (const wf of sampleWorkflows) {
    const existing = await Workflow.findOne({ name: wf.name });
    if (!existing) {
      await Workflow.create(wf);
      console.log(`✅ Seeded Workflow: ${wf.name}`);
    }
  }

  // Seed sample mock integration connections
  const sampleIntegrations = [
    { provider: 'gmail', accountName: 'operations@agentflow.ai', accountEmail: 'operations@agentflow.ai', isConnected: true },
    { provider: 'slack', accountName: 'Agentflow Ops Workspace', isConnected: true },
    { provider: 'discord', accountName: 'Agentflow Community Guild', isConnected: true },
    { provider: 'google-sheets', accountName: 'Enterprise Google Sheets', isConnected: true },
  ];

  for (const intg of sampleIntegrations) {
    await Integration.findOneAndUpdate(
      { owner: operator._id, provider: intg.provider },
      {
        isConnected: true,
        accountName: intg.accountName,
        accountEmail: intg.accountEmail || '',
        encryptedData: encryptCredential({ mock: true, accessToken: 'sample_token_encrypted' }),
      },
      { upsert: true }
    );
  }
  console.log('✅ Seeded mock integrations for operator account.');

  console.log('[Seed] Database seeding completed successfully!');
  await disconnectDB();
};

seedData().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
