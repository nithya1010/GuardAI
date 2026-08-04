import { useEffect, useState } from 'react'
import { connectToServer, createServer, deleteServer, diagnoseServer, fetchServerLogs, listServers, type GuardAIServer } from '../lib/guardaiApi'

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
  const [servers, setServers] = useState<GuardAIServer[]>([])
  const [loading, setLoading] = useState(true)
  const [busyAction, setBusyAction] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newServer, setNewServer] = useState({ name: '', cluster: 'Web', ip: '', location: 'US-East-1a' })

  const loadServers = async (nextFilter = filter, nextStatus = statusFilter, nextSearch = search) => {
    setLoading(true)
    try {
      const data = await listServers({ cluster: nextFilter, status: nextStatus, query: nextSearch })
      setServers(data)
      setExpanded(current => (current && data.some(server => server.id === current) ? current : data[0]?.id ?? null))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadServers()
  }, [filter, statusFilter])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadServers(filter, statusFilter, search)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [search])

  const handleAddServer = async () => {
    if (!newServer.name.trim() || !newServer.cluster.trim() || !newServer.ip.trim()) {
      setStatusMessage('Name, cluster, and IP are required to add a server.')
      return
    }

    setBusyAction('add')
    setStatusMessage(null)

    try {
      const created = await createServer(newServer)
      setStatusMessage(`Server ${created.id} added successfully.`)
      setShowAddForm(false)
      setNewServer({ name: '', cluster: 'Web', ip: '', location: 'US-East-1a' })
      await loadServers()
      setExpanded(created.id)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Failed to add server.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleServerAction = async (server: GuardAIServer, action: 'ssh' | 'logs' | 'diagnose' | 'remove') => {
    setBusyAction(`${action}:${server.id}`)
    setStatusMessage(null)

    try {
      if (action === 'ssh') {
        const response = await connectToServer(server.id)
        setStatusMessage(`${response.connection_string} | ${response.note}`)
      } else if (action === 'logs') {
        const response = await fetchServerLogs(server.id)
        setStatusMessage(response.log_lines.join(' | '))
      } else if (action === 'remove') {
        const confirmed = window.confirm(`Remove ${server.id} from the fleet?`)
        if (!confirmed) {
          setStatusMessage('Server removal cancelled.')
          return
        }

        const response = await deleteServer(server.id)
        setStatusMessage(`${response.server_id} removed successfully.`)
        await loadServers()
      } else {
        const response = await diagnoseServer(server.id)
        setStatusMessage(`${response.verdict.toUpperCase()}: ${response.recommendation}`)
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Server action failed.')
    } finally {
      setBusyAction(null)
    }
  }

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
          <button className="btn-primary" onClick={() => setShowAddForm(v => !v)} style={{ padding: '8px 16px', fontSize: 13 }}>+ Add Server</button>
        </div>
      </div>

      {statusMessage && (
        <div className="glass-card" style={{ marginBottom: 16, padding: '10px 14px', borderLeft: '3px solid #22D3EE', color: '#C4B5FD', fontSize: 12 }}>
          {statusMessage}
        </div>
      )}

      {showAddForm && (
        <div className="glass-card" style={{ marginBottom: 16, padding: 16, display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>NAME</div>
            <input className="input-dark" value={newServer.name} onChange={e => setNewServer(v => ({ ...v, name: e.target.value }))} placeholder="NEW-SERVER-01" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>CLUSTER</div>
            <select className="input-dark" value={newServer.cluster} onChange={e => setNewServer(v => ({ ...v, cluster: e.target.value }))}>
              {clusters.filter(c => c !== 'All').map(cluster => <option key={cluster} value={cluster}>{cluster}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>IP</div>
            <input className="input-dark" value={newServer.ip} onChange={e => setNewServer(v => ({ ...v, ip: e.target.value }))} placeholder="10.0.9.10" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>LOCATION</div>
            <input className="input-dark" value={newServer.location} onChange={e => setNewServer(v => ({ ...v, location: e.target.value }))} placeholder="US-East-1a" />
          </div>
          <button className="btn-primary" disabled={busyAction === 'add'} onClick={() => void handleAddServer()} style={{ height: 36 }}>
            {busyAction === 'add' ? 'Adding...' : 'Create'}
          </button>
        </div>
      )}

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
        {loading && (
          <div className="glass-card" style={{ padding: 16, color: '#94A3B8' }}>Loading server inventory...</div>
        )}
        {servers.map(server => {
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
                    <button className="btn-secondary" onClick={e => { e.stopPropagation(); void handleServerAction(server, 'ssh') }} style={{ flex: 1, padding: '7px 10px', fontSize: 11 }}>SSH Connect</button>
                    <button className="btn-secondary" onClick={e => { e.stopPropagation(); void handleServerAction(server, 'logs') }} style={{ flex: 1, padding: '7px 10px', fontSize: 11 }}>View Logs</button>
                    <button className="btn-primary" onClick={e => { e.stopPropagation(); void handleServerAction(server, 'diagnose') }} style={{ flex: 1, padding: '7px 10px', fontSize: 11 }}>AI Diagnose</button>
                    <button className="btn-secondary" onClick={e => { e.stopPropagation(); void handleServerAction(server, 'remove') }} style={{ padding: '7px 10px', fontSize: 11, color: '#FCA5A5' }}>Remove</button>
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
