import { useEffect, useState } from 'react'
import DigitalTwin from '../components/DigitalTwin'
import { deployInfrastructurePatch, generateExecutiveReport, runInfrastructureScan } from '../lib/guardaiApi'

const metricCards = [
  {
    label: 'CPU Usage', value: 47, unit: '%', trend: '+3.2%', trendUp: true,
    color: '#3B82F6', icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="6" y="6" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 2v2M12 2v2M8 16v2M12 16v2M2 8h2M2 12h2M16 8h2M16 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    sparkline: [23, 31, 28, 35, 41, 38, 47],
    status: 'normal',
  },
  {
    label: 'Memory', value: 63, unit: '%', trend: '+1.8%', trendUp: true,
    color: '#A855F7', icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="6" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 6V4M10 6V4M14 6V4M6 16v2M10 16v2M14 16v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M5 10h10" stroke="currentColor" strokeWidth="1" strokeDasharray="2 1" />
      </svg>
    ),
    sparkline: [55, 58, 60, 59, 62, 61, 63],
    status: 'normal',
  },
  {
    label: 'Disk I/O', value: 78, unit: '%', trend: '+12.4%', trendUp: true,
    color: '#F59E0B', icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    sparkline: [45, 52, 61, 58, 70, 74, 78],
    status: 'warning',
  },
  {
    label: 'Network', value: 2.4, unit: 'Gbps', trend: '-0.3', trendUp: false,
    color: '#22D3EE', icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 10h16M2 10l4-4M2 10l4 4M18 10l-4-4M18 10l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    sparkline: [3.1, 2.8, 2.9, 2.7, 2.5, 2.6, 2.4],
    status: 'normal',
  },
  {
    label: 'Temperature', value: 64, unit: '°C', trend: '+2°C', trendUp: true,
    color: '#EF4444', icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2v9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="10" cy="15" r="3" stroke="currentColor" strokeWidth="1.4" />
        <path d="M13 7h2M13 5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
    sparkline: [58, 60, 61, 63, 62, 65, 64],
    status: 'warning',
  },
  {
    label: 'Power Draw', value: 4.8, unit: 'kW', trend: '+0.2kW', trendUp: true,
    color: '#10B981', icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M11 2L4 11h7l-2 7 9-9h-7L11 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
    sparkline: [4.2, 4.4, 4.5, 4.6, 4.7, 4.7, 4.8],
    status: 'normal',
  },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const w = 80, h = 32
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
  const path = `M${points.join(' L')}`
  const fill = `M0,${h} L${points.join(' L')} L${w},${h} Z`

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#sg-${color})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2.5" fill={color} />
    </svg>
  )
}

const aiInsights = [
  { type: 'critical', icon: '🚨', text: 'GPU-NODE-01 thermal threshold breach in ~18 minutes. Immediate intervention required.' },
  { type: 'warning', icon: '⚠️', text: 'DB-MASTER-01 memory at 85%. Connection pool exhaustion risk within 4h.' },
  { type: 'info', icon: '🔮', text: 'AI model predicts 15% traffic spike between 14:00–16:00 UTC based on historical patterns.' },
  { type: 'success', icon: '✅', text: 'Auto-remediation applied: WEB-PROD-02 connection pool rebalanced successfully.' },
  { type: 'info', icon: '📊', text: 'STORAGE-01 at 91% capacity. Recommend adding 4TB volume within 72h to avoid service impact.' },
]

const quickActions = [
  { label: 'Run AI Scan', icon: '⚡', color: '#3B82F6', gradient: 'linear-gradient(135deg, #1D4ED8, #2563EB)' },
  { label: 'Generate Report', icon: '📋', color: '#A855F7', gradient: 'linear-gradient(135deg, #7C3AED, #A855F7)' },
  { label: 'Open Copilot', icon: '🤖', color: '#22D3EE', gradient: 'linear-gradient(135deg, #0891B2, #22D3EE)' },
  { label: 'Deploy Patch', icon: '🛡️', color: '#10B981', gradient: 'linear-gradient(135deg, #059669, #10B981)' },
]

export default function Dashboard({ onNavigate }: { onNavigate: (p: string) => void }) {
  const [uptime] = useState('99.97%')
  const [risk] = useState(28)
  const [aiTyping, setAiTyping] = useState(true)
  const [visibleInsight, setVisibleInsight] = useState(0)
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setAiTyping(false), 1200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setVisibleInsight(i => (i + 1) % aiInsights.length), 4000)
    return () => clearInterval(t)
  }, [])

  const handleQuickAction = async (label: string) => {
    setActiveAction(label)
    setActionMessage(null)

    try {
      if (label === 'Run AI Scan') {
        const result = await runInfrastructureScan()
        setActionMessage(`Scan complete: ${result.critical_nodes.length} critical node(s), ${result.warning_nodes.length} warning node(s).`)
        onNavigate('digital-twin')
        return
      }

      if (label === 'Generate Report') {
        const report = await generateExecutiveReport()
        setActionMessage(report.message)
        onNavigate('reports')
        return
      }

      if (label === 'Open Copilot') {
        onNavigate('copilot')
        setActionMessage('Copilot opened successfully.')
        return
      }

      if (label === 'Deploy Patch') {
        const patch = await deployInfrastructurePatch()
        setActionMessage(`${patch.message} Affected nodes: ${patch.affected_nodes.join(', ')}.`)
        onNavigate('servers')
      }
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Action failed unexpectedly.')
    } finally {
      setActiveAction(null)
    }
  }

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Hero row */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Welcome */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 4 }}>
            MONDAY, AUGUST 4, 2026
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Welcome back, <span className="text-gradient-blue">Administrator</span>
          </h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>
            Your infrastructure is under continuous AI surveillance. 1 critical issue requires attention.
          </p>
        </div>

        {/* KPI strip */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Uptime', value: uptime, color: '#10B981', sub: '30-day SLA' },
            { label: 'Risk Score', value: `${risk}`, color: risk > 60 ? '#EF4444' : risk > 30 ? '#F59E0B' : '#10B981', sub: 'AI Assessment' },
            { label: 'Active Nodes', value: '247', color: '#60A5FA', sub: '3 degraded' },
            { label: 'Alerts', value: '4', color: '#EF4444', sub: '1 critical' },
          ].map(kpi => (
            <div key={kpi.label} className="glass-card" style={{ padding: '14px 18px', textAlign: 'center', minWidth: 90 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, fontFamily: "'JetBrains Mono', monospace" }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#F1F5F9', marginTop: 2 }}>{kpi.label}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{kpi.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        {quickActions.map(a => (
          <button
            key={a.label}
            onClick={() => void handleQuickAction(a.label)}
            disabled={activeAction !== null}
            style={{
              background: a.gradient,
              border: `1px solid ${a.color}44`,
              borderRadius: 12,
              padding: '10px 18px',
              color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: `0 4px 20px ${a.color}33`,
              opacity: activeAction ? 0.72 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${a.color}55` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${a.color}33` }}
          >
            <span>{a.icon}</span>{a.label}
          </button>
        ))}
      </div>

      {actionMessage && (
        <div className="glass-card" style={{ padding: '10px 14px', borderLeft: '3px solid #22D3EE', color: '#C4B5FD', fontSize: 12 }}>
          {actionMessage}
        </div>
      )}

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, flex: 1 }}>

        {/* Left: Digital Twin */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>AI Digital Twin</h2>
                <span className="badge badge-cyan">LIVE</span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', boxShadow: '0 0 8px rgba(34,211,238,0.8)', display: 'inline-block' }} className="animate-blink" />
              </div>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#475569' }}>
                Real-time infrastructure map · Hover nodes for AI insights
              </p>
            </div>
            <button className="btn-ghost" onClick={() => onNavigate('digital-twin')} style={{ fontSize: 12 }}>
              Full Screen →
            </button>
          </div>
          <DigitalTwin />
        </div>

        {/* Right: AI Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* AI Copilot card */}
          <div className="glass-card animate-glow-border" style={{ padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 120, height: 120,
              background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 12px rgba(168,85,247,0.4)',
                fontSize: 14,
              }}>🤖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>AI Infrastructure Copilot</div>
                <div style={{ fontSize: 10, color: '#475569' }}>Powered by GuardAI Neural Engine v4.2</div>
              </div>
            </div>

            {/* Current insight */}
            <div style={{
              background: 'rgba(168,85,247,0.06)',
              border: '1px solid rgba(168,85,247,0.15)',
              borderRadius: 12, padding: 12, marginBottom: 12,
              fontSize: 12, color: '#C4B5FD', lineHeight: 1.6,
              minHeight: 60,
              transition: 'all 0.3s',
            }}>
              {aiTyping ? (
                <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#A855F7', animation: 'blink 0.6s infinite' }} />
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#A855F7', animation: 'blink 0.6s 0.2s infinite' }} />
                  <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#A855F7', animation: 'blink 0.6s 0.4s infinite' }} />
                </span>
              ) : (
                aiInsights[visibleInsight].text
              )}
            </div>

            {/* AI metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              {[
                { label: 'Confidence', value: '94.7%', color: '#10B981' },
                { label: 'Risks Detected', value: '7', color: '#F59E0B' },
                { label: 'Predictions', value: '12', color: '#60A5FA' },
                { label: 'Auto-fixed', value: '3', color: '#22D3EE' },
              ].map(m => (
                <div key={m.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 8, padding: '8px 10px',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{m.label}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => onNavigate('copilot')}
              style={{ width: '100%', padding: '10px', fontSize: 13 }}>
              Open Full Copilot →
            </button>
          </div>

          {/* Recent alerts */}
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Recent Alerts</span>
              <button className="btn-ghost" onClick={() => onNavigate('alerts')} style={{ padding: '4px 8px', fontSize: 11 }}>
                View all
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { sev: 'critical', msg: 'GPU-NODE-01 thermal critical', time: '2m ago' },
                { sev: 'warning', msg: 'DB-MASTER-01 high memory', time: '14m ago' },
                { sev: 'warning', msg: 'STORAGE-01 near capacity', time: '1h ago' },
                { sev: 'info', msg: 'AI auto-remediation applied', time: '2h ago' },
              ].map((alert, i) => {
                const colors: Record<string, string> = { critical: '#EF4444', warning: '#F59E0B', info: '#60A5FA' }
                const c = colors[alert.sev]
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px',
                    background: `${c}08`,
                    border: `1px solid ${c}22`,
                    borderRadius: 8,
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: c, flexShrink: 0, boxShadow: `0 0 6px ${c}` }} />
                    <span style={{ fontSize: 12, color: '#94A3B8', flex: 1, lineHeight: 1.3 }}>{alert.msg}</span>
                    <span style={{ fontSize: 10, color: '#334155', flexShrink: 0 }}>{alert.time}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {metricCards.map(card => (
          <div key={card.label} className="glass-card glass-card-hover" style={{ padding: 16, cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ color: card.color, opacity: 0.9 }}>{card.icon}</div>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 100,
                background: card.status === 'warning' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
                color: card.status === 'warning' ? '#FCD34D' : '#6EE7B7',
                border: `1px solid ${card.status === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`,
              }}>
                {card.status === 'warning' ? 'WARN' : 'OK'}
              </span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: card.color, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
              {card.value}<span style={{ fontSize: 12, opacity: 0.6 }}>{card.unit}</span>
            </div>
            <div style={{ fontSize: 11, color: '#64748B', margin: '4px 0 10px', fontWeight: 500 }}>{card.label}</div>
            <Sparkline data={card.sparkline} color={card.color} />
            <div style={{
              fontSize: 10, marginTop: 6, fontWeight: 600,
              color: card.trendUp ? (card.status === 'warning' ? '#F59E0B' : '#94A3B8') : '#10B981',
            }}>
              {card.trendUp ? '↑' : '↓'} {card.trend}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
