import { useAtomStore, getElectronCount, getNeutrons } from '../store/atomStore'
import { ionLabel, shellDistribution, getValenceElectrons } from '../data/electronConfig'
import './ElementSheet.css'

function formatEnergy(kjmol: number): string {
  if (kjmol >= 1000) {
    return `${(kjmol / 1000).toFixed(2).replace(/\.?0+$/, '')} MJ/mol`
  }
  return `${Math.round(kjmol)} kJ/mol`
}

export default function ElementSheet() {
  const { currentDetail, charge, isotopeShift } = useAtomStore()
  if (!currentDetail) return null

  const cat = currentDetail.category
  const electrons = getElectronCount(currentDetail, charge)
  const neutrons = getNeutrons(currentDetail, isotopeShift)
  const massNumber = currentDetail.Z + neutrons
  const valence = getValenceElectrons(shellDistribution(electrons))
  const label = ionLabel(currentDetail.symbol, charge)

  const validCharges = currentDetail.validCharges.length > 0
    ? [...currentDetail.validCharges].sort((a, b) => a - b)
    : [0]
  const ies = currentDetail.ionizationEnergies
  const ea = currentDetail.electronAffinity

  // Pour un état de charge q, retourne l'énergie cumulée :
  //   q > 0 : Σ IE_1..IE_q (énergie pour arracher q électrons)
  //   q < 0 : -|q| × |EA| (gain net si EA disponible, sinon null)
  //   q = 0 : null (neutre, pas d'énergie associée)
  function cumulativeEnergy(q: number): number | null {
    if (q === 0) return null
    if (q > 0) {
      if (ies.length < q) return null
      return ies.slice(0, q).reduce((s, x) => s + x, 0)
    }
    if (ea != null) return -Math.abs(q) * ea
    return null
  }

  function chargeLabel(q: number): string {
    if (q === 0) return currentDetail!.symbol
    return ionLabel(currentDetail!.symbol, q)
  }

  // Bouton actif si la charge sélectionnée existe dans validCharges
  const isCurrentValid = validCharges.includes(charge)

  // Custom setter qui passe par le store (selectElement reset charge à 0,
  // on doit utiliser une voie directe via store)
  const store = useAtomStore.getState
  const setCharge = (q: number) => {
    useAtomStore.setState({ charge: q })
  }

  return (
    <section className="sheet">
      <div className="banner" style={{ ['--col' as any]: cat.color }}>
        <div className="left">
          <div className="z">Z = {currentDetail.Z}</div>
          <div className="sym">{label}</div>
          <div className="name">{currentDetail.nameFR}</div>
          <div className="cat" style={{ color: cat.color }}>{cat.label}</div>
        </div>
        <div className="middle">
          <div className="stat">
            <span className="stat-label">Masse atomique</span>
            <span className="stat-val">{currentDetail.mass} u</span>
          </div>
          <div className="stat">
            <span className="stat-label">Nombre de masse</span>
            <span className="stat-val">A = {massNumber}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Période · Groupe · Bloc</span>
            <span className="stat-val">{currentDetail.period} · {currentDetail.group ?? '-'} · {currentDetail.block}</span>
          </div>
          {currentDetail.year !== null && (
            <div className="stat">
              <span className="stat-label">Découverte</span>
              <span className="stat-val">{currentDetail.year === 0 ? 'antiquité' : currentDetail.year}</span>
            </div>
          )}
        </div>
        <div className="right">
          <div className="particle-row">
            <div className="particle"><span className="dot proton" /><span className="count">{currentDetail.Z}</span><span className="kind">protons</span></div>
            <div className="particle"><span className="dot neutron" /><span className="count">{neutrons}</span><span className="kind">neutrons</span></div>
            <div className="particle"><span className="dot electron" /><span className="count">{electrons}</span><span className="kind">électrons</span></div>
          </div>

          <div className="charge-block">
            <div className="charge-label">État ionique (états observés)</div>
            <div className="charge-list">
              {validCharges.map(q => {
                const energy = cumulativeEnergy(q)
                return (
                  <button
                    key={q}
                    className={`charge-btn ${charge === q ? 'active' : ''} ${q > 0 ? 'cation' : q < 0 ? 'anion' : 'neutral'}`}
                    onClick={() => setCharge(q)}
                  >
                    <span className="ion-sym">{chargeLabel(q)}</span>
                    <span className="ion-energy">
                      {q === 0
                        ? 'neutre'
                        : energy != null
                          ? (q > 0
                              ? `↑ ${formatEnergy(energy)}`
                              : `↓ ${formatEnergy(Math.abs(energy))}`)
                          : '- énergie n.d.'}
                    </span>
                  </button>
                )
              })}
            </div>
            {!isCurrentValid && (
              <div className="charge-warning">
                Charge {charge > 0 ? '+' : ''}{charge} non observée naturellement pour cet élément.
              </div>
            )}
          </div>

          <div className="valence">
            <span>électrons de valence</span>
            <strong>{valence}</strong>
          </div>
        </div>
      </div>
    </section>
  )
}
