import { useAtomStore, getNeutrons } from '../store/atomStore'

interface IsotopeInfo {
  A: number
  name: string
  abundance: number
  stable: boolean
  halfLife: string | null
}

const ISOTOPES_DB: Record<number, IsotopeInfo[]> = {
  1: [
    { A: 1, name: 'Protium', abundance: 99.985, stable: true, halfLife: null },
    { A: 2, name: 'Deutérium', abundance: 0.015, stable: true, halfLife: null },
    { A: 3, name: 'Tritium', abundance: 0, stable: false, halfLife: '12,3 ans' },
  ],
  6: [
    { A: 12, name: 'Carbone-12', abundance: 98.93, stable: true, halfLife: null },
    { A: 13, name: 'Carbone-13', abundance: 1.07, stable: true, halfLife: null },
    { A: 14, name: 'Carbone-14', abundance: 0, stable: false, halfLife: '5 730 ans' },
  ],
  8: [
    { A: 16, name: 'Oxygène-16', abundance: 99.76, stable: true, halfLife: null },
    { A: 17, name: 'Oxygène-17', abundance: 0.04, stable: true, halfLife: null },
    { A: 18, name: 'Oxygène-18', abundance: 0.20, stable: true, halfLife: null },
  ],
  17: [
    { A: 35, name: 'Chlore-35', abundance: 75.78, stable: true, halfLife: null },
    { A: 37, name: 'Chlore-37', abundance: 24.22, stable: true, halfLife: null },
  ],
  26: [
    { A: 54, name: 'Fer-54', abundance: 5.85, stable: true, halfLife: null },
    { A: 56, name: 'Fer-56', abundance: 91.75, stable: true, halfLife: null },
    { A: 57, name: 'Fer-57', abundance: 2.12, stable: true, halfLife: null },
    { A: 58, name: 'Fer-58', abundance: 0.28, stable: true, halfLife: null },
  ],
  92: [
    { A: 235, name: 'Uranium-235', abundance: 0.72, stable: false, halfLife: "703 millions d'années" },
    { A: 238, name: 'Uranium-238', abundance: 99.27, stable: false, halfLife: '4,47 milliards d\'années' },
  ],
}

export default function IsotopesView() {
  const { currentDetail, isotopeShift, setIsotopeShift } = useAtomStore()
  const el = currentDetail
  if (!el) return null

  const isotopes = ISOTOPES_DB[el.Z] || []
  const standardN = Math.round(el.mass - el.Z)
  const currentN = getNeutrons(el, isotopeShift)
  const massNumber = el.Z + currentN

  const selectIsotope = (A: number) => setIsotopeShift(A - el.Z - standardN)
  const reset = () => setIsotopeShift(0)

  return (
    <div className="view scrollable">
      <div className="iso-card">
        <h4>Isotopes de {el.nameFR}</h4>

        <div className="iso-banner">
          <span className="iso-A">A = {massNumber}</span>
          <span>·</span>
          <span>{el.symbol}-{massNumber}</span>
          <span>·</span>
          <span>{el.Z} p⁺ + {currentN} n⁰</span>
          <button className="iso-btn" onClick={reset} disabled={isotopeShift === 0}>↺ standard</button>
        </div>

        <div className="iso-controls">
          <label>Modifier le nombre de neutrons</label>
          <input
            type="range" min="-5" max="10" step="1"
            value={isotopeShift}
            onChange={e => setIsotopeShift(parseInt(e.target.value, 10))}
          />
          <div className={`shift-display ${isotopeShift > 0 ? 'pos' : isotopeShift < 0 ? 'neg' : ''}`}>
            {isotopeShift > 0 ? '+' : ''}{isotopeShift} neutron(s)
          </div>
        </div>

        {isotopes.length > 0 ? (
          <>
            <h5>Isotopes naturels</h5>
            <div className="iso-list">
              {isotopes.map(iso => (
                <button
                  key={iso.A}
                  className={`iso-item ${massNumber === iso.A ? 'active' : ''} ${!iso.stable ? 'unstable' : ''}`}
                  onClick={() => selectIsotope(iso.A)}
                >
                  <div className="iso-name">{iso.name}</div>
                  <div className="iso-A2">A = {iso.A}</div>
                  <div className="iso-meta">
                    {iso.abundance > 0 && <span>{iso.abundance}% naturel</span>}
                    {!iso.stable
                      ? <span className="radio">☢ T½ = {iso.halfLife}</span>
                      : <span className="stable">stable</span>}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="no-data">
            Pas de base d'isotopes courants pour cet élément dans cette version.
            Utilisez le curseur pour explorer des compositions hypothétiques.
          </div>
        )}

        <div className="iso-caption">
          <strong>Combien de variantes nucléaires ?</strong>
          Un isotope est une variante d'un élément avec un nombre différent de neutrons.
          Les protons définissent l'élément ; les neutrons influent sur la masse et la stabilité.
        </div>
      </div>

      <style>{`
        .iso-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .iso-card h4 { margin: 0 0 12px; font-size: 16px; }
        .iso-card h5 { margin: 16px 0 8px; font-size: 13px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
        .iso-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; background: var(--bg-2);
          border-radius: 8px; margin-bottom: 12px;
        }
        .iso-A { font-family: ui-monospace, monospace; font-size: 18px; font-weight: 700; color: var(--accent); }
        .iso-btn {
          margin-left: auto;
          background: var(--bg-2); border: 1px solid var(--border); color: var(--text);
          padding: 6px 10px; border-radius: 6px; font-size: 12px;
        }
        .iso-btn:hover:not(:disabled) { border-color: var(--accent); }
        .iso-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .iso-controls label { display: block; color: var(--text-dim); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .shift-display { text-align: center; font-family: ui-monospace, monospace; font-size: 13px; margin-top: 4px; color: var(--text-dim); }
        .shift-display.pos { color: #7fffaa; }
        .shift-display.neg { color: #ff9999; }
        .iso-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; }
        .iso-item {
          background: var(--bg-2); border: 1px solid var(--border); border-radius: 8px;
          padding: 10px 12px; text-align: left; transition: all 0.15s ease;
        }
        .iso-item:hover { border-color: var(--accent); }
        .iso-item.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
        .iso-item.unstable { border-color: rgba(255, 200, 80, 0.3); }
        .iso-item.unstable.active { border-color: #ffcc66; box-shadow: 0 0 0 1px #ffcc66; }
        .iso-name { font-size: 13px; font-weight: 600; color: var(--text); }
        .iso-A2 { font-family: ui-monospace, monospace; font-size: 11px; color: var(--text-dim); margin: 2px 0; }
        .iso-meta { font-size: 11px; color: var(--text-dim); display: flex; flex-direction: column; gap: 2px; }
        .iso-meta .stable { color: #7fffaa; }
        .iso-meta .radio { color: #ffcc66; }
        .no-data { padding: 14px; background: var(--bg-2); border-radius: 8px; color: var(--text-dim); font-size: 13px; }
        .iso-caption {
          margin-top: 14px; padding: 10px 14px; background: var(--bg-2); border-radius: 8px;
          font-size: 12px; color: var(--text-dim); line-height: 1.5;
        }
        .iso-caption strong { color: var(--text); display: block; margin-bottom: 3px; }
      `}</style>
    </div>
  )
}
