import { useState } from 'react'
import { generateExecutiveReport } from '../lib/guardaiApi'

const initialReports = [
  { title: 'Weekly Executive Summary', desc: 'AI-generated infrastructure health report with risk assessment, incident timeline, and optimization recommendations.', period: 'Jul 28 – Aug 3, 2026', type: 'Weekly', status: 'Ready', highlight: '#3B82F6', score: 97.2 },
  { title: 'Monthly Performance Report', desc: 'Comprehensive performance analysis across all clusters, SLA compliance tracking, and capacity utilization trends.', period: 'July 2026', type: 'Monthly', status: 'Ready', highlight: '#A855F7', score: 96.8 },
  { title: 'Incident Post-Mortem: GPU-NODE-01', desc: 'Root cause analysis for thermal event on GPU-NODE-01. Contributing factors, timeline, and prevention measures.', period: 'Aug 4, 2026', type: 'Incident', status: 'Generating', highlight: '#EF4444', score: null },
  { title: 'Q2 2026 Capacity Planning', desc: 'AI-powered capacity forecast for Q3, hardware procurement recommendations, and budget projections.', period: 'Q2 2026', type: 'Quarterly', status: 'Ready', highlight: '#22D3EE', score: 94.1 },
]

export default function Reports() {
  const [reports, setReports] = useState(initialReports)
  const [isGenerating, setIsGenerating] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const metrics = [
    { label: 'Overall Health', value: '97.2', unit: '/100', color: '#10B981' },
    { label: 'Incidents Resolved', value: '47', unit: 'this month', color: '#3B82F6' },
    { label: 'Uptime', value: '99.97', unit: '%', color: '#22D3EE' },
    { label: 'AI Auto-Fixes', value: '23', unit: 'actions', color: '#A855F7' },
    { label: 'Cost Saved', value: '$18.4K', unit: 'vs manual', color: '#F59E0B' },
    { label: 'Risk Reduction', value: '34%', unit: 'vs last month', color: '#10B981' },
  ]

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    setStatusMessage(null)

    try {
      const report = await generateExecutiveReport()
      setReports(current => [
        {
          title: report.title,
          desc: report.summary,
          period: 'Just now',
          type: 'Weekly',
          status: 'Ready',
          highlight: '#3B82F6',
          score: Number(report.metrics.health_score),
        },
        ...current,
      ])
      setStatusMessage('Latest executive report generated successfully.')
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Report generation failed unexpectedly.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Executive Reports</h1>
          <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>AI-generated reports · One-click PDF & CSV export</p>
        </div>
        <button className="btn-primary" onClick={() => void handleGenerateReport()} disabled={isGenerating} style={{ fontSize: 13, padding: '9px 18px', opacity: isGenerating ? 0.75 : 1 }}>
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {statusMessage && (
        <div className="glass-card" style={{ padding: '10px 14px', borderLeft: '3px solid #22D3EE', color: '#C4B5FD', fontSize: 12 }}>
          {statusMessage}
        </div>
      )}

      {/* Summary metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {metrics.map(m => (
          <div key={m.label} className="glass-card" style={{ padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{m.label}</div>
            <div style={{ fontSize: 9, color: '#334155' }}>{m.unit}</div>
          </div>
        ))}
      </div>

      {/* Report list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reports.map((r, i) => (
          <div key={i} className="glass-card" style={{ padding: 22, borderLeft: `3px solid ${r.highlight}`, animation: `fade-in 0.3s ease ${i*0.08}s both` }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                    background: `${r.highlight}15`, color: r.highlight, border: `1px solid ${r.highlight}30`,
                  }}>{r.type}</span>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{r.title}</h3>
                  {r.status === 'Generating' && (
                    <span className="badge badge-orange">Generating...</span>
                  )}
                  {r.status === 'Ready' && (
                    <span className="badge badge-green">Ready</span>
                  )}
                </div>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{r.desc}</p>
                <div style={{ fontSize: 11, color: '#475569' }}>📅 {r.period}</div>
              </div>

              <div style={{ display: 'flex', flex: '0 0 auto', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                {r.score && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: r.score > 95 ? '#10B981' : r.score > 90 ? '#F59E0B' : '#EF4444', fontFamily: "'JetBrains Mono', monospace" }}>
                      {r.score}
                    </div>
                    <div style={{ fontSize: 9, color: '#475569' }}>Health Score</div>
                  </div>
                )}
                {r.status === 'Ready' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-secondary" style={{ padding: '7px 12px', fontSize: 12 }}>📊 CSV</button>
                    <button className="btn-primary" style={{ padding: '7px 12px', fontSize: 12 }}>📄 PDF</button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Summary section */}
            {r.status === 'Ready' && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.06em', marginBottom: 6 }}>AI EXECUTIVE SUMMARY</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { icon: '✅', label: 'Achievements', text: 'Zero unplanned downtime. 97.2% health score maintained. 23 incidents auto-resolved.' },
                    { icon: '⚠️', label: 'Key Risks', text: 'GPU thermal management, storage capacity growth, database query optimization needed.' },
                    { icon: '🎯', label: 'Recommendations', text: 'Scale GPU cluster, expand storage, implement DB read replicas, upgrade cooling system.' },
                  ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 12 }}>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>{s.icon} <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{s.label}</span></div>
                      <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>{s.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
