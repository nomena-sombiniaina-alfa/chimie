import { useEffect, useState, useMemo } from 'react'
import { useAtomStore } from '../store/atomStore'
import ElementSheet from './ElementSheet'
import DescriptionSection from './DescriptionSection'
import DaltonView from '../views/DaltonView'
import ThomsonView from '../views/ThomsonView'
import RutherfordView from '../views/RutherfordView'
import BohrView from '../views/BohrView'
import SchrodingerView from '../views/SchrodingerView'
import HeisenbergView from '../views/HeisenbergView'
import ChadwickView from '../views/ChadwickView'
import LewisView from '../views/LewisView'
import ConfigurationView from '../views/ConfigurationView'
import PropertiesView from '../views/PropertiesView'
import IsotopesView from '../views/IsotopesView'
import BondsView from '../views/BondsView'
import Loader from './Loader'
import './ElementModal.css'

type ViewId = 'dalton' | 'thomson' | 'rutherford' | 'bohr' | 'schrodinger' | 'heisenberg' |
              'chadwick' | 'lewis' | 'configuration' | 'properties' | 'isotopes' | 'bonds'

interface ViewMeta {
  id: ViewId
  label: string
  year?: number
  icon: string
  q: string
}

const VIEWS: ViewMeta[] = [
  { id: 'dalton',        label: 'Dalton',         year: 1803, icon: '⚪', q: 'Atome indivisible' },
  { id: 'thomson',       label: 'Thomson',        year: 1904, icon: '🍮', q: 'Plum-pudding' },
  { id: 'rutherford',    label: 'Rutherford',     year: 1911, icon: '🪐', q: 'Noyau dense + vide' },
  { id: 'bohr',          label: 'Bohr',           year: 1913, icon: '🌀', q: 'Couches quantifiées' },
  { id: 'schrodinger',   label: 'Schrödinger',    year: 1926, icon: '☁️', q: "Équation d'onde Ψ" },
  { id: 'heisenberg',    label: 'Heisenberg',     year: 1927, icon: '〰️', q: 'Incertitude Δx · Δp' },
  { id: 'chadwick',      label: 'Chadwick',       year: 1932, icon: '⚛️', q: 'Le neutron révélé' },
  { id: 'lewis',         label: 'Lewis',          year: 1916, icon: '✦',  q: 'Électrons de valence' },
  { id: 'configuration', label: 'Configuration',  icon: '📋', q: 'Sous-couches s, p, d, f' },
  { id: 'properties',    label: 'Propriétés',     icon: '📈', q: 'Tendances périodiques' },
  { id: 'isotopes',      label: 'Isotopes',       icon: '🧬', q: 'Variantes nucléaires' },
  { id: 'bonds',         label: 'Liaisons',       icon: '🔗', q: 'Affinité chimique' },
]

const COMPONENTS: Record<ViewId, React.FC> = {
  dalton: DaltonView, thomson: ThomsonView, rutherford: RutherfordView,
  bohr: BohrView, schrodinger: SchrodingerView, heisenberg: HeisenbergView,
  chadwick: ChadwickView, lewis: LewisView, configuration: ConfigurationView,
  properties: PropertiesView, isotopes: IsotopesView, bonds: BondsView,
}

export default function ElementModal() {
  const { modalOpen, closeModal, currentDetail, selectedZ, elements, selectElement } = useAtomStore()
  const [active, setActive] = useState<ViewId>('dalton')

  const prevZ = useMemo(() => {
    const ids = elements.map(e => e.Z)
    const idx = ids.indexOf(selectedZ)
    return idx > 0 ? ids[idx - 1] : null
  }, [elements, selectedZ])

  const nextZ = useMemo(() => {
    const ids = elements.map(e => e.Z)
    const idx = ids.indexOf(selectedZ)
    return idx >= 0 && idx < ids.length - 1 ? ids[idx + 1] : null
  }, [elements, selectedZ])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      else if (e.key === 'ArrowLeft' && prevZ) selectElement(prevZ)
      else if (e.key === 'ArrowRight' && nextZ) selectElement(nextZ)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [modalOpen, prevZ, nextZ, closeModal, selectElement])

  if (!modalOpen) return null

  const cat = currentDetail?.category
  const Component = COMPONENTS[active]

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
      <div className="modal" style={cat ? { ['--col' as any]: cat.color } : {}} role="dialog" aria-modal="true">
        <div className="modal-topbar">
          <button className="nav-btn" onClick={() => prevZ && selectElement(prevZ)} disabled={!prevZ}>←</button>
          <button className="nav-btn" onClick={() => nextZ && selectElement(nextZ)} disabled={!nextZ}>→</button>
          <button className="close-btn" onClick={closeModal} aria-label="Fermer">×</button>
        </div>

        <div className="modal-body">
          {!currentDetail ? (
            <Loader label="Chargement de la fiche…" variant="card" />
          ) : (
            <>
              <ElementSheet />
              <DescriptionSection />

              <section className="views-section">
                <nav className="view-tabs">
                  {VIEWS.map(v => (
                    <button
                      key={v.id}
                      className={`view-tab ${active === v.id ? 'active' : ''}`}
                      onClick={() => setActive(v.id)}
                    >
                      <span className="vt-top">
                        <span className="vt-ico">{v.icon}</span>
                        <span className="vt-label">{v.label}</span>
                        {v.year && <span className="vt-year">{v.year}</span>}
                      </span>
                      <span className="vt-q">{v.q}</span>
                    </button>
                  ))}
                </nav>

                <div className="view-container">
                  <Component key={`${active}-${selectedZ}`} />
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
