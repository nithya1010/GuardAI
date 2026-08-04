import { useState } from 'react'

const alerts = [
  {
    id: 'INC-0847', severity: 'critical', title: 'GPU-NODE-01 Thermal Critical',
    desc: 'GPU temperature at 88°C, approaching shutdown threshold of 95°C. Thermal throttling active. Cooling Unit 3-B efficiency degraded.',
    server: 'GPU-NODE-01', time: '2 minutes ago', timestamp: '14:23:41',
    status: 'active', ai: 'Immediate cooling intervention required. Migrate workloads to GPU-NODE-03.',
    tags: ['thermal', 'hardware', 'gpu'],
  },
  {
    id: 'INC-0846', severity: 'high', title: 'DB-MASTER-01 Memory Pressure',
    desc: 'Memory utilization at 85%. Connection pool approaching saturation. Query execution times elevated by 340ms average.',
    server: 'DB-MASTER-01', time: '14 minutes ago', timestamp: '14:11:18',
    status: 'active', ai: 'Query optimization and connection pool tuning recommended. Add read replica to distribute load.',
    tags: ['database', 'memory', 'performance'],
  },
  {
    id: 'INC-0845', severity: 'high', title: 'STORAGE-01 Capacity Warning',
    desc: 'Disk utilization reached 91%. At current growth rate, full capacity will be reached in approximately 68 hours.',
    server: 'STORAGE-01', time: '1 hour ago', timestamp: '13:26:05',
    status: 'acknowledged', ai: 'Provision additional 4TB volume. Archive data older than 90 days to cold storage.',
    tags: ['storage', 'capacity'],
  },
  {
    id: 'INC-0844', severity: 'medium', title: 'DB-REPLICA-02 I/O Wait Elevated',
    desc: 'Disk I/O wait times are 340% above baseline. SSD write latency elevated to 18ms from normal 4ms.',
    server: 'DB-REPLICA-02', time: '2 hours ago', timestamp: '12:19:33',
    status: 'investigating', ai: 'Run SSD health diagnostics. Consider replacing drive if health score below 80%.',
    tags: ['database', 'disk', 'performance'],
  },
  {
    id: 'INC-0843', severity: 'medium', title: 'GPU-NODE-02 Queue Saturation',
    desc: 'ML inference queue depth at 847 requests. Processing rate unable to keep pace. P99 latency at 4.2s.',
    server: 'GPU-NODE-02', time: '3 hours ago', timestamp: '11:44:12',
    status: 'active', ai: 'Scale horizontally or implement request batching. GPU-NODE-03 has 55% available capacity.',
    tags: ['gpu', 'performance', 'queue'],
  },
  {
    id: 'INC-0842', severity: 'low', title: 'WEB-PROD-02 RAM Growth Trend',
    desc: 'Memory usage growing at 2.3% per hour. Potential memory leak in Node.js process detected via heap analysis.',
    server: 'WEB-PROD-02', time: '5 hours ago', timestamp: '09:31:08',
    status: 'monitoring', ai: 'Monitor heap allocation. Schedule rolling restart during off-peak hours if trend continues.',
    tags: ['web', 'memory', 'node'],
  },
  {
    id: 'INC-0841', severity: 'low', title: 'SSL Certificate Expiry Warning',
    desc: 'TLS certificate for api.guardai.io expires in 21 days. Auto-renewal configured but confirmation pending.',
    server: 'LOAD-BAL-01', time: '8 hours ago', timestamp: '06:18:44',
    status: 'resolved', ai: 'Verify auto-renewal configuration. Manual renewal available as fallback.',
    tags: ['security', 'ssl', 'certificate'],
  },
  {
    id: 'INC-0840', severity: 'critical', title: 'Network Partition Detected',
    desc: 'Temporary network partition between US-East-1a and US-West-2a zones. Duration: 23 seconds. Auto-recovered.',
    server: 'LOAD-BAL-02', time: '12 hours ago', timestamp: '02:07:19',
    status: 'resolved', ai: 'Post-incident analysis complete. Route table configuration updated to prevent recurrence.',
    tags: ['network', 'partition', 'resolved'],
  },
]

const severityConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  critical: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'CRITICAL' },
  high: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'HIGH' },
  medium: { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', label: 'MEDIUM' },
  low: { color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'LOW' },
}

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: '#EF4444', label: 'Active' },
  acknowledged: { color: '#F59E0B', label: 'Acknowledged' },
  investigating: { color: '#3B82F6', label: 'Investigating' },
  monitoring: { color: '#A855F7', label: 'Monitoring' },
  resolved: { color: '#10B981', label: 'Resolved' },
}

export default function Alerts() {
  const [sevFilter, setSevFilter] = useState('All')
  const [statusFilt, setStatusFilt] = useState('All')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = alerts.filter(a => {
    if (sevFilter !== 'All' && a.severity !== sevFilter.toLowerCase()) return false
    if (statusFilt !== 'All' && a.status !== statusFilt.toLowerCase()) return false
    return true
  })

  const counts = { critical: alerts.filter(a => a.severity === 'critical').length, high: alerts.filter(a => a.severity === 'high').length, medium: alerts.filter(a => a.severity === 'medium').length, low: alerts.filter(a => a.severity === 'low').length }

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Alerts & Incidents</h1>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>AI-triaged incident timeline · Real-time severity classification</p>
        </div>
        <button className="btn-primary" style={{ fontSize: 13, padding: '9px 18px' }}>Create Incident</button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {(['critical', 'high', 'medium', 'low'] as const).map(sev => {
          const cfg = severityConfig[sev]
          const countMap = { critical: counts.critical, high: counts.high, medium: counts.medium, low: counts.low }
          const displayLabel = sev.charAt(0).toUpperCase() + sev.slice(1)
          return (
            <div key={sev} className="glass-card" style={{ padding: '16px 18px', borderLeft: `3px solid ${cfg.color}`, cursor: 'pointer' }}
              onClick={() => setSevFilter(displayLabel === sevFilter ? 'All' : displayLabel)}>
              <div style={{ fontSize: 28, fontWeight: 900, color: cfg.color, fontFamily: "'JetBrains Mono', monospace" }}>{countMap[sev]}</div>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{displayLabel} Severity</div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => {
            const c = s.toLowerCase() === 'critical' ? '#EF4444' : s.toLowerCase() === 'high' ? '#F59E0B' : s.toLowerCase() === 'medium' ? '#3B82F6' : s.toLowerCase() === 'low' ? '#10B981' : '#60A5FA'
            return (
              <button key={s} onClick={() => setSevFilter(s)} style={{
                padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: sevFilter === s ? `${c}22` : 'transparent',
                color: sevFilter === s ? c : '#64748B',
                transition: 'all 0.15s',
              }}>{s}</button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
          {['All', 'Active', 'Acknowledged', 'Investigating', 'Resolved'].map(s => (
            <button key={s} onClick={() => setStatusFilt(s)} style={{
              padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: statusFilt === s ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: statusFilt === s ? '#F1F5F9' : '#64748B',
              transition: 'all 0.15s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Alert timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((alert, i) => {
          const sev = severityConfig[alert.severity]
          const st = statusConfig[alert.status]
          const isSelected = selected === alert.id

          return (
            <div key={alert.id}
              className="glass-card"
              onClick={() => setSelected(isSelected ? null : alert.id)}
              style={{
                padding: 18,
                borderLeft: `3px solid ${sev.color}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                animation: `fade-in 0.3s ease ${i * 0.04}s both`,
                background: isSelected ? `${sev.bg}` : undefined,
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '' }}
            >
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                {/* Severity dot */}
                <div style={{ marginTop: 2, flexShrink: 0 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', background: sev.color,
                    boxShadow: `0 0 8px ${sev.color}`,
                    animation: alert.status === 'active' && alert.severity === 'critical' ? 'pulse-red 1s infinite' : alert.status === 'active' ? 'pulse-orange 1.5s infinite' : undefined,
                  }} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#475569' }}>{alert.id}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
                      background: sev.bg, color: sev.color, border: `1px solid ${sev.border}`,
                    }}>{sev.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9' }}>{alert.title}</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 100,
                        background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}25`,
                      }}>{st.label}</span>
                      <span style={{ fontSize: 11, color: '#334155' }}>{alert.timestamp}</span>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 8px', fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{alert.desc}</p>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 100,
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B',
                    }}>📡 {alert.server}</span>
                    <span style={{ fontSize: 11, color: '#334155' }}>· {alert.time}</span>
                    {alert.tags.map(tag => (
                      <span key={tag} style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 100,
                        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', color: '#60A5FA',
                      }}>#{tag}</span>
                    ))}
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fade-in 0.2s ease' }}>
                      <div style={{
                        background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)',
                        borderRadius: 10, padding: 12, marginBottom: 12,
                      }}>
                        <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.08em', marginBottom: 4 }}>💡 AI RECOMMENDATION</div>
                        <div style={{ fontSize: 12, color: '#C4B5FD', lineHeight: 1.5 }}>{alert.ai}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {alert.status !== 'resolved' && (
                          <>
                            <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }}>Acknowledge</button>
                            <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>Investigate</button>
                            <button className="btn-secondary" style={{ fontSize: 12, padding: '7px 14px' }}>AI Auto-Fix</button>
                          </>
                        )}
                        <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }}>View Full Details</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
