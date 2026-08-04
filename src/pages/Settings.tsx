import { useState } from 'react'

const tabs = ['Profile', 'Notifications', 'Theme', 'API Keys', 'Security', 'System']

export default function Settings() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [notifications, setNotifications] = useState({
    critical: true, high: true, medium: true, low: false,
    email: true, slack: true, pagerduty: false,
    aiSummary: true, weeklyReport: true,
  })
  const [apiKeys] = useState([
    { name: 'Production API Key', key: 'grd_prod_••••••••••••••••4f2a', created: '2026-01-15', lastUsed: '2 minutes ago', scope: 'Full Access' },
    { name: 'Monitoring Agent', key: 'grd_mon_••••••••••••••••7c81', created: '2026-03-22', lastUsed: '30 seconds ago', scope: 'Read Only' },
    { name: 'CI/CD Pipeline', key: 'grd_ci_••••••••••••••••2d4e', created: '2026-06-01', lastUsed: '1 hour ago', scope: 'Deploy' },
  ])

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <div onClick={onChange} style={{
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      background: checked ? 'linear-gradient(135deg, #3B82F6, #22D3EE)' : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'background 0.2s',
      border: `1px solid ${checked ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: checked ? '0 0 10px rgba(59,130,246,0.3)' : undefined,
      flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 2, left: checked ? 20 : 2, width: 18, height: 18,
        borderRadius: '50%', background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  )

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>Configure your GuardAI Operations Center</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 5, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '7px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            background: activeTab === tab ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,211,238,0.1))' : 'transparent',
            color: activeTab === tab ? '#60A5FA' : '#64748B',
            transition: 'all 0.15s',
            boxShadow: activeTab === tab ? 'inset 0 0 0 1px rgba(59,130,246,0.2)' : undefined,
          }}>{tab}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, flex: 1 }}>
        <div className="glass-card" style={{ padding: 28 }}>

          {activeTab === 'Profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #A855F7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, fontWeight: 800, color: 'white',
                  boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                }}>AD</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Administrator</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 13 }}>admin@guardai.io · Super Admin</p>
                </div>
                <button className="btn-secondary" style={{ marginLeft: 'auto', fontSize: 13 }}>Change Avatar</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[['Full Name', 'Administrator'], ['Email', 'admin@guardai.io'], ['Role', 'Super Administrator'], ['Department', 'Infrastructure']].map(([label, val]) => (
                  <div key={label}>
                    <label style={{ display: 'block', fontSize: 11, color: '#64748B', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>{label.toUpperCase()}</label>
                    <input className="input-dark" defaultValue={val} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" style={{ width: 140, padding: '10px 20px' }}>Save Changes</button>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { heading: 'Alert Severity', items: [
                  { key: 'critical', label: 'Critical Alerts', desc: 'Immediate attention required' },
                  { key: 'high', label: 'High Severity', desc: 'Major incidents and warnings' },
                  { key: 'medium', label: 'Medium Severity', desc: 'Non-urgent issues' },
                  { key: 'low', label: 'Low Severity', desc: 'Informational notices' },
                ]},
                { heading: 'Channels', items: [
                  { key: 'email', label: 'Email Notifications', desc: 'admin@guardai.io' },
                  { key: 'slack', label: 'Slack Integration', desc: '#infrastructure-alerts' },
                  { key: 'pagerduty', label: 'PagerDuty', desc: 'On-call escalation' },
                ]},
                { heading: 'Reports', items: [
                  { key: 'aiSummary', label: 'Daily AI Summary', desc: 'AI-generated infrastructure brief' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Every Monday at 09:00 UTC' },
                ]},
              ].map(section => (
                <div key={section.heading}>
                  <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 12 }}>{section.heading.toUpperCase()}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {section.items.map(item => (
                      <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{item.desc}</div>
                        </div>
                        <Toggle checked={notifications[item.key as keyof typeof notifications]} onChange={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof notifications] }))} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'API Keys' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#64748B' }}>Manage API keys for programmatic access to GuardAI.</div>
                <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }}>+ Generate Key</button>
              </div>
              {apiKeys.map((key, i) => (
                <div key={i} className="glass-card" style={{ padding: 18, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{key.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#60A5FA', marginTop: 4 }}>{key.key}</div>
                    </div>
                    <span className={`badge ${key.scope === 'Full Access' ? 'badge-red' : key.scope === 'Deploy' ? 'badge-orange' : 'badge-green'}`}>{key.scope}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 11, color: '#475569' }}>
                    <span>Created: {key.created}</span>
                    <span>Last used: {key.lastUsed}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Copy</button>
                    <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Regenerate</button>
                    <button style={{ padding: '6px 12px', fontSize: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#FCA5A5', cursor: 'pointer', marginLeft: 'auto' }}>Revoke</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(activeTab === 'Security' || activeTab === 'Theme' || activeTab === 'System') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ textAlign: 'center', padding: '60px 40px', color: '#334155' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>
                  {activeTab === 'Security' ? '🛡️' : activeTab === 'Theme' ? '🎨' : '⚙️'}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>{activeTab} Settings</div>
                <div style={{ fontSize: 13 }}>Configuration panel for {activeTab.toLowerCase()} settings</div>
              </div>
            </div>
          )}
        </div>

        {/* Side info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="glass-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>SYSTEM INFO</div>
            {[
              ['Version', 'GuardAI 4.2.1'],
              ['Build', '20260804.1'],
              ['Environment', 'Production'],
              ['AI Engine', 'Neural v4.2'],
              ['Last Sync', '< 1 second ago'],
            ].map(([k, v]) => (
              <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                <span style={{ color: '#475569' }}>{k as string}</span>
                <span style={{ color: '#94A3B8', fontFamily: "'JetBrains Mono', monospace" }}>{v as string}</span>
              </div>
            ))}
          </div>

          <div className="glass-card" style={{ padding: 16, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span className="status-dot healthy" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#6EE7B7' }}>All Services Operational</span>
            </div>
            <div style={{ fontSize: 11, color: '#334155', lineHeight: 1.6 }}>
              API Response: 12ms<br />
              DB Latency: 3ms<br />
              AI Engine: Active
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
