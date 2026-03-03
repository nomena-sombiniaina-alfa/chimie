import { useEffect } from 'react'
import { useAtomStore } from '../store/atomStore'
import PeriodicTable from './PeriodicTable'
import ElementModal from './ElementModal'
import SourcesPanel from './SourcesPanel'
import './AtomHub.css'

export default function AtomHub() {
  const { loaded, error, loadAll } = useAtomStore()

  useEffect(() => {
    if (!loaded) loadAll()
  }, [loaded, loadAll])

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <div className="loading">Chargement du tableau périodique…</div>

  return (
    <div className="atom-hub">
      <div className="hub-actions">
        <SourcesPanel />
      </div>

      <PeriodicTable />
      <ElementModal />
    </div>
  )
}
