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
    <div className="screen" style={{ paddingTop: 0 }}>
      <section className="hero">
        <p className="eyebrow" style={{ color: 'rgba(245,248,246,0.75)' }}>
          Golf · Social games
        </p>
        <h1 className="brand">PALOS</h1>
        <p className="lede">Tu vuelta, varias rivalidades.</p>
        <div className="stack" style={{ marginTop: 28 }}>
          {live ? (
            <button className="btn btn-sand" onClick={resumeRound}>
              Reanudar vuelta
            </button>
          ) : null}
          <button className="btn btn-primary" onClick={() => setScreen('setup')} style={live ? { background: 'rgba(245,248,246,0.14)', border: '1px solid rgba(245,248,246,0.35)' } : undefined}>
            Jugar
          </button>
        </div>
      </section>

      <p className="muted">Hola, {profileName}</p>

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
      <p className="note">
        Una sola tarjeta. Stroke, Putting King, Chaos Golf y tus reglas custom se calculan solas.
        Los Social Games no son golf oficial.
      </p>
    </div>
  )
}
