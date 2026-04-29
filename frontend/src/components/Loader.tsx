import './Loader.css'

interface Props {
  label?: string
  variant?: 'page' | 'card' | 'inline'
}

// Loader thématique : noyau central + 3 électrons sur des orbites de tailles
// différentes. Utilisé partout où la page attend une réponse d'API.
export default function Loader({ label = 'Chargement…', variant = 'page' }: Props) {
  return (
    <div className={`loader loader-${variant}`} role="status" aria-live="polite">
      <div className="atom-loader" aria-hidden="true">
        <span className="nucleus" />
        <span className="orbit orbit-outer">
          <span className="electron e-blue" />
        </span>
        <span className="orbit orbit-middle">
          <span className="electron e-pink" />
        </span>
        <span className="orbit orbit-inner">
          <span className="electron e-yellow" />
        </span>
      </div>
      <p className="loader-label">{label}</p>
      <span className="sr-only">Chargement en cours</span>
    </div>
  )
}
