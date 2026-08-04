import { useState } from 'react'

const servers = [
  { id: 'WEB-PROD-01', cluster: 'Web', status: 'healthy', cpu: 23, ram: 41, disk: 67, temp: 52, power: 340, risk: 8, uptime: '99.99%', location: 'US-East-1a', ip: '10.0.1.11', ai: 'Operating within optimal parameters. No action required.' },
  { id: 'WEB-PROD-02', cluster: 'Web', status: 'healthy', cpu: 31, ram: 58, disk: 43, temp: 56, power: 370, risk: 12, uptime: '99.97%', location: 'US-East-1b', ip: '10.0.1.12', ai: 'Minor RAM growth trend. Monitor over next 24h period.' },
  { id: 'WEB-PROD-03', cluster: 'Web', status: 'healthy', cpu: 19, ram: 37, disk: 55, temp: 49, power: 320, risk: 6, uptime: '100%', location: 'US-East-1c', ip: '10.0.1.13', ai: 'Lowest load in cluster. Consider redistributing traffic.' },
  { id: 'DB-MASTER-01', cluster: 'Database', status: 'warning', cpu: 78, ram: 85, disk: 82, temp: 72, power: 460, risk: 67, uptime: '99.89%', location: 'US-East-1a', ip: '10.0.2.10', ai: 'High memory pressure detected. Recommend query optimization and connection pool review immediately.' },
  { id: 'DB-REPLICA-01', cluster: 'Database', status: 'healthy', cpu: 34, ram: 61, disk: 71, temp: 58, power: 390, risk: 21, uptime: '99.95%', location: 'US-East-1b', ip: '10.0.2.11', ai: 'Replication lag within acceptable tolerance. Normal operations.' },
  { id: 'DB-REPLICA-02', cluster: 'Database', status: 'warning', cpu: 62, ram: 74, disk: 79, temp: 68, power: 430, risk: 55, uptime: '99.91%', location: 'US-East-1c', ip: '10.0.2.12', ai: 'I/O wait times elevated. SSD health verification recommended within 24h.' },
  { id: 'GPU-NODE-01', cluster: 'AI/ML', status: 'critical', cpu: 96, ram: 92, disk: 94, temp: 88, power: 820, risk: 91, uptime: '98.12%', location: 'US-West-2a', ip: '10.0.3.10', ai: '🚨 CRITICAL: Thermal throttling imminent. Immediate cooling intervention required. Risk of hardware failure.' },
  { id: 'GPU-NODE-02', cluster: 'AI/ML', status: 'warning', cpu: 81, ram: 79, disk: 68, temp: 76, power: 740, risk: 63, uptime: '99.41%', location: 'US-West-2b', ip: '10.0.3.11', ai: 'GPU utilization critically high. Queue saturation expected within 2h at current trajectory.' },
  { id: 'GPU-NODE-03', cluster: 'AI/ML', status: 'healthy', cpu: 45, ram: 53, disk: 42, temp: 61, power: 560, risk: 28, uptime: '99.82%', location: 'US-West-2c', ip: '10.0.3.12', ai: 'Optimal state. Available capacity for additional AI workloads.' },
  { id: 'CACHE-REDIS-01', cluster: 'Cache', status: 'healthy', cpu: 15, ram: 88, disk: 12, temp: 44, power: 180, risk: 15, uptime: '100%', location: 'US-East-1a', ip: '10.0.4.10', ai: 'High memory is expected for cache workload. Hit ratio at 98.3% — excellent.' },
  { id: 'CACHE-REDIS-02', cluster: 'Cache', status: 'healthy', cpu: 12, ram: 82, disk: 10, temp: 42, power: 170, risk: 11, uptime: '100%', location: 'US-East-1b', ip: '10.0.4.11', ai: 'Normal operations. Standby replication healthy.' },
  { id: 'STORAGE-01', cluster: 'Storage', status: 'warning', cpu: 44, ram: 55, disk: 91, temp: 63, power: 280, risk: 48, uptime: '99.78%', location: 'US-East-1a', ip: '10.0.5.10', ai: 'Disk at 91% capacity. Add 4TB volume within 72h to prevent service degradation.' },
  { id: 'STORAGE-02', cluster: 'Storage', status: 'healthy', cpu: 29, ram: 42, disk: 63, temp: 51, power: 260, risk: 19, uptime: '99.96%', location: 'US-East-1c', ip: '10.0.5.11', ai: 'Storage metrics nominal. Capacity planning on schedule.' },
  { id: 'LOAD-BAL-01', cluster: 'Network', status: 'healthy', cpu: 8, ram: 24, disk: 22, temp: 38, power: 120, risk: 5, uptime: '100%', location: 'US-East-1a', ip: '10.0.6.10', ai: 'Traffic distribution balanced. All upstreams healthy.' },
  { id: 'LOAD-BAL-02', cluster: 'Network', status: 'healthy', cpu: 11, ram: 28, disk: 25, temp: 40, power: 130, risk: 7, uptime: '100%', location: 'US-West-2a', ip: '10.0.6.11', ai: 'Active-Active configuration operating correctly.' },
]

const clusters = ['All', 'Web', 'Database', 'AI/ML', 'Cache', 'Storage', 'Network']
const statusColors: Record<string, string> = { healthy: '#10B981', warning: '#F59E0B', critical: '#EF4444' }

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`, height: '100%', borderRadius: 2,
          background: value > 85 ? '#EF4444' : value > 70 ? '#F59E0B' : color,
          transition: 'width 0.5s ease',
        }} />
      </div>
      <span style={{ fontSize: 11, color: value > 85 ? '#EF4444' : value > 70 ? '#FCD34D' : '#94A3B8', fontFamily: "'JetBrains Mono', monospace", minWidth: 28, textAlign: 'right' }}>
        {value}%
      </span>
    </div>
  )
}

export default function Servers() {
  const [filter, setFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = servers.filter(s => {
    if (filter !== 'All' && s.cluster !== filter) return false
    if (statusFilter !== 'All' && s.status !== statusFilter.toLowerCase()) return false
    if (search && !s.id.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Server Fleet</h1>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
            {servers.length} servers · {servers.filter(s => s.status === 'critical').length} critical · {servers.filter(s => s.status === 'warning').length} warnings
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="input-dark" placeholder="Search servers..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 200, height: 36, fontSize: 13, borderRadius: 10 }} />
          <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>+ Add Server</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
          {clusters.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{
              padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: filter === c ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: filter === c ? '#60A5FA' : '#64748B',
              transition: 'all 0.15s',
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4 }}>
          {['All', 'Healthy', 'Warning', 'Critical'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
              background: statusFilter === s ? (s === 'Critical' ? 'rgba(239,68,68,0.15)' : s === 'Warning' ? 'rgba(245,158,11,0.15)' : s === 'Healthy' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)') : 'transparent',
              color: statusFilter === s ? (s === 'Critical' ? '#FCA5A5' : s === 'Warning' ? '#FCD34D' : s === 'Healthy' ? '#6EE7B7' : '#60A5FA') : '#64748B',
              transition: 'all 0.15s',
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Server cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(server => {
          const isExpanded = expanded === server.id
          const color = statusColors[server.status]
          return (
            <div
              key={server.id}
              className="glass-card"
              style={{
                padding: 18,
                border: `1px solid ${isExpanded ? color + '44' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isExpanded ? `0 0 20px ${color}22` : undefined,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
              onClick={() => setExpanded(isExpanded ? null : server.id)}
              onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)' }}
              onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
            >
              {/* Server header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', background: color,
                    boxShadow: `0 0 8px ${color}`,
                    flexShrink: 0,
                    animation: server.status === 'critical' ? 'pulse-red 1s infinite' : server.status === 'warning' ? 'pulse-orange 1.5s infinite' : 'pulse-green 2s infinite',
                  }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{server.id}</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{server.cluster} · {server.location}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
                    background: `${color}18`, color, border: `1px solid ${color}33`,
                    textTransform: 'uppercase',
                  }}>{server.status}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#475569' }}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' }}>
                  {[
                    { label: 'CPU', value: server.cpu, color: '#3B82F6' },
                    { label: 'RAM', value: server.ram, color: '#A855F7' },
                    { label: 'DISK', value: server.disk, color: '#F59E0B' },
                    { label: 'TEMP', value: server.temp, color: '#EF4444', unit: '°C', max: 100 },
                  ].map(m => (
                    <div key={m.label}>
                      <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.08em', marginBottom: 3, fontWeight: 600 }}>{m.label}</div>
                      <MiniBar value={m.unit ? Math.round(m.value) : m.value} color={m.color} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: '#475569', flexShrink: 0 }}>AI RISK</div>
                <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{
                    width: `${server.risk}%`, height: '100%', borderRadius: 2,
                    background: server.risk > 70 ? '#EF4444' : server.risk > 40 ? '#F59E0B' : '#10B981',
                  }} />
                </div>
                <span style={{
                  fontSize: 13, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace",
                  color: server.risk > 70 ? '#EF4444' : server.risk > 40 ? '#F59E0B' : '#10B981',
                  minWidth: 24,
                }}>{server.risk}</span>
                <div style={{ fontSize: 10, color: '#22D3EE' }}>↑ {server.uptime}</div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', animation: 'fade-in 0.2s ease' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px', marginBottom: 12 }}>
                    {[
                      ['IP Address', server.ip],
                      ['Power', `${server.power}W`],
                      ['Location', server.location],
                      ['Cluster', server.cluster],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.08em', marginBottom: 2 }}>{k}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{
                    background: `${color}08`,
                    border: `1px solid ${color}22`,
                    borderRadius: 8, padding: 10,
                  }}>
                    <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.08em', marginBottom: 4 }}>💡 AI RECOMMENDATION</div>
                    <div style={{ fontSize: 11, color: '#C4B5FD', lineHeight: 1.5 }}>{server.ai}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '7px 10px', fontSize: 11 }}>SSH Connect</button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '7px 10px', fontSize: 11 }}>View Logs</button>
                    <button className="btn-primary" style={{ flex: 1, padding: '7px 10px', fontSize: 11 }}>AI Diagnose</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
