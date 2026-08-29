# 🚀 Production Deployment Guide: Agentflow AI

This guide walks you through deploying the **Agentic AI Automation Platform (Agentflow_AI)** to production with:
- **Backend (API & WebSockets)** on **[Render](https://render.com/)**
- **Frontend (Next.js & Visual Canvas)** on **[Vercel](https://vercel.com/)**
- **Database** on **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**

---

## 📋 Table of Contents
1. [Step 1: Commit and Push to GitHub](#step-1-commit-and-push-to-github)
2. [Step 2: Deploy Backend on Render](#step-2-deploy-backend-on-render)
3. [Step 3: Deploy Frontend on Vercel](#step-3-deploy-frontend-on-vercel)
4. [Step 4: Connect URLs & CORS](#step-4-connect-urls--cors)
5. [Step 5: Post-Deployment Verification & Seeding](#step-5-post-deployment-verification--seeding)

---

## Step 1: Commit and Push to GitHub

Ensure `.gitignore` is present (already configured to ignore `node_modules`, `.env`, and `.next` build files).

Open your terminal in the project root (`d:\Naren Venkat\Project\Own AI Automation Platform`) and run:

```bash
# 1. Initialize Git repository
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "feat: complete full-stack Agentflow AI automation platform"

# 4. Create a new repository on GitHub (https://github.com/new)
# Then link and push to your GitHub repo:
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

---

## Step 2: Deploy Backend on Render

1. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** ➔ **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo.
4. Configure the service settings:

| Setting | Value |
|---|---|
| **Name** | `agentflow-server` (or your preferred name) |
| **Region** | Oregon (US West) or closest to your users |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node src/server.js` |
| **Plan Type** | Free / Starter |

5. Scroll down to **Environment Variables** and add the following keys:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Render default port |
| `CLIENT_URL` | `https://your-app.vercel.app` | *Can be set to `*` initially, then updated once Vercel deploys* |
| `MONGODB_URI` | `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>` | Your MongoDB Atlas connection string |` | Your MongoDB Atlas connection string |
| `USE_IN_MEMORY_DB` | `false` | Use real MongoDB Atlas |
| `USE_IN_MEMORY_QUEUE` | `true` | In-memory queue runner (or specify Redis URL if using Upstash) |
| `JWT_SECRET` | `agentflow_jwt_secret_key_prod_grade_2026_secure_tokens` | Secret key for JWT sessions |
| `CREDENTIAL_ENCRYPTION_KEY` | `a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90` | 32-byte hex key for AES-256 token encryption |
| `GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY` | (Optional) Google Gemini API Key |
| `OPENROUTER_API_KEY` | *(Optional)* | (Optional) OpenRouter API Key |

6. (Optional) Under **Advanced**, set **Health Check Path** to `/api/health`.
7. Click **Create Web Service**. Render will build and deploy your backend.
8. Once deployment finishes, copy your Render Service URL (e.g. `https://agentflow-server-xxxx.onrender.com`).

---

## Step 3: Deploy Frontend on Vercel

1. Log in to **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click **Add New...** ➔ **Project**.
3. Import your GitHub repository.
4. In the configuration screen:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select `client`
5. Expand **Environment Variables** and add:

| Key | Value | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<YOUR-RENDER-URL>/api` | `https://agentflow-server.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | `https://<YOUR-RENDER-URL>` | `https://agentflow-server.onrender.com` |

6. Click **Deploy**. Vercel will build and deploy the Next.js app in ~1-2 minutes.
7. Once deployed, copy your Vercel production URL (e.g. `https://agentflow-ai.vercel.app`).

---

## Step 4: Connect URLs & CORS

1. Go back to your **Render Dashboard** ➔ `agentflow-server` ➔ **Environment**.
2. Update the `CLIENT_URL` variable to your production Vercel URL:
   ```env
   CLIENT_URL=https://agentflow-ai.vercel.app
   ```
3. Click **Save Changes** (Render will automatically redeploy with the updated CORS policy).

---

## Step 5: Post-Deployment Verification & Seeding

### 1. Verify Backend Health
Open `https://<YOUR-RENDER-URL>/api/health` in your browser. You should see:
```json
{
  "success": true,
  "platform": "Agentic AI Automation Platform (Agentflow_AI)",
  "status": "healthy",
  "database": {
    "status": "connected",
    "name": "agentflow_ai"
  },
  "orchestration": {
    "langGraph": "available",
    "agents": ["planner", "execution", "validation", "recovery", "monitoring"]
  }
}
```

### 2. Verify Frontend & Sign In
Open your Vercel URL (`https://your-app.vercel.app`).
- You can register a new account on `/register` or sign in with your seeded credentials:
  - **Admin**: `admin@agentflow.ai` | **Password**: `password123`
  - **Operator**: `operator@agentflow.ai` | **Password**: `password123`
- Test creating a workflow with the **AI Prompt Generator** (`/workflows/builder`).
- Trigger an execution run and verify the live WebSocket timeline streams the 5 cooperating agent steps in real time!

---

## 🛠️ Summary of Deployment Architecture

```
[ Operator Browser ]
        │
        ├── HTTPS / WebSockets ──► Vercel (Next.js Frontend: client/)
        │
        └── REST API / Socket.IO ──► Render (Express + Agents Engine: server/)
                                            │
                                            ├── MongoDB Atlas (agentflow_ai DB)
                                            └── Gemini / OpenRouter AI APIs
```
