import { useEffect, useMemo } from 'react'
import { useReactionsStore } from '../store/reactionsStore'
import CorrosionDiagram from '../views/reactions/CorrosionDiagram'
import CombustionDiagram from '../views/reactions/CombustionDiagram'
import BatteryDiagram from '../views/reactions/BatteryDiagram'
import RespirationDiagram from '../views/reactions/RespirationDiagram'
import AcidDiagram from '../views/reactions/AcidDiagram'
import BaseDiagram from '../views/reactions/BaseDiagram'
import AcidBaseDiagram from '../views/reactions/AcidBaseDiagram'
import SubstitutionDiagram from '../views/reactions/SubstitutionDiagram'
import AdditionDiagram from '../views/reactions/AdditionDiagram'
import EliminationDiagram from '../views/reactions/EliminationDiagram'
import PrecipitationDiagram from '../views/reactions/PrecipitationDiagram'
import DissolutionDiagram from '../views/reactions/DissolutionDiagram'
import IonicEquilibriumDiagram from '../views/reactions/IonicEquilibriumDiagram'
import './ReactionsHub.css'

const CATEGORIES = [
  { id: 'redox',     label: "A. Transfert d'électrons (REDOX)",     hint: 'corrosion · combustion · batteries · respiration' },
  { id: 'acid-base', label: "B. Transfert de protons (acide-base)", hint: 'acides · bases · neutralisation' },
  { id: 'structure', label: "C. Réarrangement de liaisons",          hint: 'substitution · addition · élimination' },
  { id: 'solids',    label: "D. Formation / rupture de solides",     hint: 'précipitation · dissolution · équilibre ionique' },
]

const DIAGRAMS: Record<string, React.FC> = {
  // A. REDOX
  'corrosion':         CorrosionDiagram,
  'combustion':        CombustionDiagram,
  'batteries':         BatteryDiagram,
  'respiration':       RespirationDiagram,
  // B. ACIDE-BASE
  'acids':             AcidDiagram,
  'bases':             BaseDiagram,
  'neutralization':    AcidBaseDiagram,
  // C. STRUCTURE
  'substitution':      SubstitutionDiagram,
  'addition':          AdditionDiagram,
  'elimination':       EliminationDiagram,
  // D. SOLIDES
  'precipitation':     PrecipitationDiagram,
  'dissolution':       DissolutionDiagram,
  'ionic-equilibrium': IonicEquilibriumDiagram,
}

const ENERGETICS_LABEL: Record<string, { label: string; color: string }> = {
  'exothermic':  { label: 'Exothermique',  color: '#ff7766' },
  'endothermic': { label: 'Endothermique', color: '#9be0ff' },
  'athermic':    { label: 'Athermique',    color: '#caff1a' },
}

export default function ReactionsHub() {
  const {
    reactions, currentDetail, selectedSlug, loaded, error,
    loadAll, selectReaction,
  } = useReactionsStore()

  useEffect(() => { if (!loaded) loadAll() }, [loaded, loadAll])

  const grouped = useMemo(() => {
    return CATEGORIES.map(c => ({
      ...c,
      list: reactions.filter(r => r.category === c.id),
    })).filter(c => c.list.length > 0)
  }, [reactions])

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <div className="loading">Chargement des réactions…</div>

  const Diagram = currentDetail ? DIAGRAMS[currentDetail.slug] : null

  return (
    <div className="reactions">
      <aside className="rx-sidebar">
        {grouped.map(g => (
          <div key={g.id} className="rx-group">
            <div className="rg-head">
              <span className="rg-label">{g.label}</span>
              <span className="rg-hint">{g.hint}</span>
            </div>
            {g.list.map(r => (
              <button
                key={r.slug}
                className={`rx-btn ${selectedSlug === r.slug ? 'active' : ''}`}
                onClick={() => selectReaction(r.slug)}
              >
                <span className="rb-ico">{r.icon}</span>
                <span className="rb-text">
                  <span className="rb-name">{r.name}</span>
                  <span className="rb-eq">{r.equation}</span>
                </span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {currentDetail && (
        <main className="rx-detail">
          <header className="rd-head">
            <span className="rd-ico">{currentDetail.icon}</span>
            <div className="rd-titles">
              <h1>{currentDetail.name}</h1>
              <p className="rd-equation">{currentDetail.equation}</p>
            </div>
            {currentDetail.energetics && ENERGETICS_LABEL[currentDetail.energetics] && (
              <span className="rd-energetics" style={{
                color: ENERGETICS_LABEL[currentDetail.energetics].color,
                borderColor: ENERGETICS_LABEL[currentDetail.energetics].color + '55',
              }}>
                {ENERGETICS_LABEL[currentDetail.energetics].label}
              </span>
            )}
          </header>

          {Diagram && (
            <section className="rd-diagram">
              <Diagram />
            </section>
          )}

          <section className="rd-card">
            <h3>📐 Définition</h3>
            <p>{currentDetail.definition}</p>
          </section>

          <section className="rd-card">
            <h3>🔍 Principe</h3>
            <p>{currentDetail.principle}</p>
          </section>

          {currentDetail.mechanism.length > 0 && (
            <section className="rd-card">
              <h3>🧩 Mécanisme</h3>
              <ol className="mechanism">
                {currentDetail.mechanism.map(m => (
                  <li key={m.step}>
                    <span className="mech-step">{m.step}</span>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {currentDetail.examples.length > 0 && (
            <section className="rd-card">
              <h3>🧪 Exemples</h3>
              <div className="rd-examples">
                {currentDetail.examples.map((ex, i) => (
                  <div key={i} className="ex">
                    <div className="ex-name">{ex.name}</div>
                    <div className="ex-equation">{ex.equation}</div>
                    {ex.notes && <div className="ex-notes">{ex.notes}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {currentDetail.keyConcepts.length > 0 && (
            <section className="rd-card">
              <h3>🎯 Concepts clés</h3>
              <ul>{currentDetail.keyConcepts.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </section>
          )}

          {currentDetail.pitfalls.length > 0 && (
            <section className="rd-card pitfalls">
              <h3>⚠️ Pièges fréquents</h3>
              <ul>{currentDetail.pitfalls.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </section>
          )}
        </main>
      )}
    </div>
  )
}
