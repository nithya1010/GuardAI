import { useState } from 'react'
import Login from './pages/Login'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Dashboard from './pages/Dashboard'
import DigitalTwinPage from './pages/DigitalTwinPage'
import Servers from './pages/Servers'
import Monitoring from './pages/Monitoring'
import AICopilot from './pages/AICopilot'
import Alerts from './pages/Alerts'
import Predictions from './pages/Predictions'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

type Page = 'dashboard' | 'digital-twin' | 'servers' | 'monitoring' | 'copilot' | 'alerts' | 'predictions' | 'reports' | 'settings'

function PageContent({ page, onNavigate }: { page: Page; onNavigate: (p: string) => void }) {
  switch (page) {
    case 'dashboard': return <Dashboard onNavigate={onNavigate} />
    case 'digital-twin': return <DigitalTwinPage />
    case 'servers': return <Servers />
    case 'monitoring': return <Monitoring />
    case 'copilot': return <AICopilot />
    case 'alerts': return <Alerts />
    case 'predictions': return <Predictions />
    case 'reports': return <Reports />
    case 'settings': return <Settings />
    default: return <Dashboard onNavigate={onNavigate} />
  }
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState<Page>('dashboard')

  const navigate = (p: string) => {
    if (p === 'logout') { setLoggedIn(false); return }
    setPage(p as Page)
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      background: '#030712',
      overflow: 'hidden',
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-20%', right: '-10%',
          width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', top: '30%', right: '20%',
          width: '30%', height: '30%',
          background: 'radial-gradient(circle, rgba(34,211,238,0.02) 0%, transparent 70%)',
        }} />
      </div>

      <Sidebar activePage={page} onNavigate={navigate} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        <TopBar activePage={page} onNavigate={navigate} />

        <div style={{ flex: 1, overflow: 'hidden' }} key={page} className="animate-fade-in">
          <PageContent page={page} onNavigate={navigate} />
        </div>
      </div>
    </div>
  )
}
