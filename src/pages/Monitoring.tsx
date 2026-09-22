import { useState, useEffect } from 'react'

const serversList = ['US-EAST-1A', 'US-EAST-1B', 'US-EAST-1C', 'US-WEST-2A', 'US-WEST-2B', 'US-WEST-2C', 'EU-WEST-1']
const heatmapData = serversList.map(server => {
  return Array.from({ length: 24 }, (_, h) => ({
    server,
    hour: h,
    cpu: Math.random() * 100,
    mem: 40 + Math.random() * 50,
    temp: 35 + Math.random() * 45,
  }))
}).flat()

function HeatCell({ cell }: { cell: any }) {
  const v = cell.cpu
  const getColor = (v: number) => {
    if (v > 85) return `rgba(239,68,68,${0.4 + (v-85)/15 * 0.5})`
    if (v > 70) return `rgba(245,158,11,${0.3 + (v-70)/15 * 0.4})`
    if (v > 50) return `rgba(250,204,21,${0.2 + (v-50)/20 * 0.3})`
    return `rgba(16,185,129,${0.1 + v/50 * 0.2})`
  }
  const status = v > 85 ? 'Critical' : v > 70 ? 'High' : v > 50 ? 'Moderate' : 'Healthy'
  
  return (
    <div className="group" style={{
      width: '100%', paddingBottom: '100%', position: 'relative', borderRadius: 2,
      background: getColor(v),
      border: `1px solid ${v > 85 ? 'rgba(239,68,68,0.2)' : 'transparent'}`,
      cursor: 'default',
      transition: 'transform 0.1s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.zIndex = '10' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '0' }}
    >
      <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-[#1E293B] text-slate-200 text-xs rounded-lg p-3 shadow-2xl border border-slate-700 z-50 pointer-events-none text-left">
        <div className="font-bold text-sm mb-2 border-b border-slate-700 pb-1">{cell.server} ({cell.hour}h ago)</div>
        <div className="grid grid-cols-2 gap-1 mb-1">
          <div className="text-slate-400">CPU: <span className={`font-mono text-slate-200 ${v > 85 ? 'text-red-400' : ''}`}>{v.toFixed(0)}%</span></div>
          <div className="text-slate-400">Mem: <span className="font-mono text-slate-200">{cell.mem.toFixed(0)}%</span></div>
        </div>
        <div className="grid grid-cols-2 gap-1 mb-1">
          <div className="text-slate-400">Temp: <span className="font-mono text-slate-200">{cell.temp.toFixed(0)}°C</span></div>
          <div className="text-slate-400">Health: <span className={`font-mono text-slate-200 ${v > 85 ? 'text-red-400' : 'text-green-400'}`}>{status}</span></div>
        </div>
      </div>
    </div>
  )
}

const networkNodes = [
  { id: 'US-EAST-1A', x: 30, y: 35, servers: 6, load: 67, mem: 71, temp: 42, latency: 12, healthy: true, risk: 'Low', ai: 'Optimize idle resources' },
  { id: 'US-EAST-1B', x: 50, y: 25, servers: 4, load: 72, mem: 68, temp: 45, latency: 14, healthy: true, risk: 'Low', ai: 'No action needed' },
  { id: 'US-EAST-1C', x: 70, y: 35, servers: 3, load: 58, mem: 55, temp: 39, latency: 18, healthy: true, risk: 'Low', ai: 'No action needed' },
  { id: 'US-WEST-2A', x: 20, y: 65, servers: 5, load: 89, mem: 92, temp: 78, latency: 45, healthy: false, risk: 'Critical', ai: 'Scale up instances immediately to prevent downtime' },
  { id: 'US-WEST-2B', x: 40, y: 72, servers: 2, load: 61, mem: 60, temp: 41, latency: 22, healthy: true, risk: 'Low', ai: 'No action needed' },
  { id: 'US-WEST-2C', x: 60, y: 65, servers: 3, load: 44, mem: 48, temp: 38, latency: 19, healthy: true, risk: 'Low', ai: 'Consider scaling down during off-peak' },
  { id: 'EU-WEST-1', x: 80, y: 55, servers: 2, load: 33, mem: 35, temp: 36, latency: 85, healthy: true, risk: 'Low', ai: 'Monitor cross-region latency' },
]

const networkEdges = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],[5,6],[2,6]]

const recentEvents = [
  { time: '10:38', text: 'Network latency normalized in EU-WEST-1', type: 'success' },
  { time: '10:36', text: 'AI Recommendation generated for US-WEST-2A', type: 'info' },
  { time: '10:34', text: 'Temperature increased on US-WEST-2A', type: 'warning' },
  { time: '10:31', text: 'CPU Spike detected across US-WEST region', type: 'error' },
  { time: '10:15', text: 'Daily database backup completed successfully', type: 'success' },
]

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

      {/* 1. Infrastructure Status */}
      <div className="glass-card" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tick % 20 < 10 ? '#10B981' : '#34D399', boxShadow: '0 0 8px #10B981' }} />
          Live Infrastructure Status
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}><strong style={{ color: '#F8FAFC' }}>24</strong> Healthy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}><strong style={{ color: '#F8FAFC' }}>2</strong> Warning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}><strong style={{ color: '#F8FAFC' }}>1</strong> Critical</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#64748B' }} />
            <span style={{ fontSize: 12, color: '#94A3B8' }}><strong style={{ color: '#F8FAFC' }}>0</strong> Offline</span>
          </div>
        </div>
      </div>

      {/* Main Container - 2 Column Grid for top parts to preserve original aesthetic feeling while maintaining hierarchy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        
        {/* 2. Network Topology */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Network Topology</div>
          <div style={{ position: 'relative', height: 260, background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100" preserveAspectRatio="none">
              {networkEdges.map(([a, b], i) => {
                const na = networkNodes[a], nb = networkNodes[b]
                return (
                  <g key={i}>
                    <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(59,130,246,0.4)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                    <circle r="1.2">
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
                <div key={node.id} className="group" style={{
                  position: 'absolute',
                  left: `${node.x}%`, top: `${node.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 5,
                }}>
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: 12,
                    background: `rgba(${color === '#10B981' ? '16,185,129' : color === '#F59E0B' ? '245,158,11' : '239,68,68'},${0.1 + pulse * 0.05})`,
                    border: `1px solid ${color}55`,
                    boxShadow: `0 0 ${10 + pulse * 8}px ${color}44`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.1s',
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#F8FAFC', fontFamily: "'Inter', sans-serif", textAlign: 'center', lineHeight: 1.2 }}>
                      {node.id.split('-')[0]}<br/>{node.id.split('-').slice(1).join('-')}
                    </div>
                  </div>
                  
                  {/* Node Tooltip */}
                  <div className="hidden group-hover:block absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[#1E293B] text-slate-200 text-xs rounded-lg p-3 shadow-2xl border border-slate-700 z-50 pointer-events-none text-left">
                    <div className="font-bold text-sm mb-2 pb-2 border-b border-slate-700 flex justify-between items-center">
                        <span>{node.id}</span>
                        <span className={node.healthy ? 'text-green-400' : 'text-red-400'}>{node.healthy ? 'Healthy' : 'Critical'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-2">
                        <div className="text-slate-400">CPU: <span className={`font-mono text-slate-200 ${node.load > 85 ? 'text-red-400' : ''}`}>{node.load}%</span></div>
                        <div className="text-slate-400">Memory: <span className="font-mono text-slate-200">{node.mem}%</span></div>
                        <div className="text-slate-400">Temp: <span className={`font-mono text-slate-200 ${node.temp > 75 ? 'text-red-400' : ''}`}>{node.temp}°C</span></div>
                        <div className="text-slate-400">Latency: <span className="font-mono text-slate-200">{node.latency}ms</span></div>
                    </div>
                    <div className="bg-[#0F172A] p-2 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">AI Recommendation</div>
                        <div className="text-amber-400 text-xs">{node.ai}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 3. Server Utilization Heatmap */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Server Utilization Heatmap</div>
              <div style={{ fontSize: 11, color: '#475569' }}>Hourly average CPU utilization — last 24 hours</div>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(16,185,129,0.3)' }} />
                <span style={{ fontSize: 9, color: '#94A3B8' }}>Healthy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(250,204,21,0.3)' }} />
                <span style={{ fontSize: 9, color: '#94A3B8' }}>Mod</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(245,158,11,0.5)' }} />
                <span style={{ fontSize: 9, color: '#94A3B8' }}>High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(239,68,68,0.6)' }} />
                <span style={{ fontSize: 9, color: '#94A3B8' }}>Crit</span>
              </div>
            </div>
          </div>

          {/* Heatmap grid */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center', paddingTop: 14 }}>
              {serversList.map(s => (
                <div key={s} style={{ height: 14, fontSize: 9, color: '#94A3B8', display: 'flex', alignItems: 'center', width: 60, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 2, marginBottom: 4 }}>
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} style={{ fontSize: 8, color: '#64748B', textAlign: 'center' }}>
                    {h % 4 === 0 ? `${h}h` : ''}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateRows: `repeat(${serversList.length}, 14px)`, gridTemplateColumns: 'repeat(24, 1fr)', gap: 2 }}>
                {serversList.map(server => 
                  Array.from({ length: 24 }, (_, h) => {
                    const cell = heatmapData.find(c => c.server === server && c.hour === h)
                    return <HeatCell key={`${server}-${h}`} cell={cell || { server, hour: h, cpu: 0, mem: 0, temp: 0 }} />
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Traffic Flow */}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* 5. Recent Monitoring Events */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Recent Monitoring Events</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recentEvents.map((event, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, color: '#64748B', fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{event.time}</div>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                  background: event.type === 'error' ? '#EF4444' : event.type === 'warning' ? '#F59E0B' : event.type === 'success' ? '#10B981' : '#3B82F6',
                  boxShadow: `0 0 6px ${event.type === 'error' ? '#EF4444' : event.type === 'warning' ? '#F59E0B' : event.type === 'success' ? '#10B981' : '#3B82F6'}44`
                }} />
                <div style={{ fontSize: 13, color: '#E2E8F0', flex: 1 }}>{event.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. AI Monitoring Insights */}
        <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#A855F7' }}>✨</span> AI Monitoring Insights
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Highest CPU Server</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>US-WEST-2A <span style={{ color: '#64748B', fontWeight: 400, fontSize: 12 }}>(89%)</span></div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Highest Temp</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>78°C</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Infra Risk</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#EF4444' }}>High</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 4 }}>Network Bottleneck</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F8FAFC' }}>EU-WEST-1</div>
              </div>
            </div>

            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: 12, borderRadius: 8, border: '1px solid rgba(168, 85, 247, 0.2)', marginTop: 'auto' }}>
              <div style={{ fontSize: 11, color: '#D8B4FE', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Recommendation</div>
              <div style={{ fontSize: 12, color: '#F8FAFC', lineHeight: 1.4 }}>Scale up US-WEST-2A instances immediately to prevent downtime.</div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
