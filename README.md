# 🤖 Process.AI — AI-Powered OS Process Performance Analyzer

> A real-time system process monitor powered by **Claude AI** that detects bottlenecks, suggests optimizations, and forecasts future resource requirements — all live in your browser.

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-Visit%20Site-00d4ff?style=for-the-badge)]([https://github.com/Prxtyush18/process-ai-analyzer](https://process-analyzer.netlify.app/))
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Claude AI](https://img.shields.io/badge/Claude%20AI-Anthropic-orange?style=flat)](https://anthropic.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://github.com/Prxtyush18/process-ai-analyzer)
[![GitHub](https://img.shields.io/badge/GitHub-Prxtyush18-181717?style=flat&logo=github&logoColor=white)](https://github.com/Prxtyush18/process-ai-analyzer)

---

## 📖 Problem Statement

> **Build a tool leveraging AI to analyze the performance of system processes in real-time. Highlight bottlenecks, suggest optimizations, and forecast future resource requirements.**

Real-world OS performance issues — CPU spikes, memory leaks, I/O bottlenecks — are hard to detect and even harder to explain. This tool makes them **visible**, **analyzable**, and **actionable** using Claude AI in a browser with zero setup.

Built as a project for **Operating Systems (B.Tech CSE)**.

---

## 🌐 Live Demo

**[[https://github.com/Prxtyush18/process-ai-analyzer](https://process-analyzer.netlify.app/)]**

---

## 🌐 How to Run Locally

```bash
# Clone the repository
git clone git@github.com:Prxtyush18/process-ai-analyzer.git

# Enter the project folder
cd process-ai-analyzer

# Open ProcessAnalyzer.jsx in Claude.ai Artifacts
# or set up a React environment:
npm install
npm start
```

Works in Chrome, Firefox, Edge, and Safari.

---

## 🚀 Features

| Feature | Description |
|---|---|
| **Live Process Monitoring** | 12 simulated OS processes with real-time CPU, Memory, I/O, and Thread data |
| **AI Bottleneck Detection** | Claude AI analyzes the full process snapshot and identifies root causes |
| **15-Minute Forecasting** | AI predicts future CPU and memory trends with risk level assessment |
| **Optimization Suggestions** | Prioritized action items — Immediate, Soon, Later — with expected gains |
| **Radial CPU Gauges** | Glow-effect SVG gauges showing per-process health at a glance |
| **Sparkline Trend Charts** | 30-tick CPU and memory history per process rendered in real-time SVG |
| **Conversational AI Chat** | Ask freeform questions about your processes — Claude responds with live data context |
| **Process Detail Panel** | Click any process to see full history, uptime, type, and status |
| **Auto-Refresh Engine** | Processes update every 2 seconds with realistic jitter and CPU spike simulation |
| **Sort and Filter** | Sort processes by CPU, Memory, I/O, or Threads instantly |

---

## 📁 Project Structure

```
process-ai-analyzer/
├── src/
│   ├── ProcessAnalyzer.jsx     # Main component — all tabs, simulation, AI integration
│   ├── DASHBOARD_NOTES.md      # Dashboard design documentation
│   ├── CHARTS_NOTES.md         # Sparkline chart documentation
│   ├── AI_NOTES.md             # Claude AI integration documentation
│   └── CHAT_NOTES.md           # AI chat interface documentation
├── .gitignore
└── README.md
```

---

## 🧠 AI Capabilities Implemented

### 1. Bottleneck Detection
Claude AI receives a full snapshot of all 12 processes and identifies which ones are causing performance degradation, with root cause analysis and impact level (High / Medium / Low).

### 2. Optimization Engine
AI returns prioritized optimization actions — what to do, which process to target, and what performance gain to expect.

### 3. Resource Forecasting
A 15-minute forward prediction of CPU trends, memory trends, and overall system risk level based on current process behaviour.

### 4. Conversational Analysis
Live process data is injected into every AI chat message as context — ask "which process is slowing my system?" and Claude answers based on real current data.

---

## 🎮 Dashboard Tabs

### 📊 Dashboard
- System-wide stats: Average CPU, Total Memory, Critical Count, Warning Count
- Top 5 CPU consumers and Top 5 Memory consumers
- Radial health gauges for all 8 major processes

### ⚙️ Processes
- Full sortable table of all 12 processes
- Columns: Process Name, CPU %, Memory MB, I/O MB/s, Threads, Sparkline Trend
- Click any row to expand detailed CPU and Memory history charts

### 🤖 AI Analysis
- One-click full system analysis via Claude AI
- Returns: Health Score, Summary, Bottlenecks, Optimizations, Forecast, Insights
- Color-coded panels: Red for critical, Amber for warnings, Green for healthy

### 💬 AI Chat
- Freeform conversation about your system
- Suggested starter questions for quick insights
- Full conversation history with timestamps

---

## 🔬 How It Works

### Process Simulation Engine
Instead of reading actual OS data, the engine uses a realistic simulation with base rates per process type and floating-point jitter to mimic real CPU and memory behaviour:

```js
const jitter = () => (Math.random() - 0.5) * 0.4;
const spike = Math.random() > 0.93 ? Math.random() * 40 : 0;
const cpu = Math.min(99, Math.max(0.1, (old?.cpu || baseCpu) * (1 + jitter()) + spike));
```

### AI Analysis Pipeline

```
Process Snapshot (12 processes)
        │
        ▼
Claude AI — /v1/messages endpoint
        │
        ▼
Structured JSON Response
{
  overallHealth, healthScore, summary,
  bottlenecks[], optimizations[],
  forecast{}, insights[]
}
        │
        ▼
UI renders results across panels
```

### Status Classification

```
CPU > 80%  →  CRITICAL  (red glow)
CPU > 50%  →  WARNING   (amber glow)
CPU ≤ 50%  →  NORMAL    (green glow)
```

### Architecture

```
┌──────────────────────────────────────────────────────┐
│                  USER INTERFACE LAYER                 │
│   Dashboard · Processes · AI Analysis · AI Chat       │
└───────────────────────┬──────────────────────────────┘
                        │  React State (useState)
                        ▼
┌──────────────────────────────────────────────────────┐
│              PROCESS SIMULATION ENGINE                │
│   generateProcesses() → jitter + spike + history      │
└───────────────────────┬──────────────────────────────┘
                        │  setInterval (2000ms)
                        ▼
┌──────────────────────────────────────────────────────┐
│                 CLAUDE AI LAYER                       │
│   runAIAnalysis() → /v1/messages → JSON parse         │
└───────────────────────┬──────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────┐
│              RENDER LAYER                             │
│   Sparklines · Gauges · Tables · Chat · Panels        │
└──────────────────────────────────────────────────────┘
```

---

## 🧪 Quick Demo Guide

### Step 1 — Live Monitoring
1. Open the app → Dashboard tab loads automatically
2. Watch CPU gauges update every 2 seconds
3. Red processes = critical (CPU > 80%), Amber = warning, Green = healthy

### Step 2 — Inspect a Process
1. Go to **Processes** tab
2. Click any row in the table
3. Sparkline history expands below showing CPU and memory trends

### Step 3 — Run AI Analysis
1. Go to **AI Analysis** tab
2. Click **RUN AI ANALYSIS**
3. Claude AI examines all 12 processes and returns bottlenecks, suggestions, and a 15-min forecast

### Step 4 — Chat with AI
1. Go to **AI Chat** tab
2. Click a suggested question or type your own
3. Claude answers based on your current live process data

---

## 🛠️ Tech Stack

- **React** — UI components, hooks, state management
- **Claude AI API** — Intelligence layer (bottleneck detection, forecasting, chat)
- **SVG** — Custom sparkline charts and radial CPU gauges
- **CSS-in-JS** — Inline styles with CSS variables for theming
- **JetBrains Mono** — Monospace font for terminal aesthetic
- **Git + GitHub** — Feature branches, 7 descriptive revisions
- **No extra dependencies** — Pure React + Claude API

---

## 📚 Concepts Covered

- OS process scheduling and resource management
- CPU utilisation, memory management, I/O throughput
- Performance bottleneck identification
- AI-powered root cause analysis
- Resource forecasting and trend prediction
- Real-time data visualisation (sparklines, gauges)
- React state management with hooks
- REST API integration (Anthropic Claude)

---

## 🔭 Future Scope

- **Real OS Integration** — Connect to `/proc` on Linux or Windows Performance Counters for actual process data instead of simulation
- **Process Kill/Priority Control** — Allow users to terminate or renice processes directly from the UI
- **Historical Playback** — Record process snapshots as JSON and replay frame-by-frame for post-mortem analysis
- **Alert System** — Email or push notifications when a process crosses critical thresholds
- **Export Reports** — One-click PDF of AI analysis, bottleneck report, and event log

---

## 📚 References

1. Silberschatz, Galvin, Gagne — *Operating System Concepts*, 10th ed., Wiley
2. Anthropic Claude API Docs — https://docs.anthropic.com
3. MDN Web Docs — React, SVG, CSS — https://developer.mozilla.org
4. Conventional Commits — https://www.conventionalcommits.org

---

## 👨‍💻 Author

**Pratyush Singh**
- Operating Systems — B.Tech CSE
- Roll- 61
- Registration Number - 12418055
- Lovely Professional University
- GitHub: [@Prxtyush18](https://github.com/Prxtyush18)
- Email: prxtyush18@gmail.com

---

*Process.AI v1.6 — Built for Operating Systems Academic Project*
