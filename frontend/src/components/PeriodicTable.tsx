import { useMemo, useState } from 'react'
import { useAtomStore } from '../store/atomStore'
import { ptableSlot } from '../data/electronConfig'
import './PeriodicTable.css'

export default function PeriodicTable() {
  const {
    elements, categories, selectedZ, filter, search,
    setFilter, setSearch, selectElement,
  } = useAtomStore()

  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null)

  const filterOptions = useMemo(() => {
    return [
      { id: 'all', label: 'Tous', color: null as string | null },
      ...Object.values(categories)
        .filter(c => c.code !== 'unknown')
        .map(c => ({ id: c.code, label: c.label, color: c.color }))
    ]
  }, [categories])

  const cellMap = useMemo(() => {
    const m = new Map<string, typeof elements[number]>()
    for (const el of elements) {
      const slot = ptableSlot(el.Z, el.period, el.group)
      if (slot) m.set(`${slot.row}-${slot.col}`, el)
    }
    return m
  }, [elements])

  const isDimmed = (el: typeof elements[number]) => {
    if (filter !== 'all' && el.category !== filter) return true
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      if (
        !el.symbol.toLowerCase().includes(q) &&
        !el.nameFR.toLowerCase().includes(q) &&
        String(el.Z) !== q
      ) return true
    }
    return false
  }

  const isPreview = (el: typeof elements[number]) =>
    hoveredFilter !== null && hoveredFilter !== 'all' && el.category === hoveredFilter

  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]

  return (
    <section className="ptable">
      <header className="ptable-head">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Recherche : symbole, nom ou Z"
          className="search"
        />
      </header>

      <div className="grid">
        <div className="legend-inset">
          <div className="legend-head">
            <span className="legend-title">Filtre par catégorie</span>
          </div>
          <div className="legend-buttons">
            {filterOptions.map(f => (
              <button
                key={f.id}
                className={`filter ${filter === f.id ? 'active' : ''} ${f.id === 'all' ? 'all' : ''}`}
                style={f.color ? { ['--col' as any]: f.color } : {}}
                onClick={() => setFilter(f.id)}
                onMouseEnter={() => setHoveredFilter(f.id)}
                onMouseLeave={() => setHoveredFilter(null)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {rows.flatMap(row =>
          cols.map(col => {
            const el = cellMap.get(`${row}-${col}`)
            if (el) {
              return (
                <div
                  key={`${row}-${col}`}
                  className={[
                    'cell',
                    isDimmed(el) ? 'dim' : '',
                    selectedZ === el.Z ? 'active' : '',
                    isPreview(el) ? 'preview' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    gridRow: row >= 8 ? row + 1 : row,
                    gridColumn: col,
                    ['--col' as any]: categories[el.category]?.color,
                  }}
                  onClick={() => selectElement(el.Z)}
                >
                  <span className="z">{el.Z}</span>
                  <span className="sym">{el.symbol}</span>
                  <span className="mass">{el.mass}</span>
                </div>
              )
            }
            if (row === 6 && col === 3) {
              return (
                <div key="ph-lanth" className="cell placeholder" style={{ gridRow: row, gridColumn: col }}>
                  <span className="z">57-71</span>
                  <span className="sym tiny">La-Lu</span>
                </div>
              )
            }
            if (row === 7 && col === 3) {
              return (
                <div key="ph-act" className="cell placeholder" style={{ gridRow: row, gridColumn: col }}>
                  <span className="z">89-103</span>
                  <span className="sym tiny">Ac-Lr</span>
                </div>
              )
            }
            return null
          })
        )}
      </div>
    </section>
  )
}
