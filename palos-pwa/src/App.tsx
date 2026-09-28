import { useApp } from './store/appStore'
import { Home } from './screens/Home'
import { Setup } from './screens/Setup'
import { LiveHole } from './screens/LiveHole'
import { Summary } from './screens/Summary'
import { History } from './screens/History'
import { Builder } from './screens/Builder'

function TabIcon({ name }: { name: 'home' | 'play' | 'history' | 'games' }) {
  if (name === 'home') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1z" />
      </svg>
    )
  }
  if (name === 'play') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 20.5V4.2" />
        <path d="M6 5.2h11.2L14 9.1l3.2 3.8H6" />
      </svg>
    )
  }
  if (name === 'history') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="7.25" />
        <path d="M12 8.2V12l2.6 1.8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="4.5" width="6.2" height="6.2" rx="1.4" />
      <rect x="13.3" y="4.5" width="6.2" height="6.2" rx="1.4" />
      <rect x="4.5" y="13.3" width="6.2" height="6.2" rx="1.4" />
      <rect x="13.3" y="13.3" width="6.2" height="6.2" rx="1.4" />
    </svg>
  )
}

export default function App() {
  const screen = useApp((s) => s.screen)
  const setScreen = useApp((s) => s.setScreen)
  const session = useApp((s) => s.session)

  const showTabs = ['home', 'history', 'builder', 'setup'].includes(screen)

  return (
    <div className="app-shell">
      {screen === 'home' && <Home />}
      {screen === 'setup' && <Setup />}
      {screen === 'live' && (session ? <LiveHole /> : <Home />)}
      {screen === 'summary' && <Summary />}
      {screen === 'history' && <History />}
      {screen === 'builder' && <Builder />}

      {showTabs ? (
        <nav className="tabbar" aria-label="Principal">
          <button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}>
            <span className="tab-ico">
              <TabIcon name="home" />
            </span>
            <span>Home</span>
          </button>
          <button
            className={screen === 'setup' ? 'active' : ''}
            onClick={() => setScreen(session?.status === 'live' ? 'live' : 'setup')}
          >
            <span className="tab-ico">
              <TabIcon name="play" />
            </span>
            <span>Play</span>
          </button>
          <button className={screen === 'history' ? 'active' : ''} onClick={() => setScreen('history')}>
            <span className="tab-ico">
              <TabIcon name="history" />
            </span>
            <span>Historial</span>
          </button>
          <button className={screen === 'builder' ? 'active' : ''} onClick={() => setScreen('builder')}>
            <span className="tab-ico">
              <TabIcon name="games" />
            </span>
            <span>Games</span>
          </button>
        </nav>
      ) : null}
    </div>
  )
}
