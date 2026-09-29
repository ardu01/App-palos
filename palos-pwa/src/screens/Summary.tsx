import { courseById } from '../data/courses'
import { GAME_CATALOG } from '../data/games'
import { derivePlayerStats, gameTotals, strokeTotals } from '../engine/scoring'
import { useApp } from '../store/appStore'

export function Summary() {
  const session = useApp((s) => s.session)
  const customs = useApp((s) => s.customRulesets)
  const setScreen = useApp((s) => s.setScreen)
  const abandonRound = useApp((s) => s.abandonRound)

  if (!session) {
    return (
      <div className="screen">
        <p className="empty">No hay resumen.</p>
        <button className="btn btn-primary" onClick={() => setScreen('home')}>
          Home
        </button>
      </div>
    )
  }

  const course = courseById(session.courseId)!
  const holes = course.holes.filter((h) => session.holesToPlay.includes(h.number))
  const custom = customs.find((c) => c.id === session.customRulesetId)
  const stroke = strokeTotals(session.players, holes, session.entries)

  return (
    <div className="screen">
      <p className="eyebrow">Fin de vuelta</p>
      <h1 className="section-title" style={{ marginTop: 0, fontSize: '2rem' }}>
        {course.name}
      </h1>
      <p className="muted">
        {session.players.map((p) => p.name).join(' · ')} · una tarjeta, varias rivalidades
      </p>

      <h2 className="section-title">Stroke</h2>
      <div className="list podium">
        {stroke.map((r, i) => (
          <div className="row" key={r.playerId}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span className="rank">{i + 1}</span>
              <strong>{r.name}</strong>
            </div>
            <span>
              {r.value} <span className="muted">({r.detail})</span>
            </span>
          </div>
        ))}
      </div>

      {session.socialGames.map((g) => {
        const name =
          GAME_CATALOG.find((x) => x.id === g)?.name ||
          (g.startsWith('custom:') ? custom?.name : g) ||
          g
        const rows = gameTotals(g, session.players, holes, session.entries, custom)
        return (
          <div key={g}>
            <h2 className="section-title">
              <span className="badge">Social</span> {name}
            </h2>
            <div className="list podium">
              {rows.map((r, i) => (
                <div className="row" key={r.playerId}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className="rank">{i + 1}</span>
                    <strong>{r.name}</strong>
                  </div>
                  <strong>{r.value > 0 ? `+${r.value}` : r.value}</strong>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <h2 className="section-title">Stats</h2>
      <div className="list">
        {session.players.map((p) => {
          const st = derivePlayerStats(holes, session.entries[p.id] || {})
          return (
            <div className="row" key={p.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <strong>{p.name}</strong>
              <div className="meta">
                {st.vsPar == null ? '—' : st.vsPar >= 0 ? `+${st.vsPar}` : st.vsPar} · Birdies{' '}
                {st.birdies} · Putts {st.putts ?? '—'} · GIR {st.girPct == null ? '—' : `${st.girPct}%`} ·
                FIR {st.firPct == null ? '—' : `${st.firPct}%`}
              </div>
            </div>
          )
        })}
      </div>

      <p className="note" style={{ marginTop: 16 }}>
        Social Games — reglas del grupo. No afectan Handicap Index.
      </p>

      <div className="stack" style={{ marginTop: 24 }}>
        <button
          className="btn btn-primary"
          onClick={() => {
            abandonRound()
            setScreen('home')
          }}
        >
          Volver a Home
        </button>
        <button className="btn btn-ghost" onClick={() => setScreen('history')}>
          Ver historial
        </button>
      </div>
    </div>
  )
}
