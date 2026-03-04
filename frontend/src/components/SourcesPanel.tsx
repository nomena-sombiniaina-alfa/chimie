import { useState } from 'react'
import { useAtomStore } from '../store/atomStore'
import './SourcesPanel.css'

export default function SourcesPanel() {
  const { sources } = useAtomStore()
  const [open, setOpen] = useState(false)

  return (
    <div className="sources-wrap">
      <button className="trigger" onClick={() => setOpen(!open)}>
        <span className="badge">✓ {sources.length} sources</span>
        <span>Validation scientifique</span>
        <span className={`chev ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="dropdown">
          <p className="intro">
            Données cross-vérifiées sur les sources scientifiques de référence ci-dessous.
          </p>
          <ul className="src-list">
            {sources.map(s => (
              <li key={s.code}>
                <div className="src-head">
                  <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
                  <span className="src-verifies">vérifie : {s.verifies.join(', ')}</span>
                </div>
                <div className="src-note">{s.note}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
