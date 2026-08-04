import { useEffect, useRef, useState } from 'react'
import { loadTopology, type GuardAINode, type GuardAIConnection, type GuardAITopology } from '../lib/guardaiApi'

interface Server {
  id: string
  name: string
  x: number
  y: number
  status: 'healthy' | 'warning' | 'critical'
  cpu: number
  ram: number
  temp: number
  disk: number
  power: number
  risk: number
  aiRecommendation: string
  cluster: string
}

const defaultServers: Server[] = [
  { id: 'web-01', name: 'WEB-PROD-01', x: 120, y: 100, status: 'healthy', cpu: 23, ram: 41, temp: 52, disk: 67, power: 340, risk: 8, aiRecommendation: 'Operating within optimal parameters.', cluster: 'Web' },
  { id: 'web-02', name: 'WEB-PROD-02', x: 190, y: 80, status: 'healthy', cpu: 31, ram: 58, temp: 56, disk: 43, power: 370, risk: 12, aiRecommendation: 'Minor RAM growth trend. Monitor over 24h.', cluster: 'Web' },
  { id: 'web-03', name: 'WEB-PROD-03', x: 155, y: 140, status: 'healthy', cpu: 19, ram: 37, temp: 49, disk: 55, power: 320, risk: 6, aiRecommendation: 'Lowest load in cluster. Consider rebalancing.', cluster: 'Web' },
  { id: 'db-01', name: 'DB-MASTER-01', x: 350, y: 90, status: 'warning', cpu: 78, ram: 85, temp: 72, disk: 82, power: 460, risk: 67, aiRecommendation: 'High memory pressure. Recommend query optimization and connection pooling review.', cluster: 'Database' },
  { id: 'db-02', name: 'DB-REPLICA-01', x: 420, y: 130, status: 'healthy', cpu: 34, ram: 61, temp: 58, disk: 71, power: 390, risk: 21, aiRecommendation: 'Replication lag within tolerance.', cluster: 'Database' },
  { id: 'db-03', name: 'DB-REPLICA-02', x: 390, y: 170, status: 'warning', cpu: 62, ram: 74, temp: 68, disk: 79, power: 430, risk: 55, aiRecommendation: 'I/O wait times elevated. SSD health check recommended.', cluster: 'Database' },
  { id: 'ai-01', name: 'GPU-NODE-01', x: 580, y: 80, status: 'critical', cpu: 96, ram: 92, temp: 88, disk: 94, power: 820, risk: 91, aiRecommendation: '🚨 CRITICAL: Thermal throttling imminent. Immediate cooling intervention required.', cluster: 'AI/ML' },
  { id: 'ai-02', name: 'GPU-NODE-02', x: 650, y: 120, status: 'warning', cpu: 81, ram: 79, temp: 76, disk: 68, power: 740, risk: 63, aiRecommendation: 'GPU utilization high. Queue saturation likely within 2h.', cluster: 'AI/ML' },
  { id: 'ai-03', name: 'GPU-NODE-03', x: 610, y: 165, status: 'healthy', cpu: 45, ram: 53, temp: 61, disk: 42, power: 560, risk: 28, aiRecommendation: 'Optimal state. Available for additional workloads.', cluster: 'AI/ML' },
  { id: 'cache-01', name: 'CACHE-REDIS-01', x: 260, y: 200, status: 'healthy', cpu: 15, ram: 88, temp: 44, disk: 12, power: 180, risk: 15, aiRecommendation: 'High memory usage is expected for cache workload.', cluster: 'Cache' },
  { id: 'cache-02', name: 'CACHE-REDIS-02', x: 320, y: 230, status: 'healthy', cpu: 12, ram: 82, temp: 42, disk: 10, power: 170, risk: 11, aiRecommendation: 'Normal operations.', cluster: 'Cache' },
  { id: 'lb-01', name: 'LOAD-BAL-01', x: 80, y: 220, status: 'healthy', cpu: 8, ram: 24, temp: 38, disk: 22, power: 120, risk: 5, aiRecommendation: 'Traffic distribution balanced across all upstreams.', cluster: 'Network' },
  { id: 'lb-02', name: 'LOAD-BAL-02', x: 490, y: 240, status: 'healthy', cpu: 11, ram: 28, temp: 40, disk: 25, power: 130, risk: 7, aiRecommendation: 'Active-Active configuration healthy.', cluster: 'Network' },
  { id: 'stor-01', name: 'STORAGE-01', x: 200, y: 290, status: 'warning', cpu: 44, ram: 55, temp: 63, disk: 91, power: 280, risk: 48, aiRecommendation: 'Disk at 91% capacity. Expand or archive within 72h.', cluster: 'Storage' },
  { id: 'stor-02', name: 'STORAGE-02', x: 440, y: 290, status: 'healthy', cpu: 29, ram: 42, temp: 51, disk: 63, power: 260, risk: 19, aiRecommendation: 'Storage metrics nominal.', cluster: 'Storage' },
]

const defaultConnections: [string, string][] = [
  ['lb-01', 'web-01'], ['lb-01', 'web-02'], ['lb-01', 'web-03'],
  ['web-01', 'db-01'], ['web-02', 'db-01'], ['web-03', 'db-02'],
  ['db-01', 'db-02'], ['db-01', 'db-03'], ['db-01', 'cache-01'],
  ['cache-01', 'cache-02'], ['cache-02', 'db-02'],
  ['web-01', 'cache-01'], ['web-02', 'cache-01'],
  ['lb-02', 'ai-01'], ['lb-02', 'ai-02'], ['lb-02', 'ai-03'],
  ['ai-01', 'ai-02'], ['ai-02', 'ai-03'],
  ['web-01', 'stor-01'], ['db-01', 'stor-01'], ['ai-01', 'stor-02'],
  ['stor-01', 'stor-02'],
]

const statusColors = { healthy: '#10B981', warning: '#F59E0B', critical: '#EF4444' }
const statusGlows = {
  healthy: '0 0 12px rgba(16,185,129,0.7)',
  warning: '0 0 12px rgba(245,158,11,0.7)',
  critical: '0 0 16px rgba(239,68,68,0.9)',
}

function ServerTooltip({ server, x, y }: { server: Server; x: number; y: number }) {
  const color = statusColors[server.status]
  const metrics = [
    { label: 'CPU', value: server.cpu, unit: '%', color: server.cpu > 80 ? '#EF4444' : server.cpu > 60 ? '#F59E0B' : '#10B981' },
    { label: 'RAM', value: server.ram, unit: '%', color: server.ram > 85 ? '#EF4444' : server.ram > 70 ? '#F59E0B' : '#10B981' },
    { label: 'TEMP', value: server.temp, unit: '°C', color: server.temp > 80 ? '#EF4444' : server.temp > 65 ? '#F59E0B' : '#10B981' },
    { label: 'DISK', value: server.disk, unit: '%', color: server.disk > 90 ? '#EF4444' : server.disk > 75 ? '#F59E0B' : '#10B981' },
    { label: 'POWER', value: server.power, unit: 'W', color: '#60A5FA' },
  ]

  return (
    <div className="tooltip" style={{ left: x + 20, top: y - 20, pointerEvents: 'none', zIndex: 200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', fontFamily: "'JetBrains Mono', monospace" }}>{server.name}</div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{server.cluster} Cluster</div>
        </div>
        <span style={{
          marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100,
          background: `${color}22`, color: color, border: `1px solid ${color}44`,
          textTransform: 'uppercase',
        }}>{server.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: 10 }}>
        {metrics.map(m => (
          <div key={m.label}>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.06em', marginBottom: 2 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                <div style={{
                  width: `${Math.min(100, (m.value / (m.unit === 'W' ? 10 : 1)))}%`,
                  height: '100%', borderRadius: 2, background: m.color, transition: 'width 0.3s',
                  maxWidth: '100%',
                }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: m.color, fontFamily: "'JetBrains Mono', monospace", minWidth: 36 }}>
                {m.value}{m.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
        <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.08em', marginBottom: 4 }}>AI RISK SCORE</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
            <div style={{
              width: `${server.risk}%`, height: '100%', borderRadius: 2,
              background: server.risk > 70 ? '#EF4444' : server.risk > 40 ? '#F59E0B' : '#10B981',
            }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: server.risk > 70 ? '#EF4444' : server.risk > 40 ? '#F59E0B' : '#10B981' }}>
            {server.risk}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
          💡 {server.aiRecommendation}
        </div>
      </div>
    </div>
  )
}

export default function DigitalTwin({ standalone = false }: { standalone?: boolean }) {
  const [topology, setTopology] = useState<GuardAITopology | null>(null)
  const [hoveredServer, setHoveredServer] = useState<Server | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [tick, setTick] = useState(0)
  const [scanY, setScanY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 100)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setScanY(y => (y + 1) % 100), 30)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    let active = true

    loadTopology()
      .then(data => {
        if (active) {
          setTopology(data)
        }
      })
      .catch(() => {
        if (active) {
          setTopology(null)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const servers = topology?.nodes ?? defaultServers
  const connections = topology?.connections.map(connection => [connection.source, connection.target] as [string, string]) ?? defaultConnections
  const serverMap = Object.fromEntries(servers.map(s => [s.id, s]))

  const getFlowOffset = (i: number) => ((tick * 2 + i * 30) % 200)

  const height = standalone ? 500 : 380
  const width = 760

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      background: 'radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.05) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)',
      borderRadius: 20,
      overflow: 'hidden',
      height,
      width: '100%',
    }}>
      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        borderRadius: 20,
      }} />

      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        top: `${scanY}%`,
        background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.15), rgba(59,130,246,0.3), rgba(34,211,238,0.15), transparent)',
        pointerEvents: 'none',
        zIndex: 5,
      }} />

      {/* Legend */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        display: 'flex', gap: 12,
      }}>
        {([['healthy', '#10B981', 'Healthy'], ['warning', '#F59E0B', 'Warning'], ['critical', '#EF4444', 'Critical']] as const).map(([s, c, l]) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}` }} />
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>

      {/* Cluster labels */}
      {[
        { label: 'WEB CLUSTER', x: 80, y: 48, color: '#60A5FA' },
        { label: 'DATABASE', x: 310, y: 48, color: '#C084FC' },
        { label: 'AI/ML COMPUTE', x: 538, y: 48, color: '#F59E0B' },
        { label: 'CACHE', x: 222, y: 165, color: '#22D3EE' },
        { label: 'STORAGE', x: 168, y: 258, color: '#94A3B8' },
      ].map(cl => (
        <div key={cl.label} style={{
          position: 'absolute', left: cl.x, top: cl.y,
          fontSize: 9, color: cl.color, letterSpacing: '0.12em', fontWeight: 700,
          opacity: 0.6,
          fontFamily: "'JetBrains Mono', monospace",
        }}>{cl.label}</div>
      ))}

      {/* SVG connections */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
        viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="edgeGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="edgeGradWarn" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow-filter">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {connections.map(([aId, bId], i) => {
          const a = serverMap[aId], b = serverMap[bId]
          if (!a || !b) return null
          const isCritical = a.status === 'critical' || b.status === 'critical'
          const isWarning = a.status === 'warning' || b.status === 'warning'
          const len = Math.hypot(b.x - a.x, b.y - a.y)
          const offset = getFlowOffset(i)
          const gradId = isCritical ? 'edgeGradWarn' : 'edgeGradBlue'
          const strokeC = isCritical ? 'rgba(239,68,68,0.5)' : isWarning ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.25)'

          return (
            <g key={`${aId}-${bId}`}>
              {/* Static edge */}
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={strokeC} strokeWidth={isCritical ? 1.5 : 1}
                strokeDasharray={isCritical ? '4,3' : undefined}
              />
              {/* Animated data packet */}
              <circle r={isCritical ? 3 : 2}
                fill={isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#22D3EE'}
                style={{ filter: `drop-shadow(0 0 ${isCritical ? 4 : 3}px ${isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#22D3EE'})` }}
              >
                <animateMotion dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
              </circle>
              {/* Second packet on some edges */}
              {i % 2 === 0 && (
                <circle r={1.5} fill="rgba(168,85,247,0.8)">
                  <animateMotion dur={`${2 + i * 0.2}s`} begin={`${(1 + i * 0.15)}s`} repeatCount="indefinite"
                    path={`M${b.x},${b.y} L${a.x},${a.y}`} />
                </circle>
              )}
            </g>
          )
        })}
      </svg>

      {/* Server nodes */}
      {servers.map(server => {
        const color = statusColors[server.status]
        const isHovered = hoveredServer?.id === server.id
        const pulse = Math.sin(tick * 0.15 + server.x * 0.02) * 0.5 + 0.5
        const size = isHovered ? 20 : 16

        return (
          <div
            key={server.id}
            onMouseEnter={e => {
              setHoveredServer(server)
              const rect = containerRef.current?.getBoundingClientRect()
              if (rect) {
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
              }
            }}
            onMouseMove={e => {
              const rect = containerRef.current?.getBoundingClientRect()
              if (rect) {
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
              }
            }}
            onMouseLeave={() => setHoveredServer(null)}
            style={{
              position: 'absolute',
              left: server.x - size / 2,
              top: server.y - size / 2,
              width: size, height: size,
              cursor: 'pointer',
              zIndex: 10,
              transition: 'width 0.2s, height 0.2s, left 0.2s, top 0.2s',
            }}
          >
            {/* Outer glow ring */}
            <div style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: `1px solid ${color}`,
              opacity: pulse * (isHovered ? 0.8 : 0.3),
              transition: 'opacity 0.1s',
            }} />
            {/* Pulse ripple for critical */}
            {server.status === 'critical' && (
              <div style={{
                position: 'absolute',
                inset: -12,
                borderRadius: '50%',
                border: '1px solid rgba(239,68,68,0.4)',
                animation: 'ripple 1.5s ease-out infinite',
              }} />
            )}
            {/* Main dot */}
            <div style={{
              width: '100%', height: '100%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color} 0%, ${color}88 60%, ${color}33 100%)`,
              border: `2px solid ${color}`,
              boxShadow: isHovered
                ? `0 0 20px ${color}, 0 0 40px ${color}66, inset 0 0 10px ${color}44`
                : `0 0 ${8 + pulse * 6}px ${color}, inset 0 0 6px ${color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'box-shadow 0.2s',
            }}>
              {/* Inner core */}
              <div style={{
                width: '40%', height: '40%',
                borderRadius: '50%',
                background: 'white',
                opacity: 0.8,
              }} />
            </div>
          </div>
        )
      })}

      {/* Tooltip */}
      {hoveredServer && (
        <ServerTooltip server={hoveredServer} x={tooltipPos.x} y={tooltipPos.y} />
      )}

      {/* Stats overlay */}
      <div style={{
        position: 'absolute', bottom: 12, right: 12, zIndex: 10,
        display: 'flex', gap: 8,
      }}>
        {[
          { label: 'HEALTHY', count: servers.filter(s => s.status === 'healthy').length, color: '#10B981' },
          { label: 'WARNING', count: servers.filter(s => s.status === 'warning').length, color: '#F59E0B' },
          { label: 'CRITICAL', count: servers.filter(s => s.status === 'critical').length, color: '#EF4444' },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '5px 10px',
            background: `${stat.color}11`,
            border: `1px solid ${stat.color}33`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {stat.count}
            </span>
            <span style={{ fontSize: 9, color: stat.color, opacity: 0.7, letterSpacing: '0.08em' }}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
