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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>AI Digital Twin</h1>
            <span className="badge badge-cyan">LIVE</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22D3EE', display: 'inline-block' }} className="animate-blink" />
          </div>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
            Holographic infrastructure model · 15 nodes · Real-time AI telemetry · Hover nodes for deep analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={() => void handleExport()} disabled={busyAction !== null} style={{ fontSize: 13, opacity: busyAction ? 0.75 : 1 }}>
            {busyAction === 'export' ? 'Exporting...' : 'Export View'}
          </button>
          <button className="btn-primary" onClick={() => void handleScan()} disabled={busyAction !== null} style={{ fontSize: 13, padding: '9px 18px', opacity: busyAction ? 0.75 : 1 }}>
            {busyAction === 'scan' ? 'Scanning...' : '⚡ Run AI Scan'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="glass-card" style={{ padding: '10px 14px', borderLeft: '3px solid #22D3EE', color: '#C4B5FD', fontSize: 12 }}>
          {statusMessage}
        </div>
      )}

      {/* Main twin */}
      <div className="glass-card" style={{ padding: 24, flex: 1 }}>
        <DigitalTwin standalone={true} />
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Nodes', value: '247', sub: '15 monitored instances', color: '#60A5FA' },
          { label: 'Healthy', value: '10', sub: '66.7% of fleet', color: '#10B981' },
          { label: 'Warning', value: '4', sub: 'Non-critical issues', color: '#F59E0B' },
          { label: 'Critical', value: '1', sub: 'Immediate attention', color: '#EF4444' },
          { label: 'AI Confidence', value: '94.7%', sub: 'Analysis accuracy', color: '#A855F7' },
        ].map(stat => (
          <div key={stat.label} className="glass-card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, fontFamily: "'JetBrains Mono', monospace" }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#F1F5F9', marginTop: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 1 }}>{stat.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
