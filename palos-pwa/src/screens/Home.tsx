import { useApp } from '../store/appStore'

export function Home() {
  const session = useApp((s) => s.session)
  const history = useApp((s) => s.history)
  const setScreen = useApp((s) => s.setScreen)
  const resumeRound = useApp((s) => s.resumeRound)
  const profileName = useApp((s) => s.profileName)

  const live = session?.status === 'live'
  const last = history[0]

  return (
    <div className="screen home-screen">
      <header className="home-hero">
        <p className="eyebrow">Golf · Social games</p>
        <h1 className="greeting">PALOS</h1>
        <p className="greeting-sub">Tu vuelta, varias rivalidades.</p>
        <p className="hello">Hola, {profileName}</p>
      </header>

      <div className="stack">
        {live ? (
          <button className="btn btn-primary" onClick={resumeRound}>
            Reanudar vuelta
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setScreen('setup')}>
            Jugar
          </button>
        )}
        {live ? (
          <button className="btn btn-secondary" onClick={() => setScreen('setup')}>
            Jugar
          </button>
        ) : null}
      </div>

      {last ? (
        <section className="card">
          <p className="eyebrow">Última vuelta</p>
          <strong>{last.courseId.replace(/-/g, ' ')}</strong>
          <div className="meta">
            {new Date(last.finalizedAt || last.startedAt).toLocaleDateString('es-ES')} ·{' '}
            {last.players.map((p) => p.name).join(', ')}
          </div>
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setScreen('history')}>
            Ver
          </button>
        </section>
      ) : (
        <p className="note">Empieza una vuelta para generar historial, récords y rivalidades.</p>
      )}

      <section className="card">
        <h2 className="section-title">Cómo funciona</h2>
        <p className="note" style={{ marginTop: 0 }}>
          Una sola tarjeta. Stroke, Putting King, Chaos Golf y tus reglas custom se calculan solas.
          Los Social Games no son golf oficial.
        </p>
      </section>
    </div>
  )
}
