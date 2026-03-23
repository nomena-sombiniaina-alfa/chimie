import { useMemo } from 'react'
import { useAtomStore } from '../store/atomStore'

export default function PropertiesView() {
  const { currentDetail, elements } = useAtomStore()
  const el = currentDetail

  const ranges = useMemo(() => {
    const compute = (key: keyof typeof elements[0]) => {
      const values = elements.map(e => (e as any)[key]).filter(v => v != null) as number[]
      return { min: Math.min(...values), max: Math.max(...values) }
    }
    return {
      // Approximation : on prend les ranges sur la liste flat - pour properties détaillées qui ne sont pas dans la liste, on fallback à 0..max
    }
  }, [elements])

  if (!el) return null

  function pct(value: number | null, min: number, max: number): number | null {
    if (value == null) return null
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
  }

  const props = [
    {
      key: 'electronegativity',
      label: 'Électronégativité (Pauling)',
      value: el.electronegativity,
      unit: '',
      trend: 'augmente vers le haut-droit du tableau',
      min: 0.7, max: 3.98,
    },
    {
      key: 'atomicRadius',
      label: 'Rayon atomique',
      value: el.atomicRadius,
      unit: 'pm',
      trend: 'augmente vers le bas-gauche',
      min: 31, max: 348,
    },
    {
      key: 'ionizationEnergy',
      label: "1ʳᵉ énergie d'ionisation",
      value: el.ionizationEnergy,
      unit: 'kJ/mol',
      trend: 'augmente vers le haut-droit',
      min: 376, max: 2372,
    },
    {
      key: 'density',
      label: 'Densité',
      value: el.density,
      unit: 'g/cm³',
      trend: 'maximale pour les métaux de transition',
      min: 0, max: 22.59,
    },
  ]

  let reactivity = { level: 1, label: 'Faible', color: '#a4a8b3' }
  const c = el.category.code
  if (c === 'noble-gas') reactivity = { level: 0, label: 'Quasi-inerte', color: '#33c2ff' }
  else if (c === 'alkali') reactivity = { level: 5, label: 'Très réactif', color: '#ff3838' }
  else if (c === 'halogen') reactivity = { level: 4, label: 'Très réactif', color: '#caff1a' }
  else if (c === 'alkaline-earth') reactivity = { level: 3, label: 'Réactif', color: '#ff8a1a' }
  else if (c === 'actinide') reactivity = { level: 4, label: 'Très radioactif', color: '#ff4dd1' }
  else if (c === 'lanthanide') reactivity = { level: 2, label: 'Modérément réactif', color: '#b366ff' }
  else if (c === 'transition') reactivity = { level: 2, label: 'Modérément réactif', color: '#ffd11a' }
  else if (c === 'metalloid') reactivity = { level: 2, label: 'Variable', color: '#00ffb3' }
  else if (c === 'nonmetal') reactivity = { level: 3, label: 'Réactif', color: '#4dff66' }

  return (
    <div className="view scrollable">
      <div className="props-grid">
        {props.map(p => {
          const p_ = pct(p.value, p.min, p.max)
          return (
            <div className="prop" key={p.key}>
              <div className="prop-head">
                <span className="prop-label">{p.label}</span>
                {p.value != null ? (
                  <span className="prop-value">
                    {p.value} <small>{p.unit}</small>
                  </span>
                ) : (
                  <span className="prop-na">non défini</span>
                )}
              </div>
              <div className="bar">
                <div className="bar-track">
                  {p_ != null && <>
                    <div className="bar-fill" style={{ width: p_ + '%' }} />
                    <div className="bar-marker" style={{ left: p_ + '%' }} />
                  </>}
                </div>
                <div className="bar-scale">
                  <span>{p.min}</span>
                  <span>{p.max}</span>
                </div>
              </div>
              <div className="trend">↗ {p.trend}</div>
            </div>
          )
        })}

        <div className="prop">
          <div className="prop-head">
            <span className="prop-label">Réactivité chimique</span>
            <span className="prop-value" style={{ color: reactivity.color }}>{reactivity.label}</span>
          </div>
          <div className="reactivity-dots">
            {[1,2,3,4,5].map(i => (
              <span key={i} className="r-dot"
                style={i <= reactivity.level
                  ? { background: reactivity.color, boxShadow: `0 0 8px ${reactivity.color}80` }
                  : {}} />
            ))}
          </div>
          <div className="trend">Déduite de la catégorie et de la position dans le tableau</div>
        </div>
      </div>

      <div className="props-caption">
        <strong>Quelles sont les tendances dans le tableau ?</strong>
        Les propriétés varient de façon régulière en fonction de la position dans le tableau périodique :
        l'électronégativité et l'énergie d'ionisation augmentent vers le fluor ; le rayon atomique diminue
        dans le même sens. C'est la base de la classification de Mendeleïev (1869).
      </div>

      <style>{`
        .props-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 10px;
        }
        .prop {
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px 14px;
        }
        .prop-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 8px;
        }
        .prop-label { color: var(--text-dim); font-size: 12px; }
        .prop-value { font-family: ui-monospace, monospace; font-size: 16px; font-weight: 700; color: var(--accent); }
        .prop-value small { font-size: 11px; opacity: 0.7; }
        .prop-na { color: var(--text-dim); font-style: italic; font-size: 12px; }
        .bar { margin: 6px 0 4px; }
        .bar-track {
          position: relative;
          height: 6px;
          background: var(--bg-2);
          border-radius: 3px;
          overflow: visible;
        }
        .bar-fill {
          position: absolute;
          inset: 0 auto 0 0;
          background: linear-gradient(90deg, #3aa0ff, #ff5577);
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        .bar-marker {
          position: absolute;
          top: -3px;
          width: 12px;
          height: 12px;
          margin-left: -6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 10px rgba(0,212,255,0.6);
          transition: left 0.4s ease;
        }
        .bar-scale {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--text-dim);
          margin-top: 4px;
        }
        .trend { color: var(--text-dim); font-size: 11px; font-style: italic; margin-top: 4px; }
        .reactivity-dots { display: flex; gap: 6px; margin: 8px 0 4px; }
        .r-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: var(--bg-2);
          border: 1px solid var(--border);
        }
        .props-caption {
          margin-top: 12px;
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: var(--text-dim);
          line-height: 1.5;
        }
        .props-caption strong { color: var(--text); display: block; margin-bottom: 3px; }
      `}</style>
    </div>
  )
}
