import { useEffect, useRef, useState } from 'react'
import { loadTopology, type GuardAITopology } from '../lib/guardaiApi'

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
  latency?: number
  risk: number
  aiRecommendation: string
  cluster: string
  lastUpdated?: string
}

const defaultServers: Server[] = [
  { id: 'web-01', name: 'WEB-PROD-01', x: 120, y: 100, status: 'healthy', cpu: 23, ram: 41, temp: 52, disk: 67, power: 340, latency: 12, risk: 8, aiRecommendation: 'Operating within optimal parameters.', cluster: 'Web', lastUpdated: 'Just now' },
  { id: 'web-02', name: 'WEB-PROD-02', x: 190, y: 80, status: 'healthy', cpu: 31, ram: 58, temp: 56, disk: 43, power: 370, latency: 15, risk: 12, aiRecommendation: 'Minor RAM growth trend. Monitor over 24h.', cluster: 'Web', lastUpdated: '2s ago' },
  { id: 'web-03', name: 'WEB-PROD-03', x: 155, y: 140, status: 'healthy', cpu: 19, ram: 37, temp: 49, disk: 55, power: 320, latency: 11, risk: 6, aiRecommendation: 'Lowest load in cluster. Consider rebalancing.', cluster: 'Web', lastUpdated: '1s ago' },
  { id: 'db-01', name: 'DB-MASTER-01', x: 350, y: 90, status: 'warning', cpu: 78, ram: 85, temp: 72, disk: 82, power: 460, latency: 25, risk: 67, aiRecommendation: 'High memory pressure. Recommend query optimization and connection pooling review.', cluster: 'Database', lastUpdated: 'Just now' },
  { id: 'db-02', name: 'DB-REPLICA-01', x: 420, y: 130, status: 'healthy', cpu: 34, ram: 61, temp: 58, disk: 71, power: 390, latency: 18, risk: 21, aiRecommendation: 'Replication lag within tolerance.', cluster: 'Database', lastUpdated: '3s ago' },
  { id: 'db-03', name: 'DB-REPLICA-02', x: 390, y: 170, status: 'warning', cpu: 62, ram: 74, temp: 68, disk: 79, power: 430, latency: 22, risk: 55, aiRecommendation: 'I/O wait times elevated. SSD health check recommended.', cluster: 'Database', lastUpdated: '1s ago' },
  { id: 'ai-01', name: 'GPU-NODE-01', x: 580, y: 80, status: 'critical', cpu: 96, ram: 92, temp: 88, disk: 94, power: 820, latency: 45, risk: 91, aiRecommendation: '🚨 CRITICAL: Thermal throttling imminent. Immediate cooling intervention required.', cluster: 'AI/ML', lastUpdated: 'Just now' },
  { id: 'ai-02', name: 'GPU-NODE-02', x: 650, y: 120, status: 'warning', cpu: 81, ram: 79, temp: 76, disk: 68, power: 740, latency: 32, risk: 63, aiRecommendation: 'GPU utilization high. Queue saturation likely within 2h.', cluster: 'AI/ML', lastUpdated: '4s ago' },
  { id: 'ai-03', name: 'GPU-NODE-03', x: 610, y: 165, status: 'healthy', cpu: 45, ram: 53, temp: 61, disk: 42, power: 560, latency: 15, risk: 28, aiRecommendation: 'Optimal state. Available for additional workloads.', cluster: 'AI/ML', lastUpdated: 'Just now' },
  { id: 'cache-01', name: 'CACHE-REDIS-01', x: 260, y: 200, status: 'healthy', cpu: 15, ram: 88, temp: 44, disk: 12, power: 180, latency: 4, risk: 15, aiRecommendation: 'High memory usage is expected for cache workload.', cluster: 'Cache', lastUpdated: '1s ago' },
  { id: 'cache-02', name: 'CACHE-REDIS-02', x: 320, y: 230, status: 'healthy', cpu: 12, ram: 82, temp: 42, disk: 10, power: 170, latency: 5, risk: 11, aiRecommendation: 'Normal operations.', cluster: 'Cache', lastUpdated: 'Just now' },
  { id: 'lb-01', name: 'LOAD-BAL-01', x: 80, y: 220, status: 'healthy', cpu: 8, ram: 24, temp: 38, disk: 22, power: 120, latency: 8, risk: 5, aiRecommendation: 'Traffic distribution balanced across all upstreams.', cluster: 'Network', lastUpdated: '5s ago' },
  { id: 'lb-02', name: 'LOAD-BAL-02', x: 490, y: 240, status: 'healthy', cpu: 11, ram: 28, temp: 40, disk: 25, power: 130, latency: 9, risk: 7, aiRecommendation: 'Active-Active configuration healthy.', cluster: 'Network', lastUpdated: '2s ago' },
  { id: 'stor-01', name: 'STORAGE-01', x: 200, y: 290, status: 'warning', cpu: 44, ram: 55, temp: 63, disk: 91, power: 280, latency: 18, risk: 48, aiRecommendation: 'Disk at 91% capacity. Expand or archive within 72h.', cluster: 'Storage', lastUpdated: '1s ago' },
  { id: 'stor-02', name: 'STORAGE-02', x: 440, y: 290, status: 'healthy', cpu: 29, ram: 42, temp: 51, disk: 63, power: 260, latency: 15, risk: 19, aiRecommendation: 'Storage metrics nominal.', cluster: 'Storage', lastUpdated: 'Just now' },
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

const CLUSTER_TYPES = ['All', 'Web', 'Database', 'Storage', 'Cache', 'AI/ML', 'Network']

export default function DigitalTwin({ standalone = false }: { standalone?: boolean }) {
  const [topology, setTopology] = useState<GuardAITopology | null>(null)
  const [selectedServer, setSelectedServer] = useState<Server | null>(null)
  const [activeLayer, setActiveLayer] = useState<string>('All')
  
  // Pan and Zoom state
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
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
    loadTopology().then(data => {
      if (active) setTopology(data)
    }).catch(() => {
      if (active) setTopology(null)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const measure = () => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) setContainerSize({ width: rect.width, height: rect.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [standalone])

  const servers = topology?.nodes ?? defaultServers
  const connections = topology?.connections.map(c => [c.source, c.target] as [string, string]) ?? defaultConnections
  const serverMap = Object.fromEntries(servers.map(s => [s.id, s]))

  const getFlowOffset = (i: number) => ((tick * 2 + i * 30) % 200)

  const height = standalone ? '100%' : 380
  const width = 760
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.min(Math.max(0.5, z - e.deltaY * 0.001), 3))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.2, 3))
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.2, 0.5))
  const handleReset = () => { setZoom(1); setPan({ x: 0, y: 0 }) }
  const handleFit = () => {
    const baseScale = containerSize.width > 0 && containerSize.height > 0
      ? Math.min(containerSize.width / width, containerSize.height / 400)
      : 1
    setZoom(baseScale * 0.9)
    setPan({ x: 0, y: 0 })
  }

  const visibleServers = activeLayer === 'All' ? servers : servers.filter(s => s.cluster === activeLayer)
  const visibleMap = Object.fromEntries(visibleServers.map(s => [s.id, true]))
  const isNodeDimmed = (id: string) => activeLayer !== 'All' && !visibleMap[id]

  const getNodeShape = (cluster: string) => {
    switch(cluster) {
      case 'Database': return 'M2 6a10 4 0 1020 0M2 6a10 4 0 1120 0M2 6v12a10 4 0 1020 0V6'
      case 'Storage': return 'M4 4h16v16H4z'
      case 'Web': return 'M12 2L2 22h20L12 2z'
      case 'Network': return 'M12 2l10 5v10l-10 5-10-5V7l10-5z'
      default: return 'M12 2a10 10 0 100 20 10 10 0 000-20z'
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex' }}>
      
      {/* Canvas Area */}
      <div 
        ref={containerRef}
        style={{
          position: 'relative',
          background: 'radial-gradient(ellipse at 50% 40%, rgba(59,130,246,0.05) 0%, rgba(34,211,238,0.02) 40%, transparent 70%)',
          borderRadius: 20,
          overflow: 'hidden',
          flex: 1,
          height,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        
        {/* Layer Controls */}
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 30, display: 'flex', gap: 8, background: 'rgba(15,23,42,0.6)', padding: '6px 12px', borderRadius: 20, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {CLUSTER_TYPES.map(layer => (
            <button key={layer} onClick={() => setActiveLayer(layer)} style={{
              background: activeLayer === layer ? 'rgba(59,130,246,0.2)' : 'transparent',
              color: activeLayer === layer ? '#60A5FA' : '#94A3B8',
              border: `1px solid ${activeLayer === layer ? 'rgba(59,130,246,0.4)' : 'transparent'}`,
              padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              {layer}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {([['healthy', '#10B981', 'Healthy'], ['warning', '#F59E0B', 'Warning'], ['critical', '#EF4444', 'Critical']] as const).map(([s, c, l]) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
              <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>

        {/* Transform Layer */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width,
          height: 400,
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
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
              fontSize: 10, color: cl.color, letterSpacing: '0.12em', fontWeight: 800,
              opacity: 0.5,
              fontFamily: "'JetBrains Mono', monospace",
            }}>{cl.label}</div>
          ))}

          {/* Connections */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {connections.map(([aId, bId], i) => {
              const a = serverMap[aId], b = serverMap[bId]
              if (!a || !b) return null
              const dimmed = isNodeDimmed(aId) || isNodeDimmed(bId)
              const isCritical = a.status === 'critical' || b.status === 'critical'
              const isWarning = a.status === 'warning' || b.status === 'warning'
              
              const strokeC = isCritical ? 'rgba(239,68,68,0.5)' : isWarning ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.25)'

              return (
                <g key={`${aId}-${bId}`} style={{ opacity: dimmed ? 0.1 : 1, transition: 'opacity 0.3s' }}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={strokeC} strokeWidth={isCritical ? 1.5 : 1} strokeDasharray={isCritical ? '4,3' : undefined} />
                  {!dimmed && (
                    <circle r={isCritical ? 3 : 2} fill={isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#22D3EE'} style={{ filter: `drop-shadow(0 0 ${isCritical ? 4 : 3}px ${isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#22D3EE'})` }}>
                      <animateMotion dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" path={`M${a.x},${a.y} L${b.x},${b.y}`} />
                    </circle>
                  )}
                </g>
              )
            })}
          </svg>

          {/* Nodes */}
          {servers.map(server => {
            const color = statusColors[server.status]
            const isSelected = selectedServer?.id === server.id
            const dimmed = isNodeDimmed(server.id)
            const pulse = Math.sin(tick * 0.15 + server.x * 0.02) * 0.5 + 0.5
            const size = isSelected ? 24 : 18

            return (
              <div
                key={server.id}
                onClick={(e) => { e.stopPropagation(); setSelectedServer(server) }}
                style={{
                  position: 'absolute',
                  left: server.x - size / 2,
                  top: server.y - size / 2,
                  width: size, height: size,
                  cursor: 'pointer',
                  zIndex: isSelected ? 20 : 10,
                  opacity: dimmed ? 0.2 : 1,
                  transition: 'all 0.3s',
                }}
              >
                {/* Glow ring */}
                <div style={{
                  position: 'absolute', inset: -8, borderRadius: '50%',
                  border: `1px solid ${color}`,
                  opacity: pulse * (isSelected ? 0.8 : 0.3),
                  transition: 'opacity 0.1s',
                }} />
                
                {/* Critical Blink */}
                {server.status === 'critical' && !dimmed && (
                  <div style={{
                    position: 'absolute', inset: -14, borderRadius: '50%',
                    border: '1px solid rgba(239,68,68,0.6)',
                    animation: 'ripple 1s ease-out infinite',
                  }} />
                )}
                
                {/* Main Node */}
                <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <path d={getNodeShape(server.cluster)} fill={dimmed ? '#334155' : `rgba(${color === '#10B981' ? '16,185,129' : color === '#F59E0B' ? '245,158,11' : '239,68,68'}, 0.2)`} stroke={color} strokeWidth={isSelected ? 2 : 1.5} style={{ filter: `drop-shadow(0 0 ${isSelected ? 10 : 4}px ${color})` }} />
                </svg>
                
                {/* Label */}
                {(!dimmed || isSelected) && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8, fontSize: 9, color: isSelected ? '#F8FAFC' : '#94A3B8', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {server.name}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Zoom Controls */}
        <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 30, display: 'flex', flexDirection: 'column', gap: 6, background: 'rgba(15,23,42,0.8)', padding: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={handleZoomIn} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: 16 }}>+</button>
          <button onClick={handleZoomOut} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: 16 }}>-</button>
          <button onClick={handleFit} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: 11 }}>Fit</button>
          <button onClick={handleReset} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#F1F5F9', border: 'none', cursor: 'pointer', fontSize: 11 }}>1:1</button>
        </div>

        {/* Mini Map */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 30, width: 120, height: 80, background: 'rgba(15,23,42,0.8)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
           <div style={{ position: 'relative', width: '100%', height: '100%' }}>
             {servers.map(s => (
               <div key={s.id} style={{ position: 'absolute', left: (s.x / width) * 120, top: (s.y / 400) * 80, width: 2, height: 2, background: statusColors[s.status] }} />
             ))}
             {/* Viewport indicator */}
             <div style={{ 
               position: 'absolute', 
               border: '1px solid rgba(59,130,246,0.6)', background: 'rgba(59,130,246,0.1)',
               left: Math.max(0, 60 - (60 / zoom) - (pan.x / width) * 120),
               top: Math.max(0, 40 - (40 / zoom) - (pan.y / 400) * 80),
               width: Math.min(120, 120 / zoom),
               height: Math.min(80, 80 / zoom)
             }} />
           </div>
        </div>

      </div>

      {/* Side Panels - Asset Details & AI Analysis */}
      <div style={{
        width: selectedServer ? 340 : 0,
        opacity: selectedServer ? 1 : 0,
        overflow: 'hidden',
        transition: 'width 0.3s ease, opacity 0.3s ease',
        borderLeft: selectedServer ? '1px solid rgba(255,255,255,0.05)' : 'none',
        background: 'rgba(15,23,42,0.4)',
        display: 'flex', flexDirection: 'column', gap: 16,
        padding: selectedServer ? '20px' : '20px 0',
      }}>
        {selectedServer ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[selectedServer.status], boxShadow: `0 0 10px ${statusColors[selectedServer.status]}` }} />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#F8FAFC' }}>{selectedServer.name}</h3>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{selectedServer.cluster} Asset · Last updated: {selectedServer.lastUpdated}</div>
              </div>
              <button onClick={() => setSelectedServer(null)} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', marginBottom: 12 }}>Asset Telemetry</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
                {[
                  { label: 'CPU Usage', val: selectedServer.cpu, unit: '%', warn: 80 },
                  { label: 'Memory', val: selectedServer.ram, unit: '%', warn: 80 },
                  { label: 'Disk IO', val: selectedServer.disk, unit: '%', warn: 85 },
                  { label: 'Temp', val: selectedServer.temp, unit: '°C', warn: 75 },
                  { label: 'Power', val: selectedServer.power, unit: 'W', warn: 800 },
                  { label: 'Latency', val: selectedServer.latency || 0, unit: 'ms', warn: 50 },
                ].map(m => (
                  <div key={m.label}>
                    <div style={{ fontSize: 10, color: '#64748B', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: m.val >= m.warn ? '#EF4444' : '#F1F5F9' }}>
                      {m.val}{m.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(168,85,247,0.05)', borderRadius: 12, padding: 16, border: '1px solid rgba(168,85,247,0.2)', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ color: '#A855F7', fontSize: 14 }}>✨</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#D8B4FE', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Analysis</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Risk Score</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                      <div style={{ width: `${selectedServer.risk}%`, height: '100%', borderRadius: 2, background: selectedServer.risk > 70 ? '#EF4444' : selectedServer.risk > 40 ? '#F59E0B' : '#10B981' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: selectedServer.risk > 70 ? '#EF4444' : selectedServer.risk > 40 ? '#F59E0B' : '#10B981' }}>{selectedServer.risk}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Root Cause Analysis</div>
                  <div style={{ fontSize: 12, color: '#F8FAFC', lineHeight: 1.4 }}>{selectedServer.status === 'healthy' ? 'No anomalies detected in the current telemetry window.' : selectedServer.status === 'warning' ? 'Load increasing steadily, approaching saturation limits.' : 'Critical failure threshold breached. Service degradation active.'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: '#94A3B8', marginBottom: 2 }}>Predicted Failure Probability</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: selectedServer.status === 'critical' ? '#EF4444' : '#F1F5F9' }}>{selectedServer.status === 'critical' ? '89.4%' : selectedServer.status === 'warning' ? '24.1%' : '1.2%'}</div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 10, color: '#A855F7', fontWeight: 600, marginBottom: 4 }}>SUGGESTED ACTION</div>
                  <div style={{ fontSize: 11, color: '#E2E8F0', lineHeight: 1.4 }}>{selectedServer.aiRecommendation}</div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.5, textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🖱️</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>Select an asset</div>
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Click on any infrastructure node to view detailed telemetry and AI analysis.</div>
          </div>
        )}
      </div>
      
    </div>
  )
}
