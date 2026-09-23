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
          <button className={screen === 'home' ? 'active' : ''} onClick={() => setScreen('home')}>
            Home
          </button>
          <button
            className={screen === 'setup' ? 'active' : ''}
            onClick={() => setScreen(session?.status === 'live' ? 'live' : 'setup')}
          >
            Play
          </button>
          <button className={screen === 'history' ? 'active' : ''} onClick={() => setScreen('history')}>
            Historial
          </button>
          <button className={screen === 'builder' ? 'active' : ''} onClick={() => setScreen('builder')}>
            Games
          </button>
        </nav>
      ) : null}
    </div>
  )
}
