import type { CourseHole } from '../data/courses'
import type { CustomRuleset } from '../data/games'

export type HoleEntry = {
  strokes: number | null
  putts: number | null
  fir: boolean | null
  gir: boolean | null
  penalties: number
  lostBall: boolean
}

export type Player = {
  id: string
  name: string
}

function vsPar(strokes: number, par: number) {
  return strokes - par
}

export function scoreLabel(diff: number) {
  if (diff <= -3) return 'Albatros+'
  if (diff === -2) return 'Eagle'
  if (diff === -1) return 'Birdie'
  if (diff === 0) return 'Par'
  if (diff === 1) return 'Bogey'
  if (diff === 2) return 'Doble'
  return 'Triple+'
}

function puttingPoints(putts: number | null) {
  if (putts === null) return null
  if (putts === 0) return 3
  if (putts === 1) return 2
  if (putts === 2) return 0
  if (putts === 3) return -2
  return -4
}

function chaosPoints(entry: HoleEntry, hole: CourseHole) {
  if (entry.strokes == null) return null
  const diff = vsPar(entry.strokes, hole.par)
  let pts = 0
  if (diff <= -2) pts += 8
  else if (diff === -1) pts += 5
  else if (diff === 0) pts += 2
  else if (diff === 1) pts += 0
  else if (diff === 2) pts -= 2
  else pts -= 4

  if (entry.putts === 1) pts += 2
  if (entry.putts === 3) pts -= 2
  if (entry.putts != null && entry.putts >= 4) pts -= 4
  if (entry.gir === true) pts += 1
  if (entry.fir === true) pts += 1
  if (entry.lostBall) pts -= 3
  pts -= entry.penalties * 3
  return pts
}

function customPoints(entry: HoleEntry, hole: CourseHole, ruleset: CustomRuleset) {
  if (entry.strokes == null) return null
  const diff = vsPar(entry.strokes, hole.par)
  const flags = new Set<string>()
  if (diff <= -2) flags.add('SCORE_EAGLE_PLUS')
  else if (diff === -1) flags.add('SCORE_BIRDIE')
  else if (diff === 0) flags.add('SCORE_PAR')
  else if (diff === 1) flags.add('SCORE_BOGEY')
  else if (diff === 2) flags.add('SCORE_DOUBLE')
  else flags.add('SCORE_TRIPLE_PLUS')

  if (entry.putts === 0) flags.add('PUTTS_0')
  if (entry.putts === 1) flags.add('PUTTS_1')
  if (entry.putts === 2) flags.add('PUTTS_2')
  if (entry.putts === 3) flags.add('PUTTS_3')
  if (entry.putts != null && entry.putts >= 4) flags.add('PUTTS_4_PLUS')
  if (entry.gir === true) flags.add('GIR_TRUE')
  if (entry.fir === true) flags.add('FIR_TRUE')
  if (entry.lostBall) flags.add('LOST_BALL')

  return ruleset.rules.reduce((sum, r) => sum + (flags.has(r.when) ? r.points : 0), 0)
}

export function evaluateGameHole(
  gameId: string,
  entry: HoleEntry,
  hole: CourseHole,
  allEntriesOnHole: { playerId: string; entry: HoleEntry }[],
  playerId: string,
  custom?: CustomRuleset,
): number | null {
  if (entry.strokes == null) return null
  const diff = vsPar(entry.strokes, hole.par)

  switch (gameId) {
    case 'putting_king':
      return puttingPoints(entry.putts)
    case 'gir_king': {
      if (entry.gir == null) return null
      if (!entry.gir) return 0
      return diff <= -1 ? 4 : 2
    }
    case 'chaos_golf':
      return chaosPoints(entry, hole)
    case 'birdie_hunt': {
      let pts = 0
      if (diff <= -2) pts = 6
      else if (diff === -1) pts = 3
      const birdiePlayers = allEntriesOnHole.filter(
        (p) => p.entry.strokes != null && vsPar(p.entry.strokes, hole.par) <= -1,
      )
      if (diff <= -1 && birdiePlayers.length === 1 && birdiePlayers[0].playerId === playerId) {
        pts += 2
      }
      return pts
    }
    case 'par_machine':
      return diff <= 0 ? 1 : 0
    case 'skins_social': {
      const scored = allEntriesOnHole.filter((p) => p.entry.strokes != null)
      if (scored.length < 2) return 0
      const best = Math.min(...scored.map((p) => p.entry.strokes!))
      const winners = scored.filter((p) => p.entry.strokes === best)
      if (winners.length !== 1) return 0
      return winners[0].playerId === playerId ? 1 : 0
    }
    case 'fairway_feroz': {
      if (hole.par === 3) return 0
      if (entry.fir == null) return null
      return entry.fir ? 3 : -1
    }
    case 'steady_eddie': {
      if (diff === 0) return 3
      if (diff === -1 || diff === 1) return 1
      return -2
    }
    default: {
      if (gameId.startsWith('custom:') && custom) {
        return customPoints(entry, hole, custom)
      }
      return 0
    }
  }
}

export type LeaderRow = {
  playerId: string
  name: string
  value: number
  detail?: string
}

export function strokeTotals(
  players: Player[],
  holes: CourseHole[],
  entries: Record<string, Record<number, HoleEntry>>,
): LeaderRow[] {
  return players
    .map((p) => {
      let strokes = 0
      let par = 0
      let counted = 0
      for (const h of holes) {
        const e = entries[p.id]?.[h.number]
        if (e?.strokes != null) {
          strokes += e.strokes
          par += h.par
          counted++
        }
      }
      return {
        playerId: p.id,
        name: p.name,
        value: strokes,
        detail: counted ? `${strokes - par >= 0 ? '+' : ''}${strokes - par} · ${counted}h` : '—',
      }
    })
    .sort((a, b) => a.value - b.value || a.name.localeCompare(b.name))
}

export function gameTotals(
  gameId: string,
  players: Player[],
  holes: CourseHole[],
  entries: Record<string, Record<number, HoleEntry>>,
  custom?: CustomRuleset,
): LeaderRow[] {
  // Skins with carry
  if (gameId === 'skins_social') {
    const skins: Record<string, number> = Object.fromEntries(players.map((p) => [p.id, 0]))
    let carry = 1
    for (const h of holes) {
      const onHole = players.map((p) => ({ playerId: p.id, entry: entries[p.id]?.[h.number] ?? emptyEntry() }))
      const scored = onHole.filter((x) => x.entry.strokes != null)
      if (scored.length < 2) continue
      const best = Math.min(...scored.map((x) => x.entry.strokes!))
      const winners = scored.filter((x) => x.entry.strokes === best)
      if (winners.length === 1) {
        skins[winners[0].playerId] += carry
        carry = 1
      } else {
        carry += 1
      }
    }
    return players
      .map((p) => ({ playerId: p.id, name: p.name, value: skins[p.id], detail: `${skins[p.id]} skins` }))
      .sort((a, b) => b.value - a.value)
  }

  // Par machine streak bonus
  if (gameId === 'par_machine') {
    return players
      .map((p) => {
        let pts = 0
        let streak = 0
        const awarded = new Set<number>()
        for (const h of holes) {
          const e = entries[p.id]?.[h.number]
          if (e?.strokes == null) continue
          const diff = e.strokes - h.par
          if (diff <= 0) {
            pts += 1
            streak += 1
            if (streak === 3 && !awarded.has(3)) {
              pts += 2
              awarded.add(3)
            }
            if (streak === 5 && !awarded.has(5)) {
              pts += 4
              awarded.add(5)
            }
            if (streak === 9 && !awarded.has(9)) {
              pts += 8
              awarded.add(9)
            }
          } else {
            streak = 0
          }
        }
        return { playerId: p.id, name: p.name, value: pts }
      })
      .sort((a, b) => b.value - a.value)
  }

  return players
    .map((p) => {
      let total = 0
      let missing = 0
      for (const h of holes) {
        const onHole = players.map((pl) => ({
          playerId: pl.id,
          entry: entries[pl.id]?.[h.number] ?? emptyEntry(),
        }))
        const e = entries[p.id]?.[h.number] ?? emptyEntry()
        const pts = evaluateGameHole(gameId, e, h, onHole, p.id, custom)
        if (pts == null) missing++
        else total += pts
      }
      return {
        playerId: p.id,
        name: p.name,
        value: total,
        detail: missing ? `${missing} hoyos sin stats` : undefined,
      }
    })
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
}

export function emptyEntry(): HoleEntry {
  return {
    strokes: null,
    putts: null,
    fir: null,
    gir: null,
    penalties: 0,
    lostBall: false,
  }
}

export function stablefordPoints(strokes: number, par: number) {
  const diff = strokes - par
  if (diff <= -2) return 4
  if (diff === -1) return 3
  if (diff === 0) return 2
  if (diff === 1) return 1
  return 0
}

export function derivePlayerStats(
  holes: CourseHole[],
  entries: Record<number, HoleEntry>,
) {
  let strokes = 0
  let par = 0
  let holesPlayed = 0
  let birdies = 0
  let pars = 0
  let bogeys = 0
  let doubles = 0
  let putts = 0
  let puttHoles = 0
  let girHit = 0
  let girAtt = 0
  let firHit = 0
  let firAtt = 0
  let onePutts = 0
  let threePutts = 0

  for (const h of holes) {
    const e = entries[h.number]
    if (!e || e.strokes == null) continue
    holesPlayed++
    strokes += e.strokes
    par += h.par
    const d = e.strokes - h.par
    if (d <= -1) birdies++
    else if (d === 0) pars++
    else if (d === 1) bogeys++
    else doubles++

    if (e.putts != null) {
      putts += e.putts
      puttHoles++
      if (e.putts === 1) onePutts++
      if (e.putts >= 3) threePutts++
    }
    if (e.gir != null) {
      girAtt++
      if (e.gir) girHit++
    }
    if (h.par >= 4 && e.fir != null) {
      firAtt++
      if (e.fir) firHit++
    }
  }

  return {
    holesPlayed,
    strokes,
    vsPar: holesPlayed ? strokes - par : null,
    birdies,
    pars,
    bogeys,
    doubles,
    putts: puttHoles ? putts : null,
    girPct: girAtt ? Math.round((girHit / girAtt) * 100) : null,
    firPct: firAtt ? Math.round((firHit / firAtt) * 100) : null,
    onePutts,
    threePutts,
  }
}
