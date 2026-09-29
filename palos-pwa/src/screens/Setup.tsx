import { COURSES } from '../data/courses'
import { GAME_CATALOG } from '../data/games'
import { useApp } from '../store/appStore'

export function Setup() {
  const draft = useApp((s) => s.setupDraft)
  const updateSetup = useApp((s) => s.updateSetup)
  const startRound = useApp((s) => s.startRound)
  const setScreen = useApp((s) => s.setScreen)
  const customs = useApp((s) => s.customRulesets)

  const course = COURSES.find((c) => c.id === draft.courseId) || COURSES[0]
  const names = draft.playerNames || ['Miguel', 'Ana']

  function toggleGame(id: string) {
    const current = draft.socialGames || []
    const next = current.includes(id) ? current.filter((g) => g !== id) : [...current, id].slice(0, 3)
    updateSetup({ socialGames: next })
  }

  function toggleFormat(f: 'STROKE' | 'STABLEFORD') {
    const current = draft.officialFormats || ['STROKE']
    let next = current.includes(f) ? current.filter((x) => x !== f) : [...current, f]
    if (!next.length) next = ['STROKE']
    updateSetup({ officialFormats: next })
  }

  return (
    <div className="screen">
      <button className="chip" onClick={() => setScreen('home')}>
        ← Atrás
      </button>
      <h1 className="section-title" style={{ marginTop: 12 }}>
        Nueva partida
      </h1>

      <div className="field">
        <label>Campo</label>
        <select
          value={course.id}
          onChange={(e) => {
            const c = COURSES.find((x) => x.id === e.target.value)!
            updateSetup({ courseId: c.id, teeId: c.tees[0].id })
          }}
        >
          {COURSES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ marginTop: 12 }}>
        <label>Tee</label>
        <select value={draft.teeId} onChange={(e) => updateSetup({ teeId: e.target.value })}>
          {course.tees.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <h2 className="section-title">Jugadores</h2>
      <div className="stack">
        {names.map((n, i) => (
          <div className="field" key={i}>
            <label>Jugador {i + 1}</label>
            <input
              value={n}
              onChange={(e) => {
                const next = [...names]
                next[i] = e.target.value
                updateSetup({ playerNames: next })
              }}
            />
          </div>
        ))}
        <div className="chip-row">
          {names.length < 4 ? (
            <button className="chip" onClick={() => updateSetup({ playerNames: [...names, `Jugador ${names.length + 1}`] })}>
              + Jugador
            </button>
          ) : null}
          {names.length > 1 ? (
            <button className="chip" onClick={() => updateSetup({ playerNames: names.slice(0, -1) })}>
              − Quitar
            </button>
          ) : null}
        </div>
      </div>

      <h2 className="section-title">Modalidad oficial</h2>
      <div className="chip-row">
        {(['STROKE', 'STABLEFORD'] as const).map((f) => (
          <button key={f} className={`chip ${(draft.officialFormats || []).includes(f) ? 'active' : ''}`} onClick={() => toggleFormat(f)}>
            {f === 'STROKE' ? 'Stroke' : 'Stableford'}
          </button>
        ))}
      </div>

      <h2 className="section-title">Social Games</h2>
      <p className="note">Máx. 3. Reutilizan la misma tarjeta. No son golf oficial.</p>
      <div className="chip-row" style={{ marginTop: 10 }}>
        {GAME_CATALOG.map((g) => (
          <button
            key={g.id}
            className={`chip social ${(draft.socialGames || []).includes(g.id) ? 'active' : ''}`}
            onClick={() => toggleGame(g.id)}
          >
            {g.name}
          </button>
        ))}
        {customs.map((c) => {
          const id = `custom:${c.id}`
          return (
            <button
              key={id}
              className={`chip social ${(draft.socialGames || []).includes(id) ? 'active' : ''}`}
              onClick={() => toggleGame(id)}
            >
              {c.name}
            </button>
          )
        })}
      </div>
      <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setScreen('builder')}>
        Custom Game Builder
      </button>

      <div className="stack" style={{ marginTop: 28 }}>
        <button className="btn btn-primary" onClick={startRound}>
          Empezar vuelta
        </button>
      </div>
    </div>
  )
}
