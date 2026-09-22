import { useState } from 'react'
import DigitalTwin from '../components/DigitalTwin'
import { downloadJson, exportDigitalTwinView, runInfrastructureScan } from '../lib/guardaiApi'

export default function DigitalTwinPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [busyAction, setBusyAction] = useState<string | null>(null)

  const handleScan = async () => {
    setBusyAction('scan')
    setStatusMessage(null)

    try {
      const result = await runInfrastructureScan()
      setStatusMessage(`Scan complete: ${result.critical_nodes.length} critical, ${result.warning_nodes.length} warning.`)
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Scan failed unexpectedly.')
    } finally {
      setBusyAction(null)
    }
  }

  const handleExport = async () => {
    setBusyAction('export')
    setStatusMessage(null)

    try {
      const result = await exportDigitalTwinView()
      downloadJson(result.payload, result.file_name)
      setStatusMessage('Digital twin export downloaded successfully.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Export failed unexpectedly.')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Enterprise Digital Twin</h1>
            <span className="badge badge-cyan">LIVE SYNC</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} className="animate-blink" />
          </div>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
            Interactive holographic infrastructure model · AI-powered root cause analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => void handleExport()} disabled={busyAction !== null} style={{ fontSize: 13, opacity: busyAction ? 0.75 : 1 }}>
            {busyAction === 'export' ? 'Exporting...' : 'Export View'}
          </button>
          <button className="btn-primary" onClick={() => void handleScan()} disabled={busyAction !== null} style={{ fontSize: 13, padding: '9px 18px', opacity: busyAction ? 0.75 : 1 }}>
            {busyAction === 'scan' ? 'Scanning...' : '⚡ Run Deep Scan'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="glass-card" style={{ padding: '10px 14px', borderLeft: '3px solid #22D3EE', color: '#C4B5FD', fontSize: 12 }}>
          {statusMessage}
        </div>
      )}

      {/* Main interactive twin */}
      <div className="glass-card" style={{ padding: 0, flex: 1, minHeight: 600, overflow: 'hidden' }}>
        <DigitalTwin standalone={true} />
      </div>

      {/* Infrastructure Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Assets', value: '4,102', color: '#60A5FA' },
          { label: 'Server Racks', value: '142', color: '#F1F5F9' },
          { label: 'Compute Clusters', value: '18', color: '#F1F5F9' },
          { label: 'DB Clusters', value: '6', color: '#C084FC' },
          { label: 'Storage Systems', value: '24', color: '#94A3B8' },
          { label: 'Online Assets', value: '99.4%', color: '#10B981' },
          { label: 'Critical Assets', value: '3', color: '#EF4444' },
          { label: 'Infra Health', value: '96.2%', color: '#10B981' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Event Timeline */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Infrastructure Event Timeline</div>
        <div style={{ display: 'flex', gap: 24, overflowX: 'auto', paddingBottom: 8 }}>
          {[
            { time: '22:10', text: 'Infrastructure stabilized', type: 'success' },
            { time: '22:08', text: 'Traffic load balanced successfully', type: 'info' },
            { time: '22:05', text: 'AI predicted storage bottleneck', type: 'warning' },
            { time: '22:03', text: 'Temperature increased in Rack-12', type: 'warning' },
            { time: '22:01', text: 'CPU Spike detected in AI Cluster', type: 'error' },
          ].map((event, i, arr) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', minWidth: 200, position: 'relative' }}>
              {/* Connector line */}
              {i < arr.length - 1 && (
                <div style={{ position: 'absolute', top: 12, left: 16, right: -24, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%', zIndex: 2,
                  background: event.type === 'error' ? '#EF4444' : event.type === 'warning' ? '#F59E0B' : event.type === 'success' ? '#10B981' : '#3B82F6',
                  boxShadow: `0 0 8px ${event.type === 'error' ? '#EF4444' : event.type === 'warning' ? '#F59E0B' : event.type === 'success' ? '#10B981' : '#3B82F6'}44`
                }} />
                <div style={{ fontSize: 12, color: '#64748B', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{event.time}</div>
              </div>
              <div style={{ fontSize: 13, color: '#E2E8F0', lineHeight: 1.4, paddingRight: 16 }}>{event.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
