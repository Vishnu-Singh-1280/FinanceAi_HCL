# FinanceAI — Deployment & Operations Guide

Welcome to the **FinanceAI** Quantitative Financial Research & Portfolio Intelligence Platform deployment documentation.

---

## 📋 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Quick Local Run (Windows / Mac / Linux)](#2-quick-local-run)
3. [Production Docker Deployment](#3-production-docker-deployment)
4. [Cloud Platform Deployments](#4-cloud-platform-deployments)
   - [Render](#render-recommended-free--starter)
   - [Railway](#railway)
   - [DigitalOcean / AWS / GCP](#digitalocean--aws--gcp)
5. [Progressive Web App (PWA) / "Download as App"](#5-progressive-web-app-pwa--download-as-app)
6. [Authentication, User & Admin Profiles](#6-authentication-user--admin-profiles)
7. [Environment Configuration Reference](#7-environment-configuration-reference)

---

## 1. Architecture Overview

FinanceAI is structured as an enterprise-grade full-stack platform:
- **Frontend**: React 19 + TypeScript, Tailwind CSS, Lucide Icons, Recharts, Inter Font (`tabular-nums`), Bloomberg/TradingView-inspired UI.
- **Backend**: Python FastAPI with modular routers (`/market`, `/stocks`, `/forecast`, `/advisor`, `/portfolio`, `/macro`, `/auth`, `/admin`).
- **Database**: SQLite (local/zero-config) or PostgreSQL (production via SQLAlchemy).
- **Single-Container Mode**: FastAPI automatically serves the pre-compiled `frontend/dist` SPA when running in production, eliminating the need for a separate Nginx container if desired.

---

## 2. Quick Local Run

### Prerequisites
- Python 3.10+ (Python 3.11/3.14 compatible)
- Node.js 18+ & npm

### Method A: One-Click Unified Production Server (Windows)
Double-click:
* `start_production.bat` — Automatically compiles the React frontend into `frontend/dist` and launches the unified production FastAPI server on **`http://localhost:8000`**. Everything (UI + API + ML + Database) runs in one single process!

### Method B: Development Mode (Hot Reloading)
Double-click:
1. `start_backend.bat` — Launches FastAPI on `http://localhost:8000`
2. `start_frontend.bat` — Launches Vite dev server on `http://localhost:5173`

### Method C: Terminal Commands
**Terminal 1 (Backend):**
```bash
# In project root
python -m venv .venv
# Windows: .venv\Scripts\activate | Mac/Linux: source .venv/bin/activate
pip install -r backend/requirements.txt
python backend/run.py
```
Backend will start at: `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at: `http://localhost:5173`.

---

## 3. Production Docker Deployment

FinanceAI includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml`.

### Build & Run with Docker Compose
```bash
# In the root repository folder
docker compose up -d --build
```
This will:
1. Compile the React TypeScript frontend into optimized static bundles.
2. Build the Python 3.11-slim container.
3. Launch the single unified application on port **8000**.
4. Open [http://localhost:8000](http://localhost:8000) in your browser.

### Docker CLI Direct:
```bash
docker build -t financeai:latest .
docker run -d -p 8000:8000 --name financeai_app financeai:latest
```

---

## 4. Cloud Platform Deployments

### Hugging Face Spaces (Recommended #1 — 100% Free Forever, 0 Credit Card)
1. Sign in to **[Hugging Face](https://huggingface.co/)** (free signup with Google or GitHub).
2. Go to **[https://huggingface.co/new-space](https://huggingface.co/new-space)**.
3. Configure your Space:
   - **Space Name**: `FinanceAI` (or any name you like)
   - **License**: `mit` / `apache-2.0`
   - **Select the Space SDK**: Choose **Docker** ➔ **Blank**.
   - **Space Hardware**: Free CPU (2 vCPU · 16 GB RAM).
4. Under **"Already have a repo?"** or after creating:
   - Clone the Hugging Face repo or push directly from your local project:
     ```bash
     git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/FinanceAI
     git push hf main
     ```
   - Or connect your GitHub repository directly.
5. Hugging Face Spaces reads the `Dockerfile` automatically, builds both React and FastAPI, and launches your platform on a permanent, public HTTPS link (e.g. `https://huggingface.co/spaces/Vishnu-Singh/FinanceAI`) with 16 GB RAM!

### Koyeb (Free — No Credit Card Required)
1. Sign in to **[Koyeb.com](https://www.koyeb.com)** with GitHub.
2. Click **Create App** ➔ **GitHub**.
3. Select your repository: `Vishnu-Singh-1280/FinanceAi_HCL`.
4. Choose **Dockerfile** builder and Port `7860`.
5. Click **Deploy**.

### Render
1. Fork or push this repository to GitHub/GitLab.
2. Sign in to [Render.com](https://render.com) and click **New + Web Service**.
3. Connect your repository.
4. Set:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: Free or Starter
   - **Health Check Path**: `/health`
5. Click **Create Web Service**. Render builds the frontend and backend automatically into one container.

### Railway
1. Go to [Railway.app](https://railway.app) and create a **New Project**.
2. Select **Deploy from GitHub repo**.
3. Railway automatically detects the `Dockerfile` at the root and deploys your unified server.
4. Add environment variables in Railway's Settings tab (`APP_ENV=production`, `PORT=8000`).

### DigitalOcean / AWS / GCP
1. Use DigitalOcean App Platform or AWS App Runner.
2. Select **Container / Dockerfile**.
3. Port: `8000`.
4. Add custom domain with SSL auto-provisioning.

---

## 5. Progressive Web App (PWA) / "Download as App"

FinanceAI is fully configured as an installable standalone application (PWA).

### How to Install:
- **Desktop (Chrome / Edge / Brave)**:
  - Click the **"Download App"** button located in the top navigation bar.
  - Or click the install icon (`➕` or `🖥️`) that appears on the right side of the browser URL bar.
  - The app will install as an independent desktop window with native OS window controls, zero browser chrome, and its own taskbar shortcut.
- **Mac (Safari)**:
  - Click **File** > **Add to Dock...**.
- **Mobile (iOS Safari)**:
  - Tap the **Share** button (`⎙`) > **"Add to Home Screen"**.
- **Mobile (Android Chrome)**:
  - Tap the 3 dots menu > **"Install App"** or tap the prompt banner.

---

## 6. Authentication, User & Admin Profiles

### Demo Accounts
FinanceAI comes pre-configured with two ready-to-test authentication profiles:

| Account Type | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Institutional Admin** | `admin@financeai.com` | `admin123` | `Administrator` | Full system telemetry, cache flushing, user management |
| **Senior Quant Analyst** | `analyst@financeai.com` | `analyst123` | `Quant Analyst` | Portfolio analysis, unlimited forecasting, research reports |

### Profile Features
- **User Panel**: View API quota usage, subscription tier (Institutional Pro), security clearance level, and profile settings.
- **Admin Console**: Real-time system health metrics (CPU, RAM, DB Record count), system cache flusher, and active user directory.
- **Header Avatar Menu**: Displays currently signed-in user with instant role badge and one-click logout.

---

## 7. Environment Configuration Reference

The `.env` file supports the following options:

```bash
# Core Settings
APP_NAME=FinanceAI
APP_ENV=production
DEBUG=false
SECRET_KEY=your-production-secret-key-change-me

# CORS Configuration
CORS_ORIGINS=["http://localhost:5173","http://localhost:8000","https://yourdomain.com"]

# Database
DATABASE_URL=sqlite:///./financeai.db
# For production PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/financeaidb

# AI / LLM Providers (Optional)
LLM_PROVIDER=mock          # Options: 'mock', 'groq', 'openai', 'ollama'
GROQ_API_KEY=              # Optional
OPENAI_API_KEY=            # Optional
OLLAMA_BASE_URL=http://localhost:11434

# Market Data API Keys (Optional - yfinance works without keys)
ALPHA_VANTAGE_API_KEY=
FMP_API_KEY=
FRED_API_KEY=
```

---

## Credits
**Developed by Vishnu Singh**
FinanceAI Platform v2.4.0 — All rights reserved.
