import { useState, useEffect } from 'react'

const heatmapData = Array.from({ length: 24 }, (_, h) =>
  Array.from({ length: 7 }, (_, d) => ({
    hour: h,
    day: d,
    value: Math.random() * 100,
  }))
).flat()

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function HeatCell({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v > 85) return `rgba(239,68,68,${0.4 + (v-85)/15 * 0.5})`
    if (v > 70) return `rgba(245,158,11,${0.3 + (v-70)/15 * 0.4})`
    if (v > 50) return `rgba(59,130,246,${0.2 + (v-50)/20 * 0.3})`
    return `rgba(16,185,129,${0.1 + v/50 * 0.2})`
  }
  return (
    <div style={{
      width: '100%', paddingBottom: '100%', position: 'relative', borderRadius: 2,
      background: getColor(value),
      border: `1px solid ${value > 85 ? 'rgba(239,68,68,0.2)' : 'transparent'}`,
      cursor: 'default',
      transition: 'transform 0.1s',
    }}
      title={`${value.toFixed(0)}%`}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.zIndex = '10' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0' }}
    />
  )
}

const networkNodes = [
  { id: 'US-EAST-1A', x: 30, y: 35, servers: 6, load: 67, healthy: true },
  { id: 'US-EAST-1B', x: 50, y: 25, servers: 4, load: 72, healthy: true },
  { id: 'US-EAST-1C', x: 70, y: 35, servers: 3, load: 58, healthy: true },
  { id: 'US-WEST-2A', x: 20, y: 65, servers: 5, load: 89, healthy: false },
  { id: 'US-WEST-2B', x: 40, y: 72, servers: 2, load: 61, healthy: true },
  { id: 'US-WEST-2C', x: 60, y: 65, servers: 3, load: 44, healthy: true },
  { id: 'EU-WEST-1', x: 80, y: 55, servers: 2, load: 33, healthy: true },
]

const networkEdges = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[5,6],[2,6]]

export default function Monitoring() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 80)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Infrastructure Monitoring</h1>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Live infrastructure map · Heatmaps · Network topology</p>
      </div>

      {/* Top metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {[
          { label: 'Bandwidth In', value: '2.4 Gbps', trend: '+12%', color: '#22D3EE' },
          { label: 'Bandwidth Out', value: '1.8 Gbps', trend: '+8%', color: '#3B82F6' },
          { label: 'Packet Loss', value: '0.002%', trend: '-0.001%', color: '#10B981' },
          { label: 'Latency p99', value: '4.2ms', trend: '+0.3ms', color: '#A855F7' },
          { label: 'Requests/sec', value: '48.7K', trend: '+2.1K', color: '#F59E0B' },
          { label: 'Error Rate', value: '0.08%', trend: '-0.02%', color: '#EF4444' },
        ].map(m => (
          <div key={m.label} className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#64748B', margin: '3px 0', fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: 10, color: m.trend.startsWith('-') && m.label !== 'Packet Loss' && m.label !== 'Error Rate' ? '#EF4444' : '#10B981' }}>{m.trend}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Network topology */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Network Topology</div>
          <div style={{ position: 'relative', height: 260, background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)', borderRadius: 12, overflow: 'hidden' }}>
            {/* Grid */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {networkEdges.map(([a, b], i) => {
                const na = networkNodes[a], nb = networkNodes[b]
                return (
                  <g key={i}>
                    <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(59,130,246,0.2)" strokeWidth="0.5" />
                    <circle r="1">
                      <animateMotion dur={`${2 + i * 0.4}s`} repeatCount="indefinite" path={`M${na.x},${na.y} L${nb.x},${nb.y}`} />
                      <animate attributeName="fill" values="#22D3EE;#3B82F6;#22D3EE" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                )
              })}
            </svg>

            {networkNodes.map(node => {
              const pulse = Math.sin(tick * 0.12 + node.x * 0.1) * 0.5 + 0.5
              const color = !node.healthy ? '#EF4444' : node.load > 80 ? '#F59E0B' : '#10B981'
              return (
                <div key={node.id} style={{
                  position: 'absolute',
                  left: `${node.x}%`, top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                }}>
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 12,
                    background: `rgba(${color === '#10B981' ? '16,185,129' : color === '#F59E0B' ? '245,158,11' : '239,68,68'},${0.1 + pulse * 0.05})`,
                    border: `1px solid ${color}55`,
                    boxShadow: `0 0 ${10 + pulse * 8}px ${color}44`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'default',
                    transition: 'box-shadow 0.1s',
                  }}>
                    <div style={{ fontSize: 8, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace", textAlign: 'center', lineHeight: 1.2 }}>
                      {node.id.split('-')[0]}<br/>{node.id.split('-').slice(1).join('-')}
                    </div>
                    <div style={{ fontSize: 9, color: color, fontWeight: 700 }}>{node.load}%</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            {networkNodes.slice(0, 3).map(n => (
              <div key={n.id} style={{ fontSize: 10, color: '#475569' }}>
                <div style={{ color: '#94A3B8', fontWeight: 500, fontFamily: "'JetBrains Mono', monospace", fontSize: 9 }}>{n.id}</div>
                <div>{n.servers} servers · {n.load}% load</div>
              </div>
            ))}
          </div>
        </div>

        {/* CPU heatmap */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>CPU Load Heatmap</div>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 14 }}>Hourly average across all nodes — last 7 days</div>

          {/* Heatmap grid */}
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
              {Array.from({ length: 24 }, (_, h) => (
                <div key={h} style={{ height: 9, fontSize: 8, color: '#334155', display: 'flex', alignItems: 'center', width: 20 }}>
                  {h % 4 === 0 ? `${h}h` : ''}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
                {days.map(d => (
                  <div key={d} style={{ fontSize: 8, color: '#475569', textAlign: 'center' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateRows: 'repeat(24, 9px)', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                {Array.from({ length: 24 }, (_, h) =>
                  Array.from({ length: 7 }, (_, d) => {
                    const cell = heatmapData.find(c => c.hour === h && c.day === d)
                    return <HeatCell key={`${h}-${d}`} value={cell?.value || 0} />
                  })
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 9, color: '#334155' }}>Low</span>
            {['rgba(16,185,129,0.3)', 'rgba(59,130,246,0.4)', 'rgba(245,158,11,0.5)', 'rgba(239,68,68,0.6)'].map((c, i) => (
              <div key={i} style={{ width: 20, height: 9, borderRadius: 2, background: c }} />
            ))}
            <span style={{ fontSize: 9, color: '#334155' }}>High</span>
          </div>
        </div>
      </div>

      {/* Traffic flow */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Live Traffic Flow</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {[
            { from: 'Internet', to: 'Load Balancer', rate: '12.4K/s', color: '#22D3EE' },
            { from: 'Load Balancer', to: 'Web Cluster', rate: '11.8K/s', color: '#3B82F6' },
            { from: 'Web Cluster', to: 'Cache Layer', rate: '8.9K/s', color: '#A855F7' },
            { from: 'Web Cluster', to: 'Database', rate: '3.4K/s', color: '#F59E0B' },
            { from: 'Database', to: 'Storage', rate: '0.8K/s', color: '#10B981' },
          ].map((flow, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 6 }}>{flow.from}</div>
              <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: 2, background: `${flow.color}33`, borderRadius: 1 }} />
                <div style={{
                  position: 'absolute', left: `${((tick * 3 + i * 60) % 100)}%`,
                  width: 8, height: 8, borderRadius: '50%',
                  background: flow.color, boxShadow: `0 0 8px ${flow.color}`,
                  transform: 'translateX(-50%)',
                  transition: 'left 0.08s linear',
                }} />
                <div style={{
                  position: 'absolute',
                  background: `${flow.color}15`, border: `1px solid ${flow.color}33`,
                  borderRadius: 6, padding: '2px 6px',
                  fontSize: 10, color: flow.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                }}>
                  {flow.rate}
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 6 }}>{flow.to}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
