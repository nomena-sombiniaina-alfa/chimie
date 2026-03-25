import { useAtomStore, getElectronCount } from '../store/atomStore'
import { shellDistribution, getValenceElectrons } from '../data/electronConfig'

const BOND_TYPES: Record<string, { label: string; desc: string }> = {
  ionic:    { label: 'Ionique',    desc: "transfert d'électrons" },
  covalent: { label: 'Covalente',  desc: "partage d'électrons" },
  metallic: { label: 'Métallique', desc: "mer d'électrons" },
}

export default function BondsView() {
  const { currentDetail, charge } = useAtomStore()
  const el = currentDetail
  if (!el) return null

  const electronCount = getElectronCount(el, charge)
  const shells = shellDistribution(electronCount)
  const v = getValenceElectrons(shells)
  const c = el.category.code

  let tendency: { kind: string | null; label: string; ion?: string; desc?: string } = {
    kind: 'covalent', label: 'Variable',
  }

  if (c === 'noble-gas') tendency = { kind: null, label: 'Pas de liaison spontanée', desc: 'Couche externe complète (octet ou duet).' }
  else if (c === 'alkali' || c === 'alkaline-earth') {
    const sign = v === 1 ? '⁺' : v === 2 ? '²⁺' : `${v}⁺`
    tendency = { kind: 'ionic', label: `Donne ${v} électron(s)`, ion: `${el.symbol}${sign}` }
  } else if (c === 'halogen' || (c === 'nonmetal' && v >= 5)) {
    const lost = 8 - v
    const sign = lost === 1 ? '⁻' : `${lost}⁻`
    tendency = { kind: 'ionic', label: `Capte ${lost} électron(s)`, ion: `${el.symbol}${sign}` }
  } else if (c === 'transition' || c === 'lanthanide' || c === 'actinide') {
    tendency = { kind: 'metallic', label: 'Forme des liaisons métalliques', desc: 'Électrons délocalisés.' }
  } else if (c === 'metalloid' || c === 'nonmetal') {
    tendency = { kind: 'covalent', label: `Forme ${Math.min(v, 8 - v)} liaison(s) covalente(s)`, desc: "Partage d'électrons." }
  }

  const partners: string[] = []
  const sym = el.symbol
  if (c === 'alkali' || c === 'alkaline-earth') {
    partners.push(`${sym}Cl${v > 1 ? '₂' : ''}`, `${sym}₂O${v > 1 ? '' : ''}`, `${sym}(OH)${v > 1 ? '₂' : ''}`)
  } else if (c === 'halogen') {
    partners.push(`H${sym}`, `Na${sym}`, `Ca${sym}₂`)
  } else if (sym === 'C') partners.push('CH₄', 'CO₂', 'C₂H₆')
  else if (sym === 'N') partners.push('NH₃', 'N₂', 'HNO₃')
  else if (sym === 'O') partners.push('H₂O', 'CO₂', 'O₂')
  else if (sym === 'H') partners.push('H₂', 'H₂O', 'HCl', 'NH₃')

  return (
    <div className="view scrollable">
      <div className="bonds-card">
        <h4>Comportement de liaison</h4>

        <div className="tendency">
          {tendency.kind && (
            <div className="t-kind">
              <span className={`badge ${tendency.kind}`}>{BOND_TYPES[tendency.kind].label}</span>
              <span className="dim">- {BOND_TYPES[tendency.kind].desc}</span>
            </div>
          )}
          <div className="t-action">{tendency.label}</div>
          {tendency.ion && <div className="t-ion">forme {tendency.ion}</div>}
          {tendency.desc && !tendency.kind && <div className="t-desc">{tendency.desc}</div>}
        </div>

        {partners.length > 0 && (
          <div className="examples">
            <h5>Composés courants</h5>
            <div className="ex-list">
              {partners.map(ex => <span key={ex} className="ex">{ex}</span>)}
            </div>
          </div>
        )}

        <div className="bonds-caption">
          <strong>Comment se lie-t-il ?</strong>
          Les atomes cherchent à compléter leur couche externe (règle de l'octet).
          Selon la différence d'électronégativité, ils forment des liaisons ioniques (transfert),
          covalentes (partage) ou métalliques (délocalisation).
        </div>
      </div>

      <style>{`
        .bonds-card { background: var(--bg-1); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
        .bonds-card h4 { margin: 0 0 14px; font-size: 16px; }
        .bonds-card h5 { margin: 16px 0 8px; font-size: 12px; color: var(--text-dim); text-transform: uppercase; letter-spacing: 1px; }
        .tendency {
          background: var(--bg-2); border: 1px solid var(--border); border-radius: 10px;
          padding: 14px 16px;
        }
        .t-kind { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .badge { font-size: 12px; padding: 4px 10px; border-radius: 12px; font-weight: 600; }
        .badge.ionic    { background: rgba(255,119,119,0.15); color: #ff9999; border: 1px solid rgba(255,119,119,0.35); }
        .badge.covalent { background: rgba(127,255,170,0.12); color: #7fffaa; border: 1px solid rgba(127,255,170,0.3); }
        .badge.metallic { background: rgba(255,204,68,0.13); color: #ffcc44; border: 1px solid rgba(255,204,68,0.35); }
        .dim { color: var(--text-dim); font-size: 12px; }
        .t-action { font-size: 17px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
        .t-ion { font-family: ui-monospace, monospace; font-size: 18px; color: var(--accent); }
        .t-desc { color: var(--text-dim); font-size: 12px; margin-top: 4px; }
        .examples { margin-top: 12px; }
        .ex-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .ex {
          background: var(--bg-2); border: 1px solid var(--border);
          padding: 6px 12px; border-radius: 6px;
          font-family: ui-monospace, monospace; font-size: 14px; color: var(--text);
        }
        .bonds-caption {
          margin-top: 14px; padding: 10px 14px; background: var(--bg-2); border-radius: 8px;
          font-size: 12px; color: var(--text-dim); line-height: 1.5;
        }
        .bonds-caption strong { color: var(--text); display: block; margin-bottom: 3px; }
      `}</style>
    </div>
  )
}
