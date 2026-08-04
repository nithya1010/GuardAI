import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  timestamp: Date
  confidence?: number
  type?: 'analysis' | 'recommendation' | 'alert' | 'normal'
}

const suggestedQuestions = [
  'Why is GPU-NODE-01 running hot?',
  'What is the failure probability for DB-MASTER-01?',
  'Optimize my infrastructure for cost',
  'Give me a root cause analysis for the current alerts',
  'Predict capacity needs for next 30 days',
  'Which servers should I restart first?',
  'Summarize this week\'s incidents',
  'Generate an executive health report',
]

const aiResponses: Record<string, { content: string; confidence: number; type: Message['type'] }> = {
  'Why is GPU-NODE-01 running hot?': {
    content: `## Root Cause Analysis: GPU-NODE-01 Thermal Issue

**Diagnosis Confidence: 96.4%**

Based on telemetry analysis across the past 6 hours, I've identified the following causal chain:

**Primary Cause:**
GPU-NODE-01 is running ML training job \`llm-finetune-v7\` which has been allocated 100% GPU VRAM (80GB) since 09:14 UTC. This workload generates sustained thermal output of ~320W per GPU across 8 GPUs.

**Contributing Factors:**
1. 🌡️ Cooling Unit 3-B is operating at 78% efficiency (down from 95% baseline) — filter replacement overdue by 12 days
2. 📊 Ambient temperature in Rack Zone C is 28°C vs target 22°C
3. ⚡ Power delivery to rack is at 97% capacity, reducing cooling headroom

**Immediate Actions Required:**
- Migrate \`llm-finetune-v7\` to GPU-NODE-03 (47% capacity available)
- Replace Cooling Unit 3-B filter (ETA 45 min)
- Throttle GPU clock from 1.95GHz to 1.6GHz temporarily

**Predicted Timeline:**
- Without intervention: Thermal shutdown in ~18 minutes
- With throttling only: Stable but 23% performance degradation
- With full remediation: Return to baseline in ~90 minutes`,
    confidence: 96.4,
    type: 'analysis',
  },
  'default': {
    content: `I've analyzed your infrastructure based on current telemetry data.

**Infrastructure Summary:**
- 15 total nodes monitored
- 10 healthy, 4 in warning state, 1 critical
- Overall health score: 97.2/100
- AI risk assessment: LOW (score 28)

**Top Recommendations:**
1. Address GPU-NODE-01 thermal issue immediately (critical)
2. Expand STORAGE-01 capacity within 72h
3. Review DB-MASTER-01 query optimization
4. Schedule cooling maintenance for Rack Zone C

**Predicted Events (Next 24h):**
- 89% probability: Storage expansion needed
- 67% probability: DB connection pool saturation
- 34% probability: Traffic spike requiring horizontal scaling

Is there a specific aspect of your infrastructure you'd like me to analyze in depth?`,
    confidence: 94.7,
    type: 'recommendation',
  },
}

export default function AICopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'ai',
      content: `Hello, Administrator. I'm GuardAI Copilot, your AI-powered infrastructure intelligence system.

I have full situational awareness across all 247 nodes, 15 server instances, and your complete infrastructure topology. I've detected **1 critical issue** and **3 warnings** that need your attention.

How can I help you today? You can ask me anything about your infrastructure, request diagnostics, or ask for optimization recommendations.`,
      timestamp: new Date(),
      confidence: 99.9,
      type: 'normal',
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const resp = aiResponses[text] || aiResponses['default']
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: resp.content,
        timestamp: new Date(),
        confidence: resp.confidence,
        type: resp.type,
      }
      setMessages(m => [...m, aiMsg])
      setLoading(false)
    }, 1400 + Math.random() * 600)
  }

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) return <div key={i} style={{ fontSize: 14, fontWeight: 700, color: '#F1F5F9', margin: '12px 0 6px' }}>{line.slice(3)}</div>
        if (line.startsWith('**') && line.endsWith('**')) return <div key={i} style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', margin: '8px 0 4px' }}>{line.slice(2, -2)}</div>
        if (line.startsWith('- ')) return <div key={i} style={{ fontSize: 13, color: '#94A3B8', paddingLeft: 16, lineHeight: 1.6, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 4, color: '#60A5FA' }}>·</span>{line.slice(2)}
        </div>
        if (line.match(/^\d+\./)) return <div key={i} style={{ fontSize: 13, color: '#94A3B8', paddingLeft: 16, lineHeight: 1.6 }}>{line}</div>
        if (line === '') return <div key={i} style={{ height: 6 }} />
        return <div key={i} style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{line}</div>
      })
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
            boxShadow: '0 0 20px rgba(168,85,247,0.4)',
          }}>🤖</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>AI Copilot</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <span className="animate-blink" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: '#64748B' }}>GuardAI Neural Engine v4.2 · Full infrastructure awareness · 247 nodes monitored</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <span className="badge badge-green">Online</span>
            <span className="badge badge-purple">GPT-4o Enhanced</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', gap: 12,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              animation: 'fade-in 0.3s ease',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #3B82F6, #A855F7)'
                  : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: msg.role === 'user' ? 12 : 16, fontWeight: 700, color: 'white',
              }}>
                {msg.role === 'user' ? 'AD' : '🤖'}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: '75%' }}>
                <div style={{
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.15))'
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '12px 16px',
                }}>
                  {msg.role === 'user' ? (
                    <p style={{ margin: 0, fontSize: 13, color: '#E2E8F0', lineHeight: 1.6 }}>{msg.content}</p>
                  ) : (
                    <div>{renderMarkdown(msg.content)}</div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, paddingLeft: msg.role === 'ai' ? 4 : 0, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize: 10, color: '#334155' }}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.confidence && (
                    <span style={{ fontSize: 10, color: '#10B981' }}>
                      ✓ {msg.confidence}% confidence
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: 12, animation: 'fade-in 0.2s ease' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>🤖</div>
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px 18px 18px 4px', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {[0, 0.15, 0.3].map((delay, i) => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6, #A855F7)',
                    animation: `blink 0.8s ${delay}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="input-dark"
              placeholder="Ask about your infrastructure, request analysis, or get recommendations..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
              style={{ flex: 1, height: 44, borderRadius: 14, fontSize: 13 }}
            />
            <button className="btn-primary" onClick={() => sendMessage(input)}
              style={{ width: 44, height: 44, padding: 0, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14 2L8 8M14 2L10 14l-4-6-6-4 14-4z" stroke="white" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 280, borderLeft: '1px solid rgba(255,255,255,0.05)',
        overflowY: 'auto', padding: 20, flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {/* Suggested */}
        <div>
          <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>SUGGESTED QUERIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestedQuestions.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 10, padding: '8px 12px',
                color: '#94A3B8', fontSize: 12, cursor: 'pointer',
                textAlign: 'left', transition: 'all 0.15s', lineHeight: 1.4,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#60A5FA'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* AI Confidence meter */}
        <div className="glass-card" style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>ANALYSIS CONFIDENCE</div>
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 12px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="url(#confGrad)" strokeWidth="8"
                strokeDasharray={`${0.947 * 264} 264`} strokeLinecap="round"
                transform="rotate(-90 50 50)" />
              <defs>
                <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22D3EE" /><stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', fontFamily: "'JetBrains Mono', monospace" }}>94.7%</div>
              <div style={{ fontSize: 9, color: '#475569' }}>confidence</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#64748B', textAlign: 'center', lineHeight: 1.5 }}>
            AI analysis based on real-time telemetry, historical patterns, and ML prediction models.
          </div>
        </div>

        {/* Capabilities */}
        <div>
          <div style={{ fontSize: 11, color: '#334155', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10 }}>CAPABILITIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['🔍', 'Root Cause Analysis'],
              ['🔮', 'Failure Prediction'],
              ['🚀', 'Auto-Remediation'],
              ['📊', 'Capacity Planning'],
              ['🛡️', 'Security Analysis'],
              ['📋', 'Incident Reports'],
            ].map(([icon, label]) => (
              <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748B' }}>
                <span>{icon}</span><span>{label as string}</span>
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#10B981' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
