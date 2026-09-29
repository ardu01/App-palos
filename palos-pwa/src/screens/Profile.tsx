import { useApp } from '../store/appStore'

export function Profile() {
  const name = useApp((s) => s.profileName)
  const setProfileName = useApp((s) => s.setProfileName)
  const history = useApp((s) => s.history)

  return (
    <div className="screen">
      <h1 className="section-title" style={{ marginTop: 0 }}>
        Perfil
      </h1>
      <div className="field">
        <label>Nombre</label>
        <input value={name} onChange={(e) => setProfileName(e.target.value)} />
      </div>
      <p className="note" style={{ marginTop: 12 }}>
        Handicap Index: opcional (no se calcula WHS en este prototipo).
      </p>
      <h2 className="section-title">Identidad deportiva</h2>
      <div className="row">
        <span>Vueltas en PALOS</span>
        <strong>{history.length}</strong>
      </div>
      <p className="note" style={{ marginTop: 16 }}>
        Los achievements de la app no son logros oficiales de golf.
      </p>
    </div>
  )
}
