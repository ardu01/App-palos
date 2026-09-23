import { useMemo, useState } from 'react'
import { courseById } from '../data/courses'
import { GAME_CATALOG } from '../data/games'
import {
  emptyEntry,
  gameTotals,
  strokeTotals,
  type HoleEntry,
} from '../engine/scoring'
import { useApp } from '../store/appStore'

export function LiveHole() {
  const session = useApp((s) => s.session)!
  const customs = useApp((s) => s.customRulesets)
  const setHole = useApp((s) => s.setHole)
  const setPlayer = useApp((s) => s.setPlayer)
  const upsertEntry = useApp((s) => s.upsertEntry)
  const finishRound = useApp((s) => s.finishRound)
  const setScreen = useApp((s) => s.setScreen)

  const [sheet, setSheet] = useState<'none' | 'card' | 'lb' | 'games'>('none')

  const course = courseById(session.courseId)!
  const holes = course.holes.filter((h) => session.holesToPlay.includes(h.number))
  const hole = course.holes.find((h) => h.number === session.currentHole)!
  const player = session.players.find((p) => p.id === session.currentPlayerId)!
  const entry = session.entries[player.id]?.[hole.number] ?? emptyEntry()
  const custom = customs.find((c) => c.id === session.customRulesetId)

  const needsPutts = session.socialGames.some((g) => {
    const def = GAME_CATALOG.find((x) => x.id === g)
    return def?.requires === 'B' || g.startsWith('custom:')
  })

  const primaryGame = session.socialGames[0]
  const primaryLb = useMemo(() => {
    if (!primaryGame) return strokeTotals(session.players, holes, session.entries)
    return gameTotals(primaryGame, session.players, holes, session.entries, custom)
  }, [primaryGame, session.players, holes, session.entries, custom])

  function save(patch: Partial<HoleEntry>) {
    upsertEntry(player.id, hole.number, patch)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }

  function nextHole() {
    const idx = session.holesToPlay.indexOf(session.currentHole)
    if (idx < session.holesToPlay.length - 1) {
      setHole(session.holesToPlay[idx + 1])
      setPlayer(session.players[0].id)
    } else {
      finishRound()
    }
  }

  const firNa = hole.par === 3
  const missingStats =
    needsPutts &&
    entry.strokes != null &&
    (entry.putts == null ||
      (session.socialGames.includes('gir_king') && entry.gir == null) ||
      (session.socialGames.includes('fairway_feroz') && !firNa && entry.fir == null))

  return (
    <div className="screen">
      <div className="hole-header">
        <div>
          <h1>
            Hoyo {hole.number} · Par {hole.par}
          </h1>
          <div className="meta">
            {course.name} · {session.teeId} · Hcp {hole.strokeIndex} · {hole.meters} m
          </div>
        </div>
        <button className="chip" onClick={() => setSheet('games')}>
          Retos
        </button>
      </div>

      <div className="player-switch">
        {session.players.map((p) => (
          <button
            key={p.id}
            className={`player-pill ${p.id === player.id ? 'active' : ''}`}
            onClick={() => setPlayer(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="score-stage">
        <div className="num" key={entry.strokes ?? 'x'}>
          {entry.strokes ?? '—'}
        </div>
        <div className="caption">golpes</div>
      </div>

      <div className="score-pad">
        {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            className={entry.strokes === n ? 'selected' : ''}
            onClick={() => save({ strokes: n })}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="stat-row">
        <button
          className={`stat-toggle ${firNa ? 'na' : entry.fir ? 'on' : ''}`}
          disabled={firNa}
          onClick={() => save({ fir: entry.fir == null ? true : entry.fir ? false : null })}
        >
          FIR
          <strong>{firNa ? 'N/A' : entry.fir == null ? '—' : entry.fir ? 'Sí' : 'No'}</strong>
        </button>
        <button
          className={`stat-toggle ${entry.gir ? 'on' : ''}`}
          onClick={() => save({ gir: entry.gir == null ? true : entry.gir ? false : null })}
        >
          GIR
          <strong>{entry.gir == null ? '—' : entry.gir ? 'Sí' : 'No'}</strong>
        </button>
        <button
          className="stat-toggle on"
          onClick={() =>
            save({
              putts: entry.putts == null ? 2 : entry.putts >= 4 ? null : entry.putts + 1,
            })
          }
        >
          PUTTS
          <strong>{entry.putts ?? '—'}</strong>
        </button>
        <button
          className={`stat-toggle ${entry.penalties || entry.lostBall ? 'on' : ''}`}
          onClick={() =>
            save({
              penalties: entry.penalties ? 0 : 1,
              lostBall: !entry.lostBall,
            })
          }
        >
          PEN
          <strong>{entry.penalties || 0}</strong>
        </button>
      </div>

      {missingStats ? (
        <p className="warn">Faltan stats opcionales para algún Social Game activo.</p>
      ) : null}

      {primaryGame ? (
        <div className="leader-strip">
          <span>
            <span className="badge">Social</span>{' '}
            {GAME_CATALOG.find((g) => g.id === primaryGame)?.name ||
              custom?.name ||
              primaryGame}
          </span>
          <strong>
            {primaryLb[0]?.name} {primaryLb[0]?.value >= 0 ? '+' : ''}
            {primaryLb[0]?.value ?? 0}
          </strong>
        </div>
      ) : (
        <div className="leader-strip">
          <span>Stroke</span>
          <strong>
            {primaryLb[0]?.name} {primaryLb[0]?.value ?? '—'}
          </strong>
        </div>
      )}

      <div className="thumb-bar">
        <button className="btn btn-ghost" onClick={() => setSheet('card')}>
          Tarjeta
        </button>
        <button className="btn btn-ghost" onClick={() => setSheet('lb')}>
          Ranking
        </button>
        <button className="btn btn-primary" onClick={nextHole}>
          {session.currentHole === session.holesToPlay[session.holesToPlay.length - 1]
            ? 'Finalizar'
            : 'Siguiente →'}
        </button>
      </div>

      <div className="chip-row" style={{ marginTop: 16, justifyContent: 'center' }}>
        {session.holesToPlay.map((n) => (
          <button
            key={n}
            className={`chip ${n === session.currentHole ? 'active' : ''}`}
            onClick={() => setHole(n)}
            style={{ minWidth: 40, padding: '0 10px' }}
          >
            {n}
          </button>
        ))}
      </div>

      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setScreen('home')}>
        Salir (guarda en el móvil)
      </button>

      {sheet !== 'none' ? (
        <div className="sheet" onClick={() => setSheet('none')}>
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
            {sheet === 'card' ? <CardSheet /> : null}
            {sheet === 'lb' ? <LeaderSheet /> : null}
            {sheet === 'games' ? <GamesSheet onClose={() => setSheet('none')} /> : null}
            <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setSheet('none')}>
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function CardSheet() {
  const session = useApp((s) => s.session)!
  const course = courseById(session.courseId)!
  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>
        Tarjeta
      </h2>
      <div className="list">
        {session.players.map((p) => {
          let total = 0
          let par = 0
          let n = 0
          for (const h of course.holes) {
            const e = session.entries[p.id]?.[h.number]
            if (e?.strokes != null) {
              total += e.strokes
              par += h.par
              n++
            }
          }
          return (
            <div className="row" key={p.id}>
              <strong>{p.name}</strong>
              <span>
                {n ? `${total} (${total - par >= 0 ? '+' : ''}${total - par})` : '—'}
              </span>
            </div>
          )
        })}
      </div>
    </>
  )
}

function LeaderSheet() {
  const session = useApp((s) => s.session)!
  const customs = useApp((s) => s.customRulesets)
  const course = courseById(session.courseId)!
  const holes = course.holes.filter((h) => session.holesToPlay.includes(h.number))
  const custom = customs.find((c) => c.id === session.customRulesetId)
  const stroke = strokeTotals(session.players, holes, session.entries)

  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>
        Leaderboards
      </h2>
      <p className="eyebrow">Stroke</p>
      <Podio rows={stroke} lowerBetter />
      {session.socialGames.map((g) => {
        const name =
          GAME_CATALOG.find((x) => x.id === g)?.name ||
          (g.startsWith('custom:') ? custom?.name : g) ||
          g
        const rows = gameTotals(g, session.players, holes, session.entries, custom)
        return (
          <div key={g}>
            <p className="eyebrow" style={{ marginTop: 18 }}>
              <span className="badge">Social</span> {name}
            </p>
            <Podio rows={rows} />
          </div>
        )
      })}
    </>
  )
}

function GamesSheet({ onClose }: { onClose: () => void }) {
  const session = useApp((s) => s.session)!
  const customs = useApp((s) => s.customRulesets)
  void onClose
  return (
    <>
      <h2 className="section-title" style={{ marginTop: 0 }}>
        Activos en esta vuelta
      </h2>
      <div className="list">
        {session.officialFormats.map((f) => (
          <div className="row" key={f}>
            <strong>{f === 'STROKE' ? 'Stroke Play' : 'Stableford'}</strong>
            <span className="muted">Oficial</span>
          </div>
        ))}
        {session.socialGames.map((g) => (
          <div className="row" key={g}>
            <div>
              <strong>
                {GAME_CATALOG.find((x) => x.id === g)?.name ||
                  customs.find((c) => `custom:${c.id}` === g)?.name ||
                  g}
              </strong>
              <div className="meta">Social Game — no oficial</div>
            </div>
            <span className="badge">Social</span>
          </div>
        ))}
      </div>
    </>
  )
}

function Podio({
  rows,
  lowerBetter,
}: {
  rows: { playerId: string; name: string; value: number; detail?: string }[]
  lowerBetter?: boolean
}) {
  return (
    <div className={`list podium`}>
      {rows.map((r, i) => (
        <div className="row" key={r.playerId}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="rank">{i + 1}</span>
            <div>
              <strong>{r.name}</strong>
              {r.detail ? <div className="meta">{r.detail}</div> : null}
            </div>
          </div>
          <strong>
            {lowerBetter ? r.value : r.value > 0 ? `+${r.value}` : r.value}
          </strong>
        </div>
      ))}
    </div>
  )
}
