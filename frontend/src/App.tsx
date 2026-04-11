import { useEffect, useState } from 'react'
import AtomHub from './components/AtomHub'
import UnitsHub from './components/UnitsHub'
import BondsHub from './components/BondsHub'
import SourcesPanel from './components/SourcesPanel'
import { useAtomStore } from './store/atomStore'

type TabId = 'atom' | 'bonds' | 'units'

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'atom',  icon: '⚛️', label: 'Modèle atomique' },
  { id: 'bonds', icon: '🔗', label: 'Liaisons chimiques' },
  { id: 'units', icon: '📏', label: 'Unités de mesure' },
]

export default function App() {
  const [active, setActive] = useState<TabId>('atom')
  const { loaded, loadAll } = useAtomStore()

  // Données atomiques chargées globalement : le footer "sources" reste accessible
  // depuis n'importe quel onglet.
  useEffect(() => { if (!loaded) loadAll() }, [loaded, loadAll])

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
        {active === 'bonds' ? <BondsHub /> : null}
        {active === 'units' ? <UnitsHub /> : null}
      </main>

      <footer className="app-footer">
        <SourcesPanel />
      </footer>
    </div>
  )
}
