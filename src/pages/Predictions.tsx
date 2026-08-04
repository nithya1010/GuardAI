import { useState } from 'react'

function ForecastChart({ data, color, label, unit }: { data: number[]; color: string; label: string; unit: string }) {
  const min = Math.min(...data) * 0.9
  const max = Math.max(...data) * 1.05
  const range = max - min
  const w = 320, h = 100
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
  const historicalCount = Math.floor(data.length * 0.65)
  const futureCount = data.length - historicalCount

  const histPts = pts.slice(0, historicalCount)
  const futurePts = pts.slice(historicalCount - 1)
  const histPath = `M${histPts.join(' L')}`
  const futurePath = `M${futurePts.join(' L')}`
  const fillHist = `M0,${h} L${histPts.join(' L')} L${(historicalCount-1)/(data.length-1)*w},${h} Z`
  const fillFuture = `M${(historicalCount-1)/(data.length-1)*w},${h} L${futurePts.join(' L')} L${w},${h} Z`

  return (
    <div className="glass-card glass-card-hover" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Historical + AI Forecast</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>
            {data[data.length - 1]}{unit}
          </div>
          <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>Predicted (7d)</div>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={`fh-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`ff-${label}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Historical fill */}
        <path d={fillHist} fill={`url(#fh-${label})`} />
        {/* Future fill */}
        <path d={fillFuture} fill={`url(#ff-${label})`} />
        {/* Divider */}
        <line x1={(historicalCount-1)/(data.length-1)*w} y1="0" x2={(historicalCount-1)/(data.length-1)*w} y2={h}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4,2" />
        {/* Historical line */}
        <path d={histPath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Forecast line */}
        <path d={futurePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5,3" opacity="0.8" />
        {/* Current dot */}
        <circle cx={(historicalCount-1)/(data.length-1)*w} cy={h-((data[historicalCount-1]-min)/range)*h} r="4" fill={color} />
      </svg>

      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#475569' }}>
          <div style={{ width: 16, height: 2, background: color, borderRadius: 1 }} />
          Historical
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#475569' }}>
          <div style={{ width: 16, height: 2, background: color, borderRadius: 1, opacity: 0.5, borderTop: '1px dashed' }} />
          AI Forecast
        </div>
      </div>
    </div>
  )
}

const predictions = [
  { server: 'GPU-NODE-01', event: 'Thermal Shutdown', probability: 94, timeframe: '18 min', severity: 'critical', action: 'Immediate intervention' },
  { server: 'STORAGE-01', event: 'Capacity Exhaustion', probability: 89, timeframe: '68 hours', severity: 'high', action: 'Provision 4TB volume' },
  { server: 'DB-MASTER-01', event: 'Connection Pool Saturation', probability: 73, timeframe: '4 hours', severity: 'high', action: 'Query optimization + replica' },
  { server: 'GPU-NODE-02', event: 'Queue Saturation', probability: 67, timeframe: '2 hours', severity: 'medium', action: 'Scale horizontally' },
  { server: 'DB-REPLICA-02', event: 'SSD Failure', probability: 41, timeframe: '14 days', severity: 'medium', action: 'SSD health check' },
  { server: 'WEB-PROD-02', event: 'Memory Leak OOM', probability: 28, timeframe: '48 hours', severity: 'low', action: 'Rolling restart' },
]

export default function Predictions() {
  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>AI Predictions & Forecasting</h1>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
          ML-powered failure prediction · Capacity planning · Trend analysis
        </p>
      </div>

      {/* Prediction cards */}
      <div>
        <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 10 }}>FAILURE PREDICTIONS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10 }}>
          {predictions.map((p, i) => {
            const c = p.severity === 'critical' ? '#EF4444' : p.severity === 'high' ? '#F59E0B' : p.severity === 'medium' ? '#3B82F6' : '#10B981'
            return (
              <div key={i} className="glass-card" style={{ padding: 16, borderLeft: `3px solid ${c}`, animation: `fade-in 0.3s ease ${i * 0.06}s both` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{p.server}</div>
                    <div style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 600, marginTop: 2 }}>{p.event}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: c, fontFamily: "'JetBrains Mono', monospace" }}>{p.probability}%</div>
                    <div style={{ fontSize: 9, color: '#475569' }}>probability</div>
                  </div>
                </div>

                {/* Probability bar */}
                <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
                  <div style={{
                    width: `${p.probability}%`, height: '100%', borderRadius: 3,
                    background: `linear-gradient(90deg, ${c}88, ${c})`,
                    transition: 'width 1s ease',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748B' }}>
                    ⏱️ ETA: <span style={{ color: c, fontWeight: 600 }}>{p.timeframe}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    💡 {p.action}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Forecast charts */}
      <div>
        <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 10 }}>RESOURCE FORECASTS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <ForecastChart color="#3B82F6" label="CPU Utilization Forecast" unit="%" data={[23,28,31,27,35,38,41,44,47,51,53,49,55,58,62,66]} />
          <ForecastChart color="#A855F7" label="Memory Usage Forecast" unit="%" data={[55,57,58,60,59,62,61,63,65,67,68,70,72,74,76,78]} />
          <ForecastChart color="#F59E0B" label="Storage Capacity Forecast" unit="%" data={[72,73,74,75,76,78,79,80,82,83,85,87,89,91,93,96]} />
          <ForecastChart color="#10B981" label="Network Throughput Forecast" unit="Gbps" data={[2.1,2.3,2.4,2.2,2.5,2.6,2.8,2.7,3.0,3.1,3.3,3.2,3.5,3.7,3.9,4.1]} />
        </div>
      </div>

      {/* Capacity planning */}
      <div className="glass-card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>30-Day Capacity Planning Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            { label: 'Add Storage', detail: '4TB volume to STORAGE-01', urgency: 'This week', icon: '💾', color: '#F59E0B' },
            { label: 'Scale GPU', detail: 'Add 2 GPU nodes for ML workload growth', urgency: 'Within 2 weeks', icon: '🖥️', color: '#A855F7' },
            { label: 'DB Replica', detail: 'Add read replica for DB-MASTER-01', urgency: 'This week', icon: '🗄️', color: '#3B82F6' },
            { label: 'Network Upgrade', detail: '10GbE → 25GbE for inter-node', urgency: 'Next month', icon: '🌐', color: '#22D3EE' },
          ].map(item => (
            <div key={item.label} style={{ padding: 14, background: `${item.color}08`, border: `1px solid ${item.color}22`, borderRadius: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 11, color: '#64748B', marginBottom: 8, lineHeight: 1.4 }}>{item.detail}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: item.color }}>⏰ {item.urgency}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
