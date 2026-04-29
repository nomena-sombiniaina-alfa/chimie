import { useEffect, useMemo, useState } from 'react'
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
import Loader from './Loader'
import './ReactionsHub.css'

const CATEGORIES = [
  { id: 'redox',     label: "A. Transfert d'électrons (REDOX)",     hint: 'corrosion · combustion · batteries · respiration' },
  { id: 'acid-base', label: "B. Transfert de protons (acide-base)", hint: 'acides · bases · neutralisation' },
  { id: 'structure', label: "C. Réarrangement de liaisons",          hint: 'substitution · addition · élimination' },
  { id: 'solids',    label: "D. Formation / rupture de solides",     hint: 'précipitation · dissolution · équilibre ionique' },
]

type AcidBaseMode = 'strong' | 'weak'

const ACID_BASE_SLUGS = new Set(['acids', 'bases', 'neutralization'])

type AcidBaseProps = { mode: AcidBaseMode }
const ACID_BASE_DIAGRAMS: Record<string, React.FC<AcidBaseProps>> = {
  'acids':          AcidDiagram,
  'bases':          BaseDiagram,
  'neutralization': AcidBaseDiagram,
}
const PLAIN_DIAGRAMS: Record<string, React.FC> = {
  'corrosion':         CorrosionDiagram,
  'combustion':        CombustionDiagram,
  'batteries':         BatteryDiagram,
  'respiration':       RespirationDiagram,
  'substitution':      SubstitutionDiagram,
  'addition':          AdditionDiagram,
  'elimination':       EliminationDiagram,
  'precipitation':     PrecipitationDiagram,
  'dissolution':       DissolutionDiagram,
  'ionic-equilibrium': IonicEquilibriumDiagram,
}

const ENERGETICS_LABEL: Record<string, { label: string; color: string }> = {
  'exothermic':  { label: 'Exothermique',  color: '#ff7766' },
  'endothermic': { label: 'Endothermique', color: '#9be0ff' },
  'athermic':    { label: 'Athermique',    color: '#caff1a' },
}

// Mini-théorie fort vs faible, adaptée au type sélectionné (acide, base, neutralisation)
const THEORY_TABS: Record<string, { slug: string; strongLabel: string; weakLabel: string; strong: string; weak: string }> = {
  acids: {
    slug: 'acids',
    strongLabel: 'Acide fort',
    weakLabel: 'Acide faible',
    strong:
      "Un acide fort (HCl, HNO₃, H₂SO₄) se dissocie totalement dans l'eau : chaque molécule cède son H⁺. " +
      "À l'équilibre, il ne reste aucune molécule intacte. Ka ≫ 1, l'équation s'écrit avec une flèche simple (->).",
    weak:
      "Un acide faible (CH₃COOH, HF, NH₄⁺) se dissocie partiellement : seules quelques molécules cèdent leur H⁺, " +
      "les autres restent intactes en solution. Équilibre dynamique noté ⇌. Ka ≈ 10⁻⁵ pour l'acide acétique - " +
      "à 0,1 mol/L, ~1 % seulement est ionisé.",
  },
  bases: {
    slug: 'bases',
    strongLabel: 'Base forte',
    weakLabel: 'Base faible',
    strong:
      "Une base forte (NaOH, KOH, Ca(OH)₂) libère totalement ses OH⁻ en solution. " +
      "Le solide se dissout complètement, la concentration en OH⁻ est élevée. pH > 13 à 1 mol/L.",
    weak:
      "Une base faible (NH₃, amines) accepte un H⁺ de l'eau, mais l'équilibre est très en faveur de la forme neutre. " +
      "Seules quelques molécules sont protonées : NH₃ + H₂O ⇌ NH₄⁺ + OH⁻. Kb ≈ 1,8·10⁻⁵, ~1 % d'ionisation à 0,1 mol/L.",
  },
  neutralization: {
    slug: 'neutralization',
    strongLabel: 'Fort + fort',
    weakLabel: 'Faible + fort',
    strong:
      "Acide fort + base forte : tous les H⁺ rencontrent tous les OH⁻, formation totale de H₂O. " +
      "Le sel résultant (NaCl) est neutre, pH = 7 à l'équivalence. ΔH ≈ -57 kJ/mol.",
    weak:
      "Acide faible + base forte (ex. CH₃COOH + NaOH) : la base forte consomme tout l'acide, mais la base conjuguée A⁻ " +
      "reste en solution et ré-arrache des H⁺ à l'eau. Résultat : pH > 7 à l'équivalence (sel basique, ~ 8-9).",
  },
}

export default function ReactionsHub() {
  const {
    reactions, currentDetail, selectedSlug, loaded, error,
    loadAll, selectReaction,
  } = useReactionsStore()

  const [acidBaseMode, setAcidBaseMode] = useState<AcidBaseMode>('strong')

  useEffect(() => { if (!loaded) loadAll() }, [loaded, loadAll])

  const grouped = useMemo(() => {
    return CATEGORIES.map(c => ({
      ...c,
      list: reactions.filter(r => r.category === c.id),
    })).filter(c => c.list.length > 0)
  }, [reactions])

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <Loader label="Chargement des réactions…" />

  const isAcidBase = currentDetail ? ACID_BASE_SLUGS.has(currentDetail.slug) : false
  const PlainDiagram = currentDetail ? PLAIN_DIAGRAMS[currentDetail.slug] : null
  const AcidBaseDiagramFC = currentDetail ? ACID_BASE_DIAGRAMS[currentDetail.slug] : null
  const theory = currentDetail && isAcidBase ? THEORY_TABS[currentDetail.slug] : null

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

          {isAcidBase && theory && (
            <section className="rd-variant">
              <span className="rv-label">Variante de la réaction</span>
              <div className="rv-tabs">
                <button
                  type="button"
                  className={`rv-tab ${acidBaseMode === 'strong' ? 'active' : ''}`}
                  onClick={() => setAcidBaseMode('strong')}
                >
                  {theory.strongLabel}
                </button>
                <button
                  type="button"
                  className={`rv-tab ${acidBaseMode === 'weak' ? 'active' : ''}`}
                  onClick={() => setAcidBaseMode('weak')}
                >
                  {theory.weakLabel}
                </button>
              </div>
            </section>
          )}

          {isAcidBase && AcidBaseDiagramFC ? (
            <section className="rd-diagram">
              <AcidBaseDiagramFC key={acidBaseMode} mode={acidBaseMode} />
            </section>
          ) : PlainDiagram ? (
            <section className="rd-diagram">
              <PlainDiagram />
            </section>
          ) : null}

          {isAcidBase && theory && (
            <section className="rd-card rd-theory">
              <h3>📖 Mini-théorie : {acidBaseMode === 'strong' ? theory.strongLabel : theory.weakLabel}</h3>
              <p>{acidBaseMode === 'strong' ? theory.strong : theory.weak}</p>
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
