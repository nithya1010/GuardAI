import { useState, useEffect } from 'react'

interface TopBarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const pageLabels: Record<string, string> = {
  dashboard: 'Operations Dashboard',
  'digital-twin': 'Digital Twin — 3D Infrastructure View',
  servers: 'Server Fleet',
  monitoring: 'Infrastructure Monitoring',
  copilot: 'AI Copilot',
  alerts: 'Alerts & Incidents',
  predictions: 'AI Predictions & Forecasting',
  reports: 'Executive Reports',
  settings: 'Settings & Configuration',
}

export default function TopBar({ activePage, onNavigate }: TopBarProps) {
  const [time, setTime] = useState(new Date())
  const [searchFocused, setSearchFocused] = useState(false)
  const [env, setEnv] = useState('Production')

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const envColors: Record<string, string> = {
    Production: '#10B981',
    Staging: '#F59E0B',
    Development: '#A855F7',
  }

  return (
    <div style={{
      height: 60,
      background: 'rgba(15, 23, 42, 0.7)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 20,
      flexShrink: 0,
      position: 'relative',
      zIndex: 99,
    }}>
      {/* Page title */}
      <div style={{ flex: '0 0 auto' }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F1F5F9', letterSpacing: '-0.01em' }}>
          {pageLabels[activePage] || 'GUARDAI'}
        </div>
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke={searchFocused ? '#60A5FA' : '#475569'} strokeWidth="1.2" />
          <path d="M9.5 9.5l2.5 2.5" stroke={searchFocused ? '#60A5FA' : '#475569'} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          className="input-dark"
          placeholder="Search nodes, alerts, incidents..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          style={{ paddingLeft: 36, height: 36, fontSize: 13, borderRadius: 10 }}
        />
        <span style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          fontSize: 10, color: '#334155', fontFamily: "'JetBrains Mono', monospace",
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          padding: '2px 6px', borderRadius: 4,
        }}>⌘K</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Environment selector */}
      <div style={{ position: 'relative' }}>
        <select
          value={env}
          onChange={e => setEnv(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${envColors[env]}33`,
            borderRadius: 8,
            color: envColors[env],
            padding: '5px 28px 5px 10px',
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer', outline: 'none',
            appearance: 'none',
          }}
        >
          <option value="Production">⬤ Production</option>
          <option value="Staging">⬤ Staging</option>
          <option value="Development">⬤ Development</option>
        </select>
        <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 4l3 3 3-3" stroke={envColors[env]} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Time */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 12, color: '#475569', letterSpacing: '0.05em',
        padding: '4px 10px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 8,
      }}>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </div>

      {/* AI Status */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '5px 12px',
        background: 'rgba(16,185,129,0.08)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.6)', display: 'inline-block' }} className="animate-blink" />
        <span style={{ fontSize: 12, color: '#6EE7B7', fontWeight: 500 }}>AI Active</span>
      </div>

      {/* Notifications */}
      <button
        onClick={() => onNavigate('alerts')}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6v4.5l-1 1.5h11l-1-1.5V6c0-2.5-2-4.5-4.5-4.5z" stroke="#94A3B8" strokeWidth="1.2" />
          <path d="M6.5 12.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span style={{
          position: 'absolute', top: 4, right: 4,
          width: 14, height: 14, borderRadius: '50%',
          background: '#EF4444',
          fontSize: 8, fontWeight: 700, color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1.5px solid #030712',
          animation: 'pulse-red 1s infinite',
        }}>4</span>
      </button>

      {/* Health score */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '5px 12px',
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: 8,
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: '#475569', lineHeight: 1 }}>HEALTH</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#10B981', lineHeight: 1, marginTop: 1 }}>97.2</div>
        </div>
        <svg width="28" height="28" viewBox="0 0 28 28">
          <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle cx="14" cy="14" r="11" fill="none" stroke="#10B981" strokeWidth="3"
            strokeDasharray={`${0.972 * 69.1} 69.1`} strokeLinecap="round"
            transform="rotate(-90 14 14)"
            style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.6))' }} />
        </svg>
      </div>

      {/* Profile */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #3B82F6, #A855F7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, color: 'white', cursor: 'pointer',
        boxShadow: '0 0 12px rgba(59,130,246,0.3)',
        flexShrink: 0,
      }}>
        AD
      </div>
    </div>
  )
}
