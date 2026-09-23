import { useMemo, useState } from 'react'
import { EVENT_OPTIONS, type CustomRule, type CustomRuleset } from '../data/games'
import { useApp } from '../store/appStore'

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 3; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `PALOS-${s}`
}

export function Builder() {
  const saveCustomRuleset = useApp((s) => s.saveCustomRuleset)
  const customs = useApp((s) => s.customRulesets)
  const importCustomByCode = useApp((s) => s.importCustomByCode)
  const updateSetup = useApp((s) => s.updateSetup)
  const draft = useApp((s) => s.setupDraft)
  const setScreen = useApp((s) => s.setScreen)

  const [name, setName] = useState('Sunday Chaos')
  const [rules, setRules] = useState<CustomRule[]>([
    { when: 'SCORE_BIRDIE', points: 5 },
    { when: 'SCORE_PAR', points: 2 },
    { when: 'SCORE_DOUBLE', points: -2 },
    { when: 'GIR_TRUE', points: 1 },
    { when: 'PUTTS_1', points: 2 },
    { when: 'PUTTS_3', points: -2 },
    { when: 'LOST_BALL', points: -5 },
  ])
  const [codeIn, setCodeIn] = useState('')
  const [msg, setMsg] = useState('')

  const errors = useMemo(() => {
    const e: string[] = []
    if (!name.trim()) e.push('Nombre vacío')
    if (!rules.length) e.push('Sin reglas')
    if (rules.some((r) => r.points < -50 || r.points > 50)) e.push('Puntos fuera de rango')
    if (rules.every((r) => r.points === 0)) e.push('Todas las reglas dan 0')
    const pairs = rules.map((r) => r.when)
    if (new Set(pairs).size !== pairs.length) e.push('Eventos duplicados')
    return e
  }, [name, rules])

  const sim = useMemo(() => {
    // birdie + 1 putt + GIR
    const flags = new Set(['SCORE_BIRDIE', 'PUTTS_1', 'GIR_TRUE'])
    return rules.reduce((s, r) => s + (flags.has(r.when) ? r.points : 0), 0)
  }, [rules])

  function save() {
    if (errors.length) {
      setMsg(errors.join(' · '))
      return
    }
    const ruleset: CustomRuleset = {
      id: name.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now().toString(36).slice(-3),
      name: name.trim(),
      shareCode: makeCode(),
      requires: 'B',
      rules,
    }
    saveCustomRuleset(ruleset)
    updateSetup({
      socialGames: [...(draft.socialGames || []).filter((g) => !g.startsWith('custom:')), `custom:${ruleset.id}`].slice(0, 3),
    })
    setMsg(`Guardado. Código: ${ruleset.shareCode}`)
  }

  return (
    <div className="screen">
      <button className="chip" onClick={() => setScreen('setup')}>
        ← Setup
      </button>
      <h1 className="section-title">Custom Game Builder</h1>
      <p className="note">SI ocurre X → +/−N puntos. Comparte un código con tus amigos.</p>

      <div className="field" style={{ marginTop: 16 }}>
        <label>Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <h2 className="section-title">Reglas</h2>
      <div className="stack">
        {rules.map((r, i) => (
          <div className="rule-row" key={i}>
            <select
              value={r.when}
              onChange={(e) => {
                const next = [...rules]
                next[i] = { ...r, when: e.target.value }
                setRules(next)
              }}
            >
              {EVENT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={r.points}
              onChange={(e) => {
                const next = [...rules]
                next[i] = { ...r, points: Number(e.target.value) }
                setRules(next)
              }}
            />
            <button className="chip" onClick={() => setRules(rules.filter((_, j) => j !== i))}>
              ×
            </button>
          </div>
        ))}
        <button
          className="chip"
          onClick={() => setRules([...rules, { when: 'SCORE_PAR', points: 1 }])}
        >
          + Regla
        </button>
      </div>

      <p className="note" style={{ marginTop: 12 }}>
        Simulador: birdie + 1-putt + GIR = <strong>{sim > 0 ? `+${sim}` : sim}</strong> pts
      </p>
      {errors.length ? <p className="warn">{errors.join(' · ')}</p> : null}
      {msg ? <p className="note">{msg}</p> : null}

      <div className="stack" style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={save}>
          Guardar y usar
        </button>
      </div>

      <h2 className="section-title">Unirse con código</h2>
      <div className="field">
        <label>Código</label>
        <input value={codeIn} placeholder="CHAOS-7K2" onChange={(e) => setCodeIn(e.target.value)} />
      </div>
      <button
        className="btn btn-ghost"
        style={{ marginTop: 10 }}
        onClick={() => {
          const found = importCustomByCode(codeIn)
          if (!found) {
            // Also accept built-in Sunday Chaos
            setMsg('Código no encontrado en este dispositivo. Prueba CHAOS-7K2.')
            return
          }
          updateSetup({
            socialGames: [...(draft.socialGames || []).filter((g) => !g.startsWith('custom:')), `custom:${found.id}`].slice(0, 3),
          })
          setMsg(`Añadido: ${found.name}`)
        }}
      >
        Importar
      </button>

      <h2 className="section-title">Biblioteca local</h2>
      <div className="list">
        {customs.map((c) => (
          <div className="row" key={c.id}>
            <div>
              <strong>{c.name}</strong>
              <div className="meta">{c.shareCode} · {c.rules.length} reglas</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
