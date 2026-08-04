import { useState, useEffect } from 'react'

interface LoginProps {
  onLogin: () => void
}

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 8 + 4,
  delay: Math.random() * 4,
  color: ['#3B82F6', '#22D3EE', '#A855F7'][Math.floor(Math.random() * 3)],
}))

const neuralNodes = [
  { x: 20, y: 30 }, { x: 35, y: 15 }, { x: 15, y: 55 }, { x: 40, y: 45 },
  { x: 60, y: 25 }, { x: 50, y: 60 }, { x: 75, y: 40 }, { x: 65, y: 70 },
  { x: 85, y: 20 }, { x: 80, y: 65 }, { x: 25, y: 75 }, { x: 55, y: 80 },
  { x: 90, y: 50 }, { x: 10, y: 80 }, { x: 45, y: 90 },
]

const neuralEdges = [
  [0,1],[0,2],[0,3],[1,4],[2,3],[3,4],[3,5],[4,6],[5,6],[5,7],
  [6,8],[6,9],[7,9],[7,11],[8,12],[9,12],[10,11],[11,13],[12,14],[10,2],
]

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLogin()
    }, 1800)
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#030712', overflow: 'hidden' }}>

      {/* Left panel — AI Shield + Neural network */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(135deg, #030712 0%, #0a0f1f 50%, #030712 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Floating particles */}
        {particles.map(p => (
          <div key={p.id} style={{
            position: 'absolute',
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            borderRadius: '50%',
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            opacity: 0.7,
          }} />
        ))}

        {/* Neural network SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {neuralEdges.map(([a, b], i) => {
            const na = neuralNodes[a], nb = neuralNodes[b]
            return (
              <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="url(#lineGrad)" strokeWidth="0.3"
                strokeDasharray="2,1"
                style={{ animation: `data-flow ${3 + i * 0.2}s linear infinite` }}
              />
            )
          })}
          {neuralNodes.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="1.2" fill={['#3B82F6','#22D3EE','#A855F7'][i % 3]}
              opacity={0.8} />
          ))}
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
        </svg>

        {/* AI Shield */}
        <div style={{ position: 'relative', zIndex: 10, animation: 'float 4s ease-in-out infinite' }}>
          <div style={{
            width: 140, height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(34,211,238,0.1) 50%, transparent 70%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(59,130,246,0.3)',
            boxShadow: '0 0 40px rgba(59,130,246,0.3), 0 0 80px rgba(34,211,238,0.1), inset 0 0 40px rgba(59,130,246,0.1)',
            animation: 'glow-border 3s ease-in-out infinite',
          }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <path d="M36 6L9 18v18c0 16.6 11.5 32.1 27 36.4C51.5 68.1 63 52.6 63 36V18L36 6z"
                fill="none" stroke="url(#shieldGrad)" strokeWidth="2" strokeLinejoin="round" />
              <path d="M24 36l8 8 16-16" stroke="url(#checkGrad)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="shieldGrad" x1="9" y1="6" x2="63" y2="72" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" /><stop offset="1" stopColor="#22D3EE" />
                </linearGradient>
                <linearGradient id="checkGrad" x1="24" y1="36" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22D3EE" /><stop offset="1" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* Orbit rings */}
          {[170, 210, 250].map((size, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: size, height: size,
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: `1px solid rgba(${i === 0 ? '59,130,246' : i === 1 ? '34,211,238' : '168,85,247'},${0.15 - i * 0.04})`,
              animation: `rotate-slow ${20 + i * 8}s linear infinite`,
            }} />
          ))}
        </div>

        {/* Text */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: 40 }}>
          <div style={{ fontSize: 13, letterSpacing: '0.2em', color: '#22D3EE', textTransform: 'uppercase', marginBottom: 12, fontWeight: 500 }}>
            AI-Powered Security
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
            <span className="text-gradient-blue">GUARD</span>
            <span style={{ color: '#F1F5F9' }}>AI</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 15, marginTop: 16, lineHeight: 1.7, maxWidth: 320 }}>
            The intelligent guardian for mission-critical data centers. Real-time AI surveillance across every node, rack, and connection.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 32 }}>
            {[['99.97%', 'Uptime SLA'], ['<2ms', 'Alert Latency'], ['10K+', 'Nodes Monitored']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#60A5FA' }}>{val}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Time */}
        <div style={{
          position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#334155', letterSpacing: '0.1em',
        }}>
          {time.toLocaleTimeString()} UTC
        </div>
      </div>

      {/* Right panel — Login card */}
      <div style={{
        width: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(15,23,42,0.8) 0%, rgba(3,7,18,0.95) 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        padding: '60px 48px',
      }}>
        {/* Subtle gradient */}
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, width: 250, height: 250,
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #3B82F6, #22D3EE)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59,130,246,0.4)',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L2.25 4.5v4.5c0 4.15 2.87 8.03 6.75 9.1C12.88 17.03 15.75 13.15 15.75 9V4.5L9 1.5z" stroke="white" strokeWidth="1.5" />
                <path d="M6 9l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span className="text-gradient-blue">GUARD</span>
              <span style={{ color: '#F1F5F9' }}>AI</span>
            </span>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Welcome back
          </h2>
          <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 36px' }}>
            Sign in to your Operations Center
          </p>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#94A3B8', marginBottom: 8, letterSpacing: '0.04em' }}>
                EMAIL ADDRESS
              </label>
              <input
                className="input-dark"
                type="email"
                placeholder="admin@guardai.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', letterSpacing: '0.04em' }}>
                  PASSWORD
                </label>
                <button className="btn-ghost" style={{ padding: '2px 8px', fontSize: 12, border: 'none', color: '#60A5FA' }}>
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-dark"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 48 }}
                />
                <button onClick={() => setShowPass(s => !s)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4,
                }}>
                  {showPass ? '👁' : '👁‍🗨'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(59,130,246,0.2)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: 13, color: '#64748B' }}>Remember this device for 30 days</span>
            </div>

            <button className="btn-primary" onClick={handleLogin}
              style={{ marginTop: 8, padding: '14px 20px', fontSize: 15, position: 'relative', overflow: 'hidden' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    animation: 'rotate-slow 0.7s linear infinite', display: 'inline-block',
                  }} />
                  Authenticating...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L3 3.5v4c0 3.3 2.3 6.4 5 7.2 2.7-.8 5-3.9 5-7.2v-4L8 1z" stroke="white" strokeWidth="1.2" />
                    <path d="M5.5 8l2 2 3.5-3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  Access Operations Center
                </span>
              )}
            </button>
          </div>

          {/* Security indicators */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: '🔐', label: 'AES-256' },
              { icon: '🛡️', label: 'Zero Trust' },
              { icon: '🔒', label: 'SOC 2' },
            ].map(({ icon, label }) => (
              <div key={label} style={{
                flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '10px 8px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 14, marginBottom: 3 }}>{icon}</div>
                <div style={{ fontSize: 10, color: '#475569', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 24 }}>
            Protected by GuardAI Neural Security Engine v4.2
          </p>
        </div>
      </div>
    </div>
  )
}
