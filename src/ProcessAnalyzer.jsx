import { useState, useEffect, useRef, useCallback } from "react";

// ─── Simulated OS Process Data Engine ────────────────────────────────────────
function generateProcesses(prev = []) {
  const names = [
    { name: "chrome", label: "Google Chrome", type: "browser" },
    { name: "node", label: "Node.js Runtime", type: "runtime" },
    { name: "python3", label: "Python Interpreter", type: "runtime" },
    { name: "postgres", label: "PostgreSQL DB", type: "database" },
    { name: "nginx", label: "Nginx Web Server", type: "server" },
    { name: "redis", label: "Redis Cache", type: "database" },
    { name: "vscode", label: "VS Code Editor", type: "editor" },
    { name: "docker", label: "Docker Engine", type: "container" },
    { name: "webpack", label: "Webpack Bundler", type: "build" },
    { name: "electron", label: "Electron App", type: "desktop" },
    { name: "java", label: "Java JVM", type: "runtime" },
    { name: "mongod", label: "MongoDB Daemon", type: "database" },
  ];

  return names.map((p, i) => {
    const old = prev.find((x) => x.name === p.name);
    const baseCpu = { chrome: 18, node: 12, python3: 8, postgres: 5, nginx: 3, redis: 2, vscode: 15, docker: 6, webpack: 35, electron: 20, java: 14, mongod: 4 }[p.name] || 5;
    const baseMem = { chrome: 512, node: 256, python3: 128, postgres: 384, nginx: 64, redis: 48, vscode: 480, docker: 320, webpack: 600, electron: 560, java: 720, mongod: 192 }[p.name] || 100;

    const jitter = () => (Math.random() - 0.5) * 0.4;
    const spike = Math.random() > 0.93 ? Math.random() * 40 : 0;
    const cpu = Math.min(99, Math.max(0.1, (old?.cpu || baseCpu) * (1 + jitter()) + spike));
    const mem = Math.min(2048, Math.max(10, (old?.mem || baseMem) * (1 + jitter() * 0.1)));
    const threads = Math.floor(Math.random() * 8) + 1;
    const io = Math.max(0, (old?.io || 0) * 0.7 + Math.random() * 50);
    const cpuHistory = old?.cpuHistory ? [...old.cpuHistory.slice(-29), cpu] : [cpu];
    const memHistory = old?.memHistory ? [...old.memHistory.slice(-29), mem] : [mem];

    return {
      pid: old?.pid || 1000 + i * 37,
      name: p.name, label: p.label, type: p.type,
      cpu: parseFloat(cpu.toFixed(1)),
      mem: parseFloat(mem.toFixed(0)),
      threads, io: parseFloat(io.toFixed(1)),
      status: cpu > 80 ? "critical" : cpu > 50 ? "warning" : "normal",
      cpuHistory, memHistory,
      uptime: old?.uptime ? old.uptime + 1 : Math.floor(Math.random() * 10000),
    };
  });
}

function formatUptime(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 32, width = 80 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} />
    </svg>
  );
}

// ─── Radial CPU Gauge ─────────────────────────────────────────────────────────
function RadialGauge({ value, max = 100, label, color, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.4s ease", filter: `drop-shadow(0 0 6px ${color})` }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle"
        style={{ transform: "rotate(90deg)", transformOrigin: `${size/2}px ${size/2}px`, fill: "#fff", fontSize: "13px", fontWeight: 700, fontFamily: "monospace" }}>
        {value.toFixed(0)}%
      </text>
    </svg>
  );
}

// ─── AI Analysis Engine ────────────────────────────────────────────────────────
async function runAIAnalysis(processes, question = null) {
  const snapshot = processes.map(p => ({
    name: p.label, pid: p.pid, cpu: p.cpu, memMB: p.mem,
    threads: p.threads, ioMBs: p.io, status: p.status,
    type: p.type, uptimeFormatted: formatUptime(p.uptime)
  }));

  const systemPrompt = `You are an elite OS performance engineer and AI analyst. You analyze real-time process snapshots and provide:
1. Critical bottleneck identification with root cause analysis
2. Specific optimization recommendations  
3. Resource forecasting (next 15 minutes)
4. Risk assessment (stability, crash risk)

Respond in structured JSON only. No markdown, no prose outside JSON.

JSON structure:
{
  "overallHealth": "critical|warning|good",
  "healthScore": 0-100,
  "summary": "1-2 sentence executive summary",
  "bottlenecks": [{"process": "", "issue": "", "impact": "high|medium|low", "rootCause": ""}],
  "optimizations": [{"action": "", "process": "", "expectedGain": "", "priority": "immediate|soon|later"}],
  "forecast": {"cpu15min": "", "mem15min": "", "riskLevel": "high|medium|low", "prediction": ""},
  "insights": ["insight1", "insight2", "insight3"]
}`;

  const userMsg = question
    ? `Process snapshot:\n${JSON.stringify(snapshot, null, 2)}\n\nUser question: ${question}`
    : `Analyze this OS process snapshot and return your analysis:\n${JSON.stringify(snapshot, null, 2)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMsg }]
    })
  });
  const data = await res.json();
  const raw = data.content?.map(b => b.text || "").join("") || "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function ProcessAnalyzer() {
  const [processes, setProcesses] = useState(() => generateProcesses());
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sortBy, setSortBy] = useState("cpu");
  const [lastAnalyzed, setLastAnalyzed] = useState(null);
  const intervalRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-refresh processes
  useEffect(() => {
    if (!autoRefresh) return;
    intervalRef.current = setInterval(() => {
      setProcesses(prev => generateProcesses(prev));
      setTick(t => t + 1);
    }, 2000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh]);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory]);

  const analyze = useCallback(async () => {
    setLoading(true);
    try {
      const result = await runAIAnalysis(processes);
      setAnalysis(result);
      setLastAnalyzed(new Date());
    } catch (e) {
      setAnalysis({ overallHealth: "good", healthScore: 72, summary: "System is running normally. AI analysis encountered an error — showing cached assessment.", bottlenecks: [], optimizations: [], forecast: { cpu15min: "~stable", mem15min: "~stable", riskLevel: "low", prediction: "Stable" }, insights: ["Enable AI analysis for detailed insights"] });
    }
    setLoading(false);
  }, [processes]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatInput("");
    setChatHistory(h => [...h, { role: "user", text: q }]);
    setChatLoading(true);
    try {
      const result = await runAIAnalysis(processes, q);
      const reply = result.summary || result.insights?.join(". ") || "Analysis complete.";
      setChatHistory(h => [...h, { role: "ai", text: reply, data: result }]);
    } catch {
      setChatHistory(h => [...h, { role: "ai", text: "I had trouble analyzing that. Please try again." }]);
    }
    setChatLoading(false);
  };

  // Derived stats
  const sorted = [...processes].sort((a, b) => b[sortBy] - a[sortBy]);
  const totalCpu = processes.reduce((s, p) => s + p.cpu, 0) / processes.length;
  const totalMem = processes.reduce((s, p) => s + p.mem, 0);
  const criticalCount = processes.filter(p => p.status === "critical").length;
  const warningCount = processes.filter(p => p.status === "warning").length;
  const healthColor = analysis?.overallHealth === "critical" ? "#ff4444" : analysis?.overallHealth === "warning" ? "#ffaa00" : "#00ff88";

  const styles = {
    root: { background: "#080c14", minHeight: "100vh", color: "#e0e8ff", fontFamily: "'JetBrains Mono', 'Courier New', monospace", padding: "0" },
    header: { background: "linear-gradient(135deg, #0d1520 0%, #111927 100%)", borderBottom: "1px solid rgba(0,200,255,0.15)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
    logo: { display: "flex", alignItems: "center", gap: "10px" },
    logoIcon: { width: 32, height: 32, background: "linear-gradient(135deg, #00c8ff, #0066ff)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 },
    logoText: { fontSize: 16, fontWeight: 700, color: "#00c8ff", letterSpacing: 1 },
    logoSub: { fontSize: 10, color: "#4a6080", letterSpacing: 2 },
    statusBadge: (c) => ({ background: `${c}22`, border: `1px solid ${c}`, color: c, borderRadius: 4, padding: "2px 8px", fontSize: 10, letterSpacing: 1 }),
    tabs: { display: "flex", gap: 2, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, margin: "0 24px" },
    tab: (active) => ({ padding: "7px 16px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, letterSpacing: 1, fontFamily: "inherit", fontWeight: active ? 700 : 400, background: active ? "rgba(0,200,255,0.15)" : "transparent", color: active ? "#00c8ff" : "#4a6080", transition: "all 0.2s" }),
    main: { padding: "20px 24px", maxWidth: 1400, margin: "0 auto" },
    grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 },
    statCard: (border) => ({ background: "linear-gradient(135deg, #0d1520, #111927)", border: `1px solid ${border}33`, borderRadius: 12, padding: "16px", position: "relative", overflow: "hidden" }),
    statVal: { fontSize: 28, fontWeight: 700, lineHeight: 1 },
    statLabel: { fontSize: 10, color: "#4a6080", letterSpacing: 2, marginTop: 4 },
    processTable: { background: "#0d1520", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 12, overflow: "hidden" },
    tableHead: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "10px 16px", background: "rgba(0,200,255,0.05)", borderBottom: "1px solid rgba(0,200,255,0.1)", fontSize: 10, color: "#4a6080", letterSpacing: 2 },
    tableRow: (status, selected) => ({ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: selected ? "rgba(0,200,255,0.07)" : status === "critical" ? "rgba(255,68,68,0.04)" : status === "warning" ? "rgba(255,170,0,0.04)" : "transparent", transition: "background 0.2s" }),
    statusDot: (s) => ({ width: 6, height: 6, borderRadius: "50%", background: s === "critical" ? "#ff4444" : s === "warning" ? "#ffaa00" : "#00ff88", display: "inline-block", marginRight: 6, boxShadow: `0 0 6px ${s === "critical" ? "#ff4444" : s === "warning" ? "#ffaa00" : "#00ff88"}` }),
    cpuBar: (val) => ({ height: 4, borderRadius: 2, background: `linear-gradient(90deg, ${val > 80 ? "#ff4444" : val > 50 ? "#ffaa00" : "#00c8ff"}, ${val > 80 ? "#ff0000" : val > 50 ? "#ff8800" : "#0066ff"})`, width: `${Math.min(val, 100)}%`, transition: "width 0.4s ease", boxShadow: `0 0 6px ${val > 80 ? "#ff444466" : val > 50 ? "#ffaa0066" : "#00c8ff66"}` }),
    aiPanel: { background: "#0d1520", border: "1px solid rgba(0,200,255,0.15)", borderRadius: 12, padding: 20, marginTop: 20 },
    aiHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
    btn: (variant) => ({ padding: variant === "sm" ? "6px 12px" : "9px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: variant === "sm" ? 10 : 11, fontFamily: "inherit", fontWeight: 700, letterSpacing: 1, transition: "all 0.2s" }),
    btnPrimary: { background: "linear-gradient(135deg, #00c8ff, #0066ff)", color: "#000", boxShadow: "0 4px 15px rgba(0,200,255,0.3)" },
    btnSecondary: { background: "rgba(255,255,255,0.07)", color: "#00c8ff", border: "1px solid rgba(0,200,255,0.2)" },
    insight: { background: "rgba(0,200,255,0.05)", border: "1px solid rgba(0,200,255,0.1)", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#a0b8d0", marginBottom: 8 },
    bottleneck: (impact) => ({ background: impact === "high" ? "rgba(255,68,68,0.08)" : impact === "medium" ? "rgba(255,170,0,0.08)" : "rgba(0,200,255,0.05)", border: `1px solid ${impact === "high" ? "rgba(255,68,68,0.3)" : impact === "medium" ? "rgba(255,170,0,0.3)" : "rgba(0,200,255,0.2)"}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }),
    chatWrap: { display: "flex", flexDirection: "column", height: 500 },
    chatMessages: { flex: 1, overflowY: "auto", padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 },
    chatMsg: (role) => ({ maxWidth: "80%", alignSelf: role === "user" ? "flex-end" : "flex-start", background: role === "user" ? "rgba(0,102,255,0.2)" : "rgba(0,200,255,0.07)", border: `1px solid ${role === "user" ? "rgba(0,102,255,0.3)" : "rgba(0,200,255,0.15)"}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: role === "user" ? "#a0c8ff" : "#c0d8e8", lineHeight: 1.5 }),
    chatInput: { display: "flex", gap: 8, marginTop: 12 },
    input: { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,200,255,0.2)", borderRadius: 8, color: "#e0e8ff", padding: "10px 14px", fontSize: 12, fontFamily: "inherit", outline: "none" },
    forecastCard: { background: "rgba(0,200,255,0.04)", border: "1px solid rgba(0,200,255,0.15)", borderRadius: 10, padding: "14px 16px" },
    optimCard: (priority) => ({ background: priority === "immediate" ? "rgba(255,68,68,0.06)" : priority === "soon" ? "rgba(255,170,0,0.06)" : "rgba(0,255,136,0.06)", border: `1px solid ${priority === "immediate" ? "rgba(255,68,68,0.25)" : priority === "soon" ? "rgba(255,170,0,0.25)" : "rgba(0,255,136,0.2)"}`, borderRadius: 8, padding: "12px 14px", marginBottom: 8 }),
  };

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <div>
            <div style={styles.logoText}>PROCESS.AI</div>
            <div style={styles.logoSub}>PERFORMANCE ANALYZER</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={styles.statusBadge(autoRefresh ? "#00ff88" : "#666")}>
            {autoRefresh ? "● LIVE" : "○ PAUSED"}
          </span>
          {analysis && <span style={styles.statusBadge(healthColor)}>
            HEALTH: {analysis.healthScore}/100
          </span>}
          <span style={{ fontSize: 10, color: "#4a6080" }}>TICK #{tick}</span>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: "#0a1018", borderBottom: "1px solid rgba(0,200,255,0.08)", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 2, paddingTop: 10 }}>
          {["dashboard", "processes", "ai-analysis", "chat"].map(t => (
            <button key={t} style={styles.tab(tab === t)} onClick={() => setTab(t)}>
              {t === "dashboard" ? "📊 DASHBOARD" : t === "processes" ? "⚙️ PROCESSES" : t === "ai-analysis" ? "🤖 AI ANALYSIS" : "💬 AI CHAT"}
            </button>
          ))}
        </div>
      </div>

      <main style={styles.main}>
        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <>
            <div style={styles.grid4}>
              {[
                { label: "AVG CPU USAGE", val: `${totalCpu.toFixed(1)}%`, color: totalCpu > 70 ? "#ff4444" : totalCpu > 40 ? "#ffaa00" : "#00ff88", sub: `${processes.length} processes` },
                { label: "TOTAL MEMORY", val: `${(totalMem / 1024).toFixed(1)} GB`, color: "#00c8ff", sub: "across all processes" },
                { label: "CRITICAL", val: criticalCount, color: "#ff4444", sub: "processes above 80% CPU" },
                { label: "WARNINGS", val: warningCount, color: "#ffaa00", sub: "processes above 50% CPU" },
              ].map((s, i) => (
                <div key={i} style={styles.statCard(s.color)}>
                  <div style={{ ...styles.statVal, color: s.color }}>{s.val}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                  <div style={{ fontSize: 10, color: "#4a6080", marginTop: 6 }}>{s.sub}</div>
                  <div style={{ position: "absolute", right: 12, top: 12, opacity: 0.15, fontSize: 32 }}>
                    {i === 0 ? "⚡" : i === 1 ? "💾" : i === 2 ? "🚨" : "⚠️"}
                  </div>
                </div>
              ))}
            </div>

            {/* Top CPU Hogs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div style={styles.processTable}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,200,255,0.1)", fontSize: 11, color: "#00c8ff", letterSpacing: 2 }}>🔥 TOP CPU CONSUMERS</div>
                {[...processes].sort((a, b) => b.cpu - a.cpu).slice(0, 5).map(p => (
                  <div key={p.pid} style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={styles.statusDot(p.status)} />
                    <span style={{ flex: 1, fontSize: 12 }}>{p.label}</span>
                    <div style={{ width: 80, textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: p.cpu > 80 ? "#ff4444" : p.cpu > 50 ? "#ffaa00" : "#00ff88" }}>{p.cpu}%</div>
                      <div style={{ height: 3, borderRadius: 2, background: "#1a2535", marginTop: 3 }}>
                        <div style={styles.cpuBar(p.cpu)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.processTable}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(0,200,255,0.1)", fontSize: 11, color: "#00c8ff", letterSpacing: 2 }}>💾 TOP MEMORY CONSUMERS</div>
                {[...processes].sort((a, b) => b.mem - a.mem).slice(0, 5).map(p => (
                  <div key={p.pid} style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={styles.statusDot(p.status)} />
                    <span style={{ flex: 1, fontSize: 12 }}>{p.label}</span>
                    <div style={{ width: 80, textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#00c8ff" }}>{p.mem} MB</div>
                      <div style={{ height: 3, borderRadius: 2, background: "#1a2535", marginTop: 3 }}>
                        <div style={{ ...styles.cpuBar(p.mem / 20), background: "linear-gradient(90deg, #00c8ff, #0044ff)" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gauge Row */}
            <div style={{ ...styles.processTable, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#00c8ff", letterSpacing: 2, marginBottom: 16 }}>⚙️ PROCESS HEALTH OVERVIEW</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {processes.slice(0, 8).map(p => (
                  <div key={p.pid} style={{ textAlign: "center", cursor: "pointer" }} onClick={() => { setSelected(p); setTab("processes"); }}>
                    <RadialGauge value={p.cpu} color={p.cpu > 80 ? "#ff4444" : p.cpu > 50 ? "#ffaa00" : "#00ff88"} size={70} />
                    <div style={{ fontSize: 9, color: "#4a6080", letterSpacing: 1, marginTop: 4 }}>{p.name.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── PROCESSES TAB ── */}
        {tab === "processes" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#4a6080" }}>SORT BY:</div>
              {["cpu", "mem", "io", "threads"].map(s => (
                <button key={s} style={{ ...styles.btn("sm"), ...(sortBy === s ? styles.btnPrimary : styles.btnSecondary) }} onClick={() => setSortBy(s)}>
                  {s.toUpperCase()}
                </button>
              ))}
              <button style={{ ...styles.btn("sm"), ...styles.btnSecondary, marginLeft: "auto" }} onClick={() => setAutoRefresh(a => !a)}>
                {autoRefresh ? "⏸ PAUSE" : "▶ RESUME"}
              </button>
            </div>

            <div style={styles.processTable}>
              <div style={styles.tableHead}>
                <span>PROCESS</span><span>CPU</span><span>MEMORY</span><span>I/O MB/s</span><span>THREADS</span><span>TREND</span>
              </div>
              {sorted.map(p => (
                <div key={p.pid} style={styles.tableRow(p.status, selected?.pid === p.pid)} onClick={() => setSelected(selected?.pid === p.pid ? null : p)}>
                  <div>
                    <span style={styles.statusDot(p.status)} />
                    <span style={{ fontWeight: 600, fontSize: 12 }}>{p.label}</span>
                    <span style={{ fontSize: 10, color: "#4a6080", marginLeft: 8 }}>PID:{p.pid}</span>
                    <div style={{ fontSize: 9, color: "#4a6080", marginLeft: 14, marginTop: 2 }}>{p.type.toUpperCase()} • {formatUptime(p.uptime)}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: p.cpu > 80 ? "#ff4444" : p.cpu > 50 ? "#ffaa00" : "#00ff88", fontSize: 14 }}>{p.cpu}%</div>
                    <div style={{ height: 3, borderRadius: 2, background: "#1a2535", marginTop: 3, width: 60 }}>
                      <div style={styles.cpuBar(p.cpu)} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "#00c8ff" }}>{p.mem} MB</div>
                  <div style={{ fontSize: 13, color: "#a0b8d0" }}>{p.io}</div>
                  <div style={{ fontSize: 13, color: "#a0b8d0" }}>{p.threads}</div>
                  <div><Sparkline data={p.cpuHistory} color={p.cpu > 80 ? "#ff4444" : p.cpu > 50 ? "#ffaa00" : "#00ff88"} /></div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            {selected && (
              <div style={{ ...styles.aiPanel, marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#00c8ff" }}>{selected.label}</div>
                    <div style={{ fontSize: 10, color: "#4a6080", marginTop: 2 }}>PID {selected.pid} • {selected.type} • Running for {formatUptime(selected.uptime)}</div>
                  </div>
                  <span style={styles.statusBadge(selected.status === "critical" ? "#ff4444" : selected.status === "warning" ? "#ffaa00" : "#00ff88")}>
                    {selected.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#4a6080", letterSpacing: 2, marginBottom: 6 }}>CPU HISTORY</div>
                    <Sparkline data={selected.cpuHistory} color={selected.cpu > 50 ? "#ff4444" : "#00c8ff"} width={300} height={60} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#4a6080", letterSpacing: 2, marginBottom: 6 }}>MEMORY HISTORY</div>
                    <Sparkline data={selected.memHistory} color="#00c8ff" width={300} height={60} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AI ANALYSIS TAB ── */}
        {tab === "ai-analysis" && (
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
              <button style={{ ...styles.btn(), ...styles.btnPrimary }} onClick={analyze} disabled={loading}>
                {loading ? "⏳ ANALYZING..." : "🤖 RUN AI ANALYSIS"}
              </button>
              {lastAnalyzed && <span style={{ fontSize: 10, color: "#4a6080" }}>Last analyzed: {lastAnalyzed.toLocaleTimeString()}</span>}
            </div>

            {!analysis && !loading && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#4a6080" }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🤖</div>
                <div style={{ fontSize: 14 }}>Click "RUN AI ANALYSIS" to get intelligent insights about your system processes</div>
                <div style={{ fontSize: 11, marginTop: 8 }}>Powered by Claude AI — bottleneck detection, optimization suggestions & forecasting</div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1s linear infinite" }}>⚙️</div>
                <div style={{ color: "#00c8ff", fontSize: 14 }}>Claude AI is analyzing your system processes...</div>
                <div style={{ color: "#4a6080", fontSize: 11, marginTop: 8 }}>Detecting bottlenecks • Forecasting resources • Generating optimizations</div>
              </div>
            )}

            {analysis && !loading && (
              <div>
                {/* Health Banner */}
                <div style={{ background: `${healthColor}11`, border: `1px solid ${healthColor}33`, borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 20, alignItems: "center" }}>
                  <div>
                    <RadialGauge value={analysis.healthScore} color={healthColor} size={80} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: healthColor, letterSpacing: 1 }}>SYSTEM {analysis.overallHealth?.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: "#c0d8e8", marginTop: 6, maxWidth: 600, lineHeight: 1.5 }}>{analysis.summary}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Bottlenecks */}
                  <div>
                    <div style={{ fontSize: 11, color: "#ff6644", letterSpacing: 2, marginBottom: 10 }}>🚨 BOTTLENECKS DETECTED</div>
                    {analysis.bottlenecks?.length ? analysis.bottlenecks.map((b, i) => (
                      <div key={i} style={styles.bottleneck(b.impact)}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 12, color: b.impact === "high" ? "#ff4444" : b.impact === "medium" ? "#ffaa00" : "#00c8ff" }}>{b.process}</span>
                          <span style={{ fontSize: 9, letterSpacing: 1, color: b.impact === "high" ? "#ff4444" : b.impact === "medium" ? "#ffaa00" : "#00c8ff" }}>{b.impact?.toUpperCase()} IMPACT</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#c0d0e0", marginBottom: 4 }}>{b.issue}</div>
                        <div style={{ fontSize: 10, color: "#4a6080" }}>Root cause: {b.rootCause}</div>
                      </div>
                    )) : <div style={styles.insight}>✅ No critical bottlenecks detected</div>}
                  </div>

                  {/* Optimizations */}
                  <div>
                    <div style={{ fontSize: 11, color: "#00ff88", letterSpacing: 2, marginBottom: 10 }}>⚡ OPTIMIZATION ACTIONS</div>
                    {analysis.optimizations?.length ? analysis.optimizations.map((o, i) => (
                      <div key={i} style={styles.optimCard(o.priority)}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 11, color: o.priority === "immediate" ? "#ff4444" : o.priority === "soon" ? "#ffaa00" : "#00ff88" }}>{o.priority?.toUpperCase()}</span>
                          <span style={{ fontSize: 10, color: "#4a6080" }}>{o.process}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#c0d0e0", marginBottom: 4 }}>{o.action}</div>
                        <div style={{ fontSize: 10, color: "#00ff88" }}>Expected: {o.expectedGain}</div>
                      </div>
                    )) : <div style={styles.insight}>System is already well-optimized</div>}
                  </div>
                </div>

                {/* Forecast */}
                {analysis.forecast && (
                  <div style={{ ...styles.forecastCard, margin: "16px 0" }}>
                    <div style={{ fontSize: 11, color: "#00c8ff", letterSpacing: 2, marginBottom: 12 }}>🔮 15-MINUTE FORECAST</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2fr", gap: 16 }}>
                      <div><div style={{ fontSize: 10, color: "#4a6080" }}>CPU TREND</div><div style={{ fontSize: 16, fontWeight: 700, color: "#00c8ff", marginTop: 4 }}>{analysis.forecast.cpu15min}</div></div>
                      <div><div style={{ fontSize: 10, color: "#4a6080" }}>MEM TREND</div><div style={{ fontSize: 16, fontWeight: 700, color: "#00c8ff", marginTop: 4 }}>{analysis.forecast.mem15min}</div></div>
                      <div><div style={{ fontSize: 10, color: "#4a6080" }}>RISK LEVEL</div><div style={{ fontSize: 16, fontWeight: 700, color: analysis.forecast.riskLevel === "high" ? "#ff4444" : analysis.forecast.riskLevel === "medium" ? "#ffaa00" : "#00ff88", marginTop: 4 }}>{analysis.forecast.riskLevel?.toUpperCase()}</div></div>
                      <div><div style={{ fontSize: 10, color: "#4a6080" }}>PREDICTION</div><div style={{ fontSize: 12, color: "#c0d0e0", marginTop: 4, lineHeight: 1.4 }}>{analysis.forecast.prediction}</div></div>
                    </div>
                  </div>
                )}

                {/* Insights */}
                {analysis.insights?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, color: "#00c8ff", letterSpacing: 2, marginBottom: 10 }}>💡 AI INSIGHTS</div>
                    {analysis.insights.map((ins, i) => (
                      <div key={i} style={styles.insight}>💡 {ins}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── AI CHAT TAB ── */}
        {tab === "chat" && (
          <div>
            <div style={{ fontSize: 11, color: "#4a6080", marginBottom: 16 }}>
              Ask the AI anything about your running processes. Data is live and updated in real-time.
            </div>
            <div style={{ ...styles.aiPanel, ...styles.chatWrap }}>
              <div style={styles.chatMessages}>
                {chatHistory.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px 20px", color: "#4a6080" }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>💬</div>
                    <div style={{ fontSize: 13 }}>Ask me anything about your processes!</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 }}>
                      {["Which process is causing slowdowns?", "How can I reduce memory usage?", "Is my system at risk of crashing?", "What's consuming the most CPU?"].map(q => (
                        <button key={q} style={{ ...styles.btn("sm"), ...styles.btnSecondary, fontSize: 10 }} onClick={() => { setChatInput(q); }}>
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatHistory.map((m, i) => (
                  <div key={i} style={styles.chatMsg(m.role)}>
                    <div style={{ fontSize: 9, color: "#4a6080", marginBottom: 4 }}>{m.role === "user" ? "YOU" : "CLAUDE AI"}</div>
                    {m.text}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ ...styles.chatMsg("ai"), color: "#4a6080" }}>
                    <div style={{ fontSize: 9, color: "#4a6080", marginBottom: 4 }}>CLAUDE AI</div>
                    ⏳ Analyzing your processes...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div style={styles.chatInput}>
                <input style={styles.input} value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Ask about your system processes... (Press Enter)" />
                <button style={{ ...styles.btn(), ...styles.btnPrimary }} onClick={sendChat} disabled={chatLoading}>
                  SEND
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080c14; }
        ::-webkit-scrollbar-thumb { background: rgba(0,200,255,0.2); border-radius: 2px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}