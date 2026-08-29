import http from 'http';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { initSocket } from '../config/socket.js';
import { initExecutionQueue } from '../queues/executionQueue.js';
import axios from 'axios';

async function testE2E() {
  console.log('🧪 Starting End-to-End System Verification...');
  await connectDB();
  initExecutionQueue();

  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099/api';

  try {
    // 1. Health check
    console.log('1. Testing /api/health...');
    const health = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health status:', health.data.status, '| Orchestration:', health.data.orchestration);

    // 2. Auth register
    console.log('2. Testing /api/auth/register...');
    const testEmail = `test_operator_${Date.now()}@agentflow.ai`;
    const regRes = await axios.post(`${baseUrl}/auth/register`, {
      name: 'Test Operator',
      email: testEmail,
      password: 'password123',
      role: 'operator',
    });
    const token = regRes.data.data.token;
    console.log('✅ Registered user token acquired:', token ? 'YES' : 'NO');

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. AI Workflow generation
    console.log('3. Testing /api/workflows/generate...');
    const genRes = await axios.post(
      `${baseUrl}/workflows/generate`,
      { prompt: 'When a new lead arrives via webhook, analyze sentiment with AI and send a Gmail response' },
      authHeaders
    );
    const workflow = genRes.data.data;
    console.log(`✅ Generated workflow "${workflow.name}" with ${workflow.nodes.length} nodes and ${workflow.edges.length} edges.`);

    // 4. Trigger Execution
    console.log('4. Testing /api/workflows/:id/execute...');
    const execRes = await axios.post(
      `${baseUrl}/workflows/${workflow._id}/execute`,
      { inputs: { sampleLead: 'VIP Partner' } },
      authHeaders
    );
    const executionId = execRes.data.data.executionId;
    console.log(`✅ Workflow execution queued with ID: ${executionId}`);

    // Wait 2.5 seconds for multi-agent chain to complete
    await new Promise((r) => setTimeout(r, 2500));

    // 5. Fetch Execution detail & timeline
    console.log('5. Fetching execution status and timeline...');
    const execDetail = await axios.get(`${baseUrl}/executions/${executionId}`, authHeaders);
    const timeline = await axios.get(`${baseUrl}/executions/${executionId}/timeline`, authHeaders);
    console.log(`✅ Execution status: ${execDetail.data.data.status} in ${execDetail.data.data.duration}ms`);
    console.log(`✅ Timeline events captured: ${timeline.data.data.length} agent logs`);

    console.log('\n🎉 ALL SYSTEM VERIFICATIONS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Verification failed:', err.response?.data || err.message);
    process.exitCode = 1;
  } finally {
    server.close();
    await disconnectDB();
    process.exit(process.exitCode || 0);
  }
}

testE2E();
