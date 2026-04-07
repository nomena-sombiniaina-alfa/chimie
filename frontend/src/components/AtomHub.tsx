import { useAtomStore } from '../store/atomStore'
import PeriodicTable from './PeriodicTable'
import ElementModal from './ElementModal'
import './AtomHub.css'

export default function AtomHub() {
  const { loaded, error } = useAtomStore()

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <div className="loading">Chargement du tableau périodique…</div>

  return (
    <div className="atom-hub">
      <PeriodicTable />
      <ElementModal />
    </div>
  )
}
