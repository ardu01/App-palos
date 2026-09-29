import type { ReactNode } from 'react'
import { useApp } from './store/appStore'
import { Home } from './screens/Home'
import { Setup } from './screens/Setup'
import { LiveHole } from './screens/LiveHole'
import { Summary } from './screens/Summary'
import { History } from './screens/History'
import { Builder } from './screens/Builder'

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
          <button className={screen === 'home' ? 'tab active' : 'tab'} onClick={() => setScreen('home')}>
            <TabIcon name="home" />
            Home
          </button>
          <button
            className={screen === 'setup' ? 'tab active' : 'tab'}
            onClick={() => setScreen(session?.status === 'live' ? 'live' : 'setup')}
          >
            <TabIcon name="play" />
            Play
          </button>
          <button className={screen === 'history' ? 'tab active' : 'tab'} onClick={() => setScreen('history')}>
            <TabIcon name="history" />
            Historial
          </button>
          <button className={screen === 'builder' ? 'tab active' : 'tab'} onClick={() => setScreen('builder')}>
            <TabIcon name="games" />
            Games
          </button>
        </nav>
      ) : null}
    </div>
  )
}

function TabIcon({ name }: { name: 'home' | 'play' | 'history' | 'games' }) {
  return (
    <span className="ico" aria-hidden="true">
      {icons[name]}
    </span>
  )
}

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const icons: Record<'home' | 'play' | 'history' | 'games', ReactNode> = {
  home: (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <path {...stroke} d="M3 9.2 11 3l8 6.2V17a1 1 0 0 1-1 1h-4.2v-5.2H8.2V18H4a1 1 0 0 1-1-1V9.2Z" />
    </svg>
  ),
  play: (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <circle {...stroke} cx="11" cy="10" r="7" />
      <path {...stroke} d="M9.2 7.2v5.6L14.2 10 9.2 7.2Z" />
    </svg>
  ),
  history: (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <circle {...stroke} cx="11" cy="10" r="7" />
      <path {...stroke} d="M11 6.4V10l2.6 1.8" />
    </svg>
  ),
  games: (
    <svg width="22" height="20" viewBox="0 0 22 20">
      <rect {...stroke} x="3" y="3" width="6.2" height="5.6" rx="1.4" />
      <rect {...stroke} x="12.8" y="3" width="6.2" height="5.6" rx="1.4" />
      <rect {...stroke} x="3" y="11.4" width="6.2" height="5.6" rx="1.4" />
      <rect {...stroke} x="12.8" y="11.4" width="6.2" height="5.6" rx="1.4" />
    </svg>
  ),
}
