import { courseById } from '../data/courses'
import { useApp } from '../store/appStore'

export function History() {
  const history = useApp((s) => s.history)
  const setScreen = useApp((s) => s.setScreen)

  return (
    <div className="screen">
      <h1 className="section-title" style={{ marginTop: 0 }}>
        Historial
      </h1>
      {!history.length ? (
        <p className="empty">Aún no hay vueltas finalizadas.</p>
      ) : (
        <div className="list">
          {history.map((r) => {
            const course = courseById(r.courseId)
            return (
              <div className="row" key={r.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 6 }}>
                <strong>{course?.name || r.courseId}</strong>
                <div className="meta">
                  {new Date(r.finalizedAt || r.startedAt).toLocaleString('es-ES')} ·{' '}
                  {r.players.map((p) => p.name).join(', ')}
                </div>
                <div className="chip-row">
                  {r.officialFormats.map((f) => (
                    <span className="chip" key={f}>
                      {f}
                    </span>
                  ))}
                  {r.socialGames.map((g) => (
                    <span className="chip social" key={g}>
                      {g.replace('custom:', '').replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
      <button className="btn btn-ghost" style={{ marginTop: 20 }} onClick={() => setScreen('home')}>
        Home
      </button>
    </div>
  )
}
