import { useAtomStore, getElectronCount, getNeutrons } from '../store/atomStore'
import { ionLabel } from '../data/electronConfig'
import { shellDistribution, getValenceElectrons } from '../data/electronConfig'
import './ElementSheet.css'

export default function ElementSheet() {
  const { currentDetail, charge, isotopeShift, addElectron, removeElectron, neutralize } = useAtomStore()
  if (!currentDetail) return null

  const cat = currentDetail.category
  const electrons = getElectronCount(currentDetail, charge)
  const neutrons = getNeutrons(currentDetail, isotopeShift)
  const massNumber = currentDetail.Z + neutrons
  const valence = getValenceElectrons(shellDistribution(electrons))
  const label = ionLabel(currentDetail.symbol, charge)

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
          <div className="charge-row">
            <button className="btn" onClick={removeElectron} disabled={electrons === 0} title="Retirer un électron">− e⁻</button>
            <div className={`charge-display ${charge > 0 ? 'pos' : charge < 0 ? 'neg' : ''}`}>
              {charge > 0 ? '+' : ''}{charge}
            </div>
            <button className="btn" onClick={addElectron} title="Ajouter un électron">+ e⁻</button>
            <button className="btn small" onClick={neutralize} disabled={charge === 0}>↺ neutre</button>
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
