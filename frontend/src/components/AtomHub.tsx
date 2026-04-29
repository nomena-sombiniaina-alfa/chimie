import { useAtomStore } from '../store/atomStore'
import PeriodicTable from './PeriodicTable'
import ElementModal from './ElementModal'
import Loader from './Loader'
import './AtomHub.css'

export default function AtomHub() {
  const { loaded, error } = useAtomStore()

  if (error)   return <div className="error">Erreur : {error}</div>
  if (!loaded) return <Loader label="Chargement du tableau périodique…" />

  return (
    <div className="atom-hub">
      <PeriodicTable />
      <ElementModal />
    </div>
  )
}
