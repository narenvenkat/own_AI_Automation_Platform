# 🤖 Agentflow AI – Agentic AI Operations Automation Platform

> **Autonomous multi-agent orchestration platform.** Transform plain English natural language requests into executable visual workflow graphs, execute them through a cooperative chain of 5 specialized AI agents, connect with third-party tools (Gmail, Slack, Discord, Google Sheets), and stream live execution telemetry in real time.

---

## 🌟 Key Features

- **⚡ Natural Language Prompt-to-Workflow**: Generate complete visual DAG workflows from simple prompts with multi-tier AI fallback (*OpenRouter* ➔ *Google Gemini* ➔ *Deterministic Rule Engine*).
- **🎨 Interactive Visual Canvas**: Drag-and-drop workflow builder powered by React Flow (`@xyflow/react`), animated edges, customizable side inspector, and node palette.
- **🤖 5-Agent Cooperative Subsystem**:
  1. **Planner Agent**: Performs topological sorting, cycle detection, and emits confidence scores.
  2. **Execution Agent**: Resolves variable interpolations (`{{steps.node.output}}`) and dispatches integrations or AI actions.
  3. **Validation Agent**: Enforces strict output contracts and schema invariants.
  4. **Recovery Agent**: Classifies errors (`MISSING_FIELDS`, `API_FAILURE`, `AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`) and manages exponential backoff or escalation.
  5. **Monitoring Agent**: Streams live WebSocket events and persists execution logs for audit compliance.
- **🔐 Zero-Leak Credential Encryption**: Application-level **AES-256-GCM** authenticated token encryption for OAuth access and refresh tokens at rest.
- **🔄 Resilient In-Memory Fallbacks**: Boots immediately without external MongoDB or Redis setup—automatically spins up in-memory storage and queue runners for friction-free local development.
- **📡 Real-Time Streaming & Alerts**: Live execution timeline powered by Socket.IO with pause, resume, and cancellation controls plus an in-app notification drawer.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (Pages Router), React 19, Tailwind CSS, Zustand, React Flow (`@xyflow/react`), Axios, Socket.IO Client, Lucide Icons |
| **Backend** | Node.js, Express, MongoDB (Mongoose) + MongoMemoryServer fallback, BullMQ + In-memory queue runner, Socket.IO, Helmet, Morgan, Compression |
| **AI Integration** | OpenRouter API, Google Generative AI (Gemini 1.5 Flash), Deterministic Graph Synthesizer |
| **Integrations** | Gmail API, Slack Bot/Webhook, Discord Bot, Google Sheets API |
| **Security** | BCrypt (cost factor 12), JWT Session Tokens, AES-256-GCM authenticated crypto, Express Rate Limit |

---

## 🚀 Quickstart: Running Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`v22.x` recommended)
- **npm**: v9.0.0 or higher

---

### 2. Clone and Install Dependencies

You can install dependencies for the root workspace, server, and client with a single command:

```bash
# Install root, server, and client dependencies
npm run install:all
```

Or install individually:
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

---

### 3. Environment Variables Configuration

Default `.env` configuration files are pre-configured with safe development defaults and in-memory fallbacks.

#### Backend Configuration (`server/.env`)
Create `server/.env` (or use the provided defaults):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database & Queue (Defaults to auto in-memory mode if Mongo/Redis not detected)
MONGODB_URI=mongodb://localhost:27017/agentflow_ai
USE_IN_MEMORY_DB=auto
REDIS_URL=redis://localhost:6379
USE_IN_MEMORY_QUEUE=auto

# Security & Tokens
JWT_SECRET=agentflow_jwt_secret_key_prod_grade_2026_secure_tokens
JWT_EXPIRES_IN=7d
CREDENTIAL_ENCRYPTION_KEY=a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90

# Optional: Live AI API Keys (Leave blank to use deterministic engine)
OPENROUTER_API_KEY=
GEMINI_API_KEY=

# Optional: Third-Party OAuth Credentials
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/gmail/callback

SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/slack/callback

DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/discord/callback

GOOGLE_SHEETS_CLIENT_ID=
GOOGLE_SHEETS_CLIENT_SECRET=
GOOGLE_SHEETS_REDIRECT_URI=http://localhost:5000/api/integrations/oauth/google-sheets/callback
```

#### Frontend Configuration (`client/.env.local`)
Create `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

### 4. Seed Demo Data (Optional but Recommended)

Seed the database with sample operator accounts, pre-built workflows, and mock integration connections:

```bash
npm run seed
```

#### Default Demo Credentials:
- **Admin Account**: `admin@agentflow.ai` | **Password**: `password123`
- **Operator Account**: `operator@agentflow.ai` | **Password**: `password123`

---

### 5. Launch the Platform

Run both backend server and frontend client concurrently:

```bash
npm run dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Heartbeat**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧭 Application Walkthrough & User Guide

1. **Sign In**: Navigate to [http://localhost:3000](http://localhost:3000) and click **Sign In** (use 1-click demo login buttons or create a new account).
2. **AI Workflow Builder**: Go to **AI Builder** (`/workflows/builder`) and enter a prompt such as:
   > *"When a customer submits a ticket, classify urgency with AI and post a message to Slack #support-triage"*
   - The platform will synthesize nodes, positions, connections, and configurations in real time.
3. **Visual Canvas Editor**: Click **Open in Canvas Editor** to drag new nodes from the palette, adjust prompts, map variables like `{{steps.trigger.data.email}}`, and save the graph.
4. **Trigger an Execution**: Click **Execute Run** to watch the 5-Agent Chain activate:
   - **Planner** verifies DAG ordering and emits confidence score.
   - **Execution** executes node actions and interpolates variables.
   - **Validation** checks output integrity.
   - **Recovery** handles retries with backoff if an error is simulated.
   - **Monitoring** streams logs to the live WebSocket timeline.
5. **Inspect Timeline & Controls**: Navigate to **Executions** (`/executions`) to inspect step outputs, pause/resume active runs, or review audit logs.
6. **Integrations**: Visit **Integrations** (`/integrations`) to connect Gmail, Slack, Discord, or Google Sheets or test mock invocations.

---

## 📡 API Reference

### Authentication & System Health
- `GET /api/health` – System heartbeat, agent status, and provider check.
- `POST /api/auth/register` – Register a new user (`name`, `email`, `password`, `role`).
- `POST /api/auth/login` – Authenticate with email/password and obtain JWT.
- `GET /api/auth/me` – Fetch current authenticated operator profile.

### Workflows
- `GET /api/workflows` – List workflows with pagination and search.
- `GET /api/workflows/dashboard` – Aggregated metric KPIs and recent runs.
- `POST /api/workflows` – Create a new workflow graph manually.
- `POST /api/workflows/generate` – Synthesize workflow DAG from natural language prompt.
- `GET /api/workflows/:id` – Fetch single workflow graph.
- `PUT /api/workflows/:id` – Update workflow nodes, edges, or configuration.
- `POST /api/workflows/:id/duplicate` – Clone an existing workflow.
- `POST /api/workflows/:id/execute` – Trigger an execution run.
- `DELETE /api/workflows/:id` – Delete a workflow.

### Executions
- `GET /api/executions` – List all execution runs.
- `GET /api/executions/:id` – Fetch execution run snapshot and outputs.
- `GET /api/executions/:id/timeline` – Fetch granular agent timeline logs.
- `POST /api/executions/:id/pause` – Pause an active run.
- `POST /api/executions/:id/resume` – Resume a paused run.
- `POST /api/executions/:id/cancel` – Cancel a running execution.

### Integrations & Notifications
- `GET /api/integrations` – List third-party connection states.
- `GET /api/integrations/status` – Check provider health and token validity.
- `GET /api/integrations/oauth/:provider/start` – Initiate OAuth flow.
- `GET /api/integrations/oauth/:provider/callback` – OAuth callback receiver.
- `POST /api/integrations` – Save manual credentials or mock tokens.
- `DELETE /api/integrations/:provider` – Disconnect provider.
- `POST /api/integrations/:provider/test` – Test integration action.
- `GET /api/notifications` – List operator alert notifications.
- `PUT /api/notifications/mark-all-read` – Mark all alerts as read.

---

## 📂 Project Architecture

```
├── client/                     # Next.js Pages Router Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppShell/       # Topbar, notifications drawer, sidebar
│   │   │   ├── MetricGrid/     # KPI cards & statistics
│   │   │   ├── NodePalette/    # Draggable node palette
│   │   │   ├── NodeConfigPanel/# Node property inspector
│   │   │   ├── ProtectedRoute/ # Auth guard
│   │   │   └── WorkflowCanvas/ # React Flow canvas with custom node types
│   │   ├── pages/
│   │   │   ├── _app.js         # Global auth & style bootstrap
│   │   │   ├── index.js        # Landing page & agent showcase
│   │   │   ├── login.js        # Operator login
│   │   │   ├── register.js     # User registration
│   │   │   ├── dashboard.js    # Operator Console
│   │   │   ├── integrations.js # Third-party OAuth manager
│   │   │   ├── settings.js     # System diagnostics & profile
│   │   │   ├── executions/     # Execution list & live timeline monitor
│   │   │   └── workflows/      # Workflow repository, AI builder & canvas
│   │   ├── store/              # Zustand stores (authStore, workflowStore)
│   │   └── services/           # Axios API client & Socket.IO client
│   └── package.json
│
├── server/                     # Express Backend Server
│   ├── src/
│   │   ├── agents/             # Multi-Agent Cooperative Engine
│   │   │   ├── orchestrator.js # Execution coordinator & LangGraph reporter
│   │   │   ├── plannerAgent.js # Topological sorter & DAG validator
│   │   │   ├── executionAgent.js # Action executor & variable interpolation
│   │   │   ├── validationAgent.js # Schema & invariant contract checker
│   │   │   ├── recoveryAgent.js # Error classifier & exponential backoff
│   │   │   └── monitoringAgent.js # Socket.IO emitter & ExecutionLog writer
│   │   ├── config/             # Environment, Database, and Socket.IO setup
│   │   ├── controllers/        # Slim request/response shaping controllers
│   │   ├── integrations/       # Gmail, Slack, Discord, Google Sheets providers
│   │   ├── middleware/         # Auth, validation, error handler, rate limiter
│   │   ├── models/             # Mongoose schemas (User, Workflow, Execution...)
│   │   ├── queues/             # BullMQ Redis queue with in-memory runner
│   │   ├── routes/             # REST API routes
│   │   └── services/           # Business logic layer
│   └── package.json
│
├── package.json                # Root orchestration scripts (concurrent dev)
└── spec.md                     # Specification sheet single source of truth
```

---

## 📜 License

MIT License © 2026 Agentflow AI. Built with Google Antigravity.
