interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )},
  { id: 'digital-twin', label: 'Digital Twin', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.5 9h15" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )},
  { id: 'servers', label: 'Servers', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="3" width="15" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="10.5" width="15" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="13.5" cy="5.25" r="0.75" fill="currentColor" />
      <circle cx="13.5" cy="12.75" r="0.75" fill="currentColor" />
    </svg>
  )},
  { id: 'monitoring', label: 'Monitoring', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.5 12L5 7.5l3 3 3-5.5 3 4 2-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )},
  { id: 'copilot', label: 'AI Copilot', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 9c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
    </svg>
  )},
  { id: 'alerts', label: 'Alerts', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 1.5L1.5 15h15L9 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 7v3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="12.5" r="0.75" fill="currentColor" />
    </svg>
  ), badge: 4 },
  { id: 'predictions', label: 'Predictions', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1.5 14l4-5.5 3.5 2.5 3-6 4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8l2.5-1.5-1.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )},
  { id: 'reports', label: 'Reports', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="1.5" width="12" height="15" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 6h6M6 9h6M6 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )},
]

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.6 3.6l1.4 1.4M13 13l1.4 1.4M3.6 14.4l1.4-1.4M13 5l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )},
  { id: 'logout', label: 'Logout', icon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M7 15.5H3.5A1.5 1.5 0 012 14V4a1.5 1.5 0 011.5-1.5H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12 12.5l3.5-3.5L12 5.5M15.5 9H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )},
]

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <div style={{
      width: 220,
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.8)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 100,
    }}>
      {/* Subtle glow top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.6), rgba(34,211,238,0.4), transparent)',
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 8px 24px' }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, #3B82F6, #22D3EE)',
          borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(59,130,246,0.5)',
          flexShrink: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L2 3.5v4c0 3.7 2.6 7.1 6 8.1 3.4-1 6-4.4 6-8.1v-4L8 1z" stroke="white" strokeWidth="1.2" />
            <path d="M5.5 8l2 2 3.5-3.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em' }}>
            <span className="text-gradient-blue">GUARD</span>
            <span style={{ color: '#F1F5F9' }}>AI</span>
          </div>
          <div style={{ fontSize: 9, color: '#334155', letterSpacing: '0.08em', marginTop: 1 }}>OPERATIONS CENTER</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 10, color: '#334155', letterSpacing: '0.1em', fontWeight: 600, padding: '0 8px', marginBottom: 4 }}>
          MAIN
        </div>
        {navItems.map(item => {
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                border: 'none', cursor: 'pointer',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(34,211,238,0.1))'
                  : 'transparent',
                color: isActive ? '#60A5FA' : '#64748B',
                transition: 'all 0.2s ease',
                position: 'relative',
                width: '100%',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                outline: 'none',
                boxShadow: isActive ? 'inset 0 0 0 1px rgba(59,130,246,0.25)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  const t = e.currentTarget
                  t.style.background = 'rgba(255,255,255,0.04)'
                  t.style.color = '#94A3B8'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  const t = e.currentTarget
                  t.style.background = 'transparent'
                  t.style.color = '#64748B'
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '0 2px 2px 0',
                  background: 'linear-gradient(180deg, #3B82F6, #22D3EE)',
                  boxShadow: '0 0 8px rgba(59,130,246,0.6)',
                }} />
              )}
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  marginLeft: 'auto',
                  background: 'rgba(239,68,68,0.2)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(239,68,68,0.3)',
                  fontSize: 10, fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 100,
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}

        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 8px' }} />
        <div style={{ fontSize: 10, color: '#334155', letterSpacing: '0.1em', fontWeight: 600, padding: '0 8px', marginBottom: 4 }}>
          ACCOUNT
        </div>
        {bottomItems.map(item => {
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px',
                borderRadius: 10,
                border: 'none', cursor: 'pointer',
                background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: item.id === 'logout' ? '#EF4444' : (isActive ? '#60A5FA' : '#64748B'),
                transition: 'all 0.2s',
                width: '100%', textAlign: 'left',
                fontSize: 13, fontWeight: isActive ? 600 : 400, outline: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? 'rgba(59,130,246,0.1)' : 'transparent' }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* System status */}
      <div style={{
        margin: '12px 0 0',
        padding: '12px',
        background: 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.12)',
        borderRadius: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span className="status-dot healthy" />
          <span style={{ fontSize: 11, color: '#6EE7B7', fontWeight: 600 }}>All Systems Operational</span>
        </div>
        <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
          247 nodes active · 0 critical
        </div>
        <div className="progress-bar" style={{ marginTop: 8 }}>
          <div className="progress-fill" style={{ width: '97%', background: 'linear-gradient(90deg, #10B981, #22D3EE)' }} />
        </div>
      </div>
    </div>
  )
}
