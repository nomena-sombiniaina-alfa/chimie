import { useEffect, useMemo } from 'react'
import { useBondsStore } from '../store/bondsStore'
import IonicDiagram from '../views/bonds/IonicDiagram'
import CovalentDiagram from '../views/bonds/CovalentDiagram'
import MetallicDiagram from '../views/bonds/MetallicDiagram'
import HydrogenDiagram from '../views/bonds/HydrogenDiagram'
import VanDerWaalsDiagram from '../views/bonds/VanDerWaalsDiagram'
import LewisDiagram from '../views/bonds/LewisDiagram'
import VseprDiagram from '../views/bonds/VseprDiagram'
import MoDiagram from '../views/bonds/MoDiagram'
import './BondsHub.css'

const CATEGORIES = [
  { id: 'intra',  label: 'Liaisons intramoléculaires', hint: 'À l\'intérieur d\'une molécule, entre atomes liés' },
  { id: 'inter',  label: 'Liaisons intermoléculaires', hint: 'Entre molécules voisines' },
  { id: 'theory', label: 'Théories explicatives',       hint: 'Cadres pour interpréter les liaisons' },
]

const DIAGRAMS: Record<string, React.FC> = {
  'ionic':              IonicDiagram,
  'covalent':           CovalentDiagram,
  'metallic':           MetallicDiagram,
  'hydrogen':           HydrogenDiagram,
  'van-der-waals':      VanDerWaalsDiagram,
  'lewis-theory':       LewisDiagram,
  'vsepr':              VseprDiagram,
  'molecular-orbital':  MoDiagram,
}

export default function BondsHub() {
  const {
    bonds, currentDetail, selectedSlug, loaded, error,
    loadAll, selectBond,
  } = useBondsStore()

  useEffect(() => { if (!loaded) loadAll() }, [loaded, loadAll])

  const groupedBonds = useMemo(() => {
    return CATEGORIES.map(c => ({
      ...c,
      bonds: bonds.filter(b => b.category === c.id),
    })).filter(c => c.bonds.length > 0)
  }, [bonds])

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <div className="loading">Chargement des liaisons…</div>

  const Diagram = currentDetail ? DIAGRAMS[currentDetail.slug] : null

  return (
    <div className="bonds">
      <aside className="bonds-sidebar">
        {groupedBonds.map(g => (
          <div key={g.id} className="bonds-group">
            <div className="bg-head">
              <span className="bg-label">{g.label}</span>
              <span className="bg-hint">{g.hint}</span>
            </div>
            {g.bonds.map(b => (
              <button
                key={b.slug}
                className={`bond-btn ${selectedSlug === b.slug ? 'active' : ''}`}
                onClick={() => selectBond(b.slug)}
              >
                <span className="bb-ico">{b.icon}</span>
                <span className="bb-name">{b.name}</span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {currentDetail && (
        <main className="bonds-detail">
          <header className="bd-head">
            <span className="bd-ico">{currentDetail.icon}</span>
            <div>
              <h1>{currentDetail.name}</h1>
              {(currentDetail.year || currentDetail.discoveredBy) && (
                <p className="bd-attribution">
                  {currentDetail.year && <span>{currentDetail.year}</span>}
                  {currentDetail.year && currentDetail.discoveredBy && <span> · </span>}
                  {currentDetail.discoveredBy && <span>{currentDetail.discoveredBy}</span>}
                </p>
              )}
            </div>
            {currentDetail.energyRange && (
              <span className="bd-energy">{currentDetail.energyRange}</span>
            )}
          </header>

          {Diagram && (
            <section className="bd-diagram">
              <Diagram />
            </section>
          )}

          <section className="bd-card">
            <h3>📐 Définition</h3>
            <p>{currentDetail.definition}</p>
          </section>

          <section className="bd-card">
            <h3>🔍 Principe</h3>
            <p>{currentDetail.principle}</p>
          </section>

          {currentDetail.examples.length > 0 && (
            <section className="bd-card">
              <h3>🧪 Exemples</h3>
              <div className="bd-examples">
                {currentDetail.examples.map((ex, i) => (
                  <div key={i} className="ex">
                    <div className="ex-formula">{ex.formula}</div>
                    <div className="ex-name">{ex.name}</div>
                    {ex.notes && <div className="ex-notes">{ex.notes}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentDetail.keyConcepts.length > 0 && (
            <section className="bd-card">
              <h3>🎯 Concepts clés</h3>
              <ul>{currentDetail.keyConcepts.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </section>
          )}

          {currentDetail.pitfalls.length > 0 && (
            <section className="bd-card pitfalls">
              <h3>⚠️ Pièges fréquents</h3>
              <ul>{currentDetail.pitfalls.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </section>
          )}
        </main>
      )}
    </div>
  )
}
