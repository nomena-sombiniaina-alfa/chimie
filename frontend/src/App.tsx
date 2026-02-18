import { useEffect, useState } from 'react'
import AtomHub from './components/AtomHub'
import UnitsHub from './components/UnitsHub'

type TabId = 'atom' | 'units'

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'atom',  icon: '⚛️', label: 'Modèle atomique' },
  { id: 'units', icon: '📏', label: 'Unités de mesure' },
]

export default function App() {
  const [active, setActive] = useState<TabId>('atom')

  // Petit lifecycle log : la console aide à débugger pendant le dev.
  useEffect(() => {
    document.title = `Chimie - ${TABS.find(t => t.id === active)?.label}`
  }, [active])

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Chimie</h1>
      </header>

      <nav className="tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`tab ${active === t.id ? 'active' : ''}`}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
          >
            <span className="ico">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {active === 'atom'  ? <AtomHub />  : null}
        {active === 'units' ? <UnitsHub /> : null}
      </main>
    </div>
  )
}
