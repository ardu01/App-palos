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
    <div className="screen">
      <header className="home-hero">
        <p className="eyebrow">Golf · Social games</p>
        <h1 className="brand">PALOS</h1>
        <p className="lede">Hola, {profileName}</p>
        <p className="lede">Tu vuelta, varias rivalidades.</p>
      </header>

      <div className="stack">
        {live ? (
          <button className="btn btn-primary" onClick={resumeRound}>
            Reanudar vuelta
          </button>
        ) : null}
        <button className={live ? 'btn btn-ghost' : 'btn btn-primary'} onClick={() => setScreen('setup')}>
          Jugar
        </button>
      </div>

      {last ? (
        <>
          <h2 className="section-title">Última vuelta</h2>
          <div className="row">
            <div>
              <strong>{last.courseId.replace(/-/g, ' ')}</strong>
              <div className="meta">
                {new Date(last.finalizedAt || last.startedAt).toLocaleDateString('es-ES')} ·{' '}
                {last.players.map((p) => p.name).join(', ')}
              </div>
            </div>
            <button className="chip" onClick={() => setScreen('history')}>
              Ver
            </button>
          </div>
        </>
      ) : (
        <p className="note">Empieza una vuelta para generar historial, récords y rivalidades.</p>
      )}

      <h2 className="section-title">Cómo funciona</h2>
      <div className="card">
        <p className="note" style={{ margin: 0 }}>
          Una sola tarjeta. Stroke, Putting King, Chaos Golf y tus reglas custom se calculan solas.
          Los Social Games no son golf oficial.
        </p>
      </div>
    </div>
  )
}
