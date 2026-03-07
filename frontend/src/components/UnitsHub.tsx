import { useEffect, useMemo } from 'react'
import { useUnitsStore } from '../store/unitsStore'
import './UnitsHub.css'

const GROUPS = [
  { id: 'base',     label: 'Unités de base (7)',      hint: 'Les fondations du Système international' },
  { id: 'derived',  label: 'Unités dérivées (22)',    hint: 'Combinaisons des unités de base, avec noms propres' },
  { id: 'accepted', label: 'Hors-SI acceptées',       hint: 'Utilisées avec le SI dans la vie courante' },
]

export default function UnitsHub() {
  const {
    units, constants, currentDetail, selectedSlug, search, showConstants,
    loaded, error, loadAll, selectUnit, setSearch, toggleConstants,
  } = useUnitsStore()

  useEffect(() => { if (!loaded) loadAll() }, [loaded, loadAll])

  const filteredUnits = useMemo(() => {
    if (!search.trim()) return units
    const q = search.trim().toLowerCase()
    return units.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.symbol.toLowerCase().includes(q) ||
      u.quantity.toLowerCase().includes(q)
    )
  }, [units, search])

  const groupedUnits = useMemo(() => {
    return GROUPS.map(g => ({
      ...g,
      units: filteredUnits.filter(u => u.group === g.id),
    })).filter(g => g.units.length > 0)
  }, [filteredUnits])

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <div className="loading">Chargement des unités…</div>

  return (
    <div className="units">
      <div className="hdr">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher (nom, symbole…)"
          className="search"
        />
        <button
          className={`btn ${showConstants ? 'active' : ''}`}
          onClick={toggleConstants}
        >
          {showConstants ? '✕' : 'ℹ'} Constantes SI
        </button>
      </div>

      {showConstants && (
        <div className="constants">
          <p className="intro">
            Depuis le <strong>20 mai 2019</strong>, les 7 unités de base sont définies en fixant 7 constantes
            physiques fondamentales. Les étalons matériels (kilogramme étalon, mètre étalon) sont remplacés
            par des valeurs numériques exactes.
          </p>
          <ul className="constants-list">
            {constants.map(c => (
              <li key={c.slug}>
                <span className="cs">{c.symbol}</span>
                <span className="cv">= {c.value}</span>
                <span className="cn">- {c.name}</span>
                <span className="cd">→ définit le <strong>{c.defines}</strong></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="body">
        <aside className="sidebar">
          {groupedUnits.map(g => (
            <div className="group" key={g.id}>
              <div className="group-head">
                <span className="g-label">{g.label}</span>
                <span className="g-hint">{g.hint}</span>
              </div>
              {g.units.map(u => (
                <button
                  key={u.slug}
                  className={`unit-btn ${selectedSlug === u.slug ? 'active' : ''}`}
                  onClick={() => selectUnit(u.slug)}
                >
                  <span className="sym">{u.symbol}</span>
                  <span className="info">
                    <span className="name">{u.name}</span>
                    <span className="qty">{u.quantity}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </aside>

        {currentDetail && (
          <main className="detail">
            <header className="detail-head">
              <div className="big-sym">{currentDetail.symbol}</div>
              <div className="head-text">
                <h1>{currentDetail.name}</h1>
                <p className="quantity">Grandeur : {currentDetail.quantity}</p>
              </div>
            </header>

            <section className="card definition">
              <h3>📐 Définition actuelle</h3>
              <p>{currentDetail.definition}</p>
              {currentDetail.formula && <div className="formula">{currentDetail.formula}</div>}
              {currentDetail.formulaLegend.length > 0 && (
                <ul className="formula-legend">
                  {currentDetail.formulaLegend.map((item, i) => (
                    <li key={i}>
                      <span className="leg-sym">{item.symbol}</span>
                      <span className="leg-arrow">→</span>
                      <span className="leg-desc">{item.description}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {currentDetail.history.length > 0 && (
              <section className="card history">
                <h3>📜 Histoire</h3>
                <ol className="timeline">
                  {currentDetail.history.map((h, i) => (
                    <li key={i}>
                      <span className="year">
                        {h.year > 0 ? h.year : `${Math.abs(h.year)} av. J.-C.`}
                      </span>
                      <span className="event">{h.text}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {currentDetail.conversions.length > 0 && (
              <section className="card conversions">
                <h3>🔁 Table de conversion</h3>
                <table>
                  <tbody>
                    {currentDetail.conversions.map((c, i) => (
                      <tr key={i}>
                        <td className="from">{c.from}</td>
                        <td className="eq">=</td>
                        <td className="to">{c.to}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {currentDetail.pitfalls.length > 0 && (
              <section className="card pitfalls">
                <h3>⚠️ Pièges et erreurs courantes</h3>
                <ul>
                  {currentDetail.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </section>
            )}
          </main>
        )}
      </div>
    </div>
  )
}
