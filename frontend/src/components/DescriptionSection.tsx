import { useAtomStore } from '../store/atomStore'
import './DescriptionSection.css'

export default function DescriptionSection() {
  const { currentDetail } = useAtomStore()
  if (!currentDetail) return null
  const d = currentDetail.description

  return (
    <section className="desc-section">
      <div className="card occurrence">
        <div className="card-head">
          <span className="ico">📍</span>
          <h4>Où le trouver</h4>
        </div>
        <p>{d.occurrence || '-'}</p>
      </div>
      <div className="card specificity">
        <div className="card-head">
          <span className="ico">✨</span>
          <h4>Spécificités</h4>
        </div>
        <p>{d.specificity || '-'}</p>
      </div>
      <div className="card uses">
        <div className="card-head">
          <span className="ico">🔧</span>
          <h4>Utilisations principales</h4>
        </div>
        {d.uses.length > 0 ? (
          <ul>{d.uses.map((u, i) => <li key={i}>{u}</li>)}</ul>
        ) : <p>-</p>}
      </div>
      <div className="card role">
        <div className="card-head">
          <span className="ico">🎯</span>
          <h4>Rôle</h4>
        </div>
        <p>{d.role || '-'}</p>
      </div>
    </section>
  )
}
