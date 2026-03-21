import { useMemo } from 'react'
import { useAtomStore, getElectronCount } from '../store/atomStore'
import { getElectronConfig, getShortConfig, ionLabel, toSuper } from '../data/electronConfig'
import type { ConfigEntry, ShortConfig } from '../types'

const SUBSHELL_COLORS: Record<string, string> = {
  s: '#9be0ff', p: '#ffd066', d: '#ff8aa5', f: '#c39bd3',
}
const SUBSHELL_ORBITALS: Record<string, number> = { s: 1, p: 3, d: 5, f: 7 }
const TYPE_ORDER: Record<string, number> = { s: 0, p: 1, d: 2, f: 3 }
const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
const EXCEPTIONS = new Set([24, 29, 41, 42, 44, 45, 46, 47, 57, 58, 64, 78, 79, 89, 90, 91, 92, 93, 96, 103])

export default function ConfigurationView() {
  const { currentDetail, charge } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const label = el ? ionLabel(el.symbol, charge) : ''

  const fullCfg = useMemo(() => getElectronConfig(electronCount), [electronCount])
  const shortCfg = useMemo(() => getShortConfig(electronCount), [electronCount])

  const fullSorted: ConfigEntry[] = useMemo(() => {
    return [...fullCfg].sort((a, b) => {
      const na = +a[0][0]
      const nb = +b[0][0]
      if (na !== nb) return na - nb
      return TYPE_ORDER[a[0][1]] - TYPE_ORDER[b[0][1]]
    })
  }, [fullCfg])

  const byShell = useMemo(() => {
    const groups: Record<number, ConfigEntry[]> = {}
    for (const [sub, count] of fullSorted) {
      const n = +sub[0]
      if (!groups[n]) groups[n] = []
      groups[n].push([sub, count])
    }
    return Object.entries(groups).map(([n, entries]) => ({
      n: +n,
      name: SHELL_NAMES[+n - 1] || `n=${n}`,
      entries,
      total: entries.reduce((s, [, c]) => s + c, 0),
    }))
  }, [fullSorted])

  const isAnomalous = el && EXCEPTIONS.has(el.Z) && electronCount === el.Z

  const isShort = (s: any): s is ShortConfig => s && typeof s === 'object' && 'core' in s

  if (!el) return null

  return (
    <div className="view scrollable">
      <div className="cfg-card">
        <header>
          <h4>Configuration électronique</h4>
          <span className="cfg-label">{label}</span>
        </header>

        <div className="short">
          <span className="short-label">Notation condensée :</span>
          <span className="short-value">
            {isShort(shortCfg) ? (
              <>
                <span className="core">[{shortCfg.core}]</span>
                {shortCfg.tail.map(([s, c], i) => (
                  <span key={i} className="orb" style={{ color: SUBSHELL_COLORS[s[1]] }}>
                    {s}<sup>{c}</sup>
                  </span>
                ))}
              </>
            ) : (
              shortCfg.map(([s, c]: ConfigEntry, i) => (
                <span key={i} className="orb" style={{ color: SUBSHELL_COLORS[s[1]] }}>
                  {s}<sup>{c}</sup>
                </span>
              ))
            )}
          </span>
        </div>

        <div className="full">
          <span className="short-label">Notation complète :</span>
          <span className="short-value">
            {fullSorted.map(([s, c], i) => (
              <span key={i} className="orb" style={{ color: SUBSHELL_COLORS[s[1]] }}>
                {s}<sup>{c}</sup>
              </span>
            ))}
          </span>
        </div>

        {isAnomalous && (
          <div className="anomaly">
            ⚠️ Configuration anormale (exception à la règle de Klechkowski / Aufbau).
            Stabilisation par couche d-/f- demi-pleine ou pleine.
          </div>
        )}

        <div className="shells-title">Répartition par couche</div>
        <div className="shells-grid">
          {byShell.map(g => (
            <div className="shell" key={g.n}>
              <div className="shell-head">
                <span className="shell-name">{g.name}</span>
                <span className="shell-n">n = {g.n}</span>
                <span className="shell-total">{g.total} e⁻</span>
              </div>
              <div className="boxes">
                {g.entries.map(([sub, count], idx) => (
                  <div className="subshell" key={idx}>
                    <div className="sub-name" style={{ color: SUBSHELL_COLORS[sub[1]] }}>{sub}</div>
                    <div className="boxes-row">
                      {Array.from({ length: SUBSHELL_ORBITALS[sub[1]] }).map((_, orb) => (
                        <div className="orb-box" key={orb}>
                          {(orb * 2 + 1) <= count && <span className="arrow up">↑</span>}
                          {(orb * 2 + 2) <= count && <span className="arrow down">↓</span>}
                        </div>
                      ))}
                    </div>
                    <div className="sub-count">{sub}{toSuper(count)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="cfg-caption">
          <strong>Comment sont-ils organisés ?</strong>
          Les sous-couches s, p, d, f se remplissent dans l'ordre des énergies (règle de Klechkowski).
          Chaque sous-couche contient un nombre fixe d'orbitales, chacune pouvant accueillir 2 électrons de spins opposés (Pauli).
        </div>
      </div>

      <style>{`
        .cfg-card {
          background: var(--bg-1);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
        }
        .cfg-card header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .cfg-card h4 { margin: 0; font-size: 16px; }
        .cfg-label {
          font-family: ui-monospace, monospace;
          font-size: 20px;
          color: var(--accent);
          font-weight: 700;
        }
        .short, .full {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          margin-bottom: 10px;
          font-size: 14px;
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 8px;
        }
        .short-label { color: var(--text-dim); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .core { color: var(--text); font-weight: 600; margin-right: 6px; }
        .orb { font-family: ui-monospace, monospace; font-size: 14px; margin-right: 6px; }
        .orb sup { font-size: 11px; }

        .anomaly {
          background: rgba(255, 200, 80, 0.1);
          border: 1px solid rgba(255, 200, 80, 0.3);
          color: #ffcc66;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 12px;
        }
        .shells-title {
          color: var(--text-dim);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 12px 0 8px;
        }
        .shells-grid { display: flex; flex-direction: column; gap: 8px; }
        .shell {
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
        }
        .shell-head {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 8px;
        }
        .shell-name { font-weight: 700; font-size: 15px; color: var(--accent); }
        .shell-n, .shell-total { color: var(--text-dim); font-size: 11px; }
        .shell-total { margin-left: auto; }
        .boxes { display: flex; gap: 14px; flex-wrap: wrap; }
        .subshell {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }
        .sub-name { font-family: ui-monospace, monospace; font-size: 12px; font-weight: 600; }
        .boxes-row { display: flex; gap: 2px; }
        .orb-box {
          width: 18px;
          height: 18px;
          border: 1px solid var(--border);
          border-radius: 3px;
          background: var(--bg-0);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          font-size: 11px;
          line-height: 1;
        }
        .arrow { position: absolute; font-weight: 700; }
        .arrow.up { top: -1px; left: 4px; color: #9be0ff; }
        .arrow.down { bottom: -1px; right: 4px; color: #ffaa66; }
        .sub-count { font-family: ui-monospace, monospace; font-size: 10px; color: var(--text-dim); }
        .cfg-caption {
          margin-top: 14px;
          padding: 10px 14px;
          background: var(--bg-2);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-dim);
          line-height: 1.5;
        }
        .cfg-caption strong { color: var(--text); display: block; margin-bottom: 3px; }
      `}</style>
    </div>
  )
}
