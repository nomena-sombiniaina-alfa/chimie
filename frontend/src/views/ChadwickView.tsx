import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount, getNeutrons } from '../store/atomStore'
import { ionLabel, shellDistribution } from '../data/electronConfig'

export default function ChadwickView() {
  const { currentDetail, charge, isotopeShift } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const neutrons = getNeutrons(el, isotopeShift)
  const shells = shellDistribution(electronCount)
  const massNumber = el ? el.Z + neutrons : 0
  const label = el ? ionLabel(el.symbol, charge) : ''

  const canvasRef = useCanvas(() => {
    let nucleons: Array<{ x: number; y: number; isProton: boolean; phase: number }> = []

    function buildNucleus() {
      if (!el) return
      nucleons = []
      const total = el.Z + neutrons
      const golden = Math.PI * (3 - Math.sqrt(5))
      const baseR = 4
      for (let i = 0; i < total; i++) {
        const r = baseR * Math.sqrt(i + 0.5)
        const ang = i * golden
        const isProton = i < el.Z
        nucleons.push({
          x: Math.cos(ang) * r,
          y: Math.sin(ang) * r,
          isProton,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    return {
      onResize: buildNucleus,
      draw: (ctx, w, h, _dt, t) => {
        if (!el) return
        const cx = w / 2, cy = h / 2
        const scale = 3

        // Couches faibles en arrière-plan
        ctx.strokeStyle = 'rgba(255,255,255,0.05)'
        ctx.lineWidth = 0.8
        for (let s = 0; s < shells.length; s++) {
          const r = 100 + s * 30
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
        }
        for (let s = 0; s < shells.length; s++) {
          const r = 100 + s * 30
          const k = shells[s]
          for (let i = 0; i < k; i++) {
            const ang = (i / Math.max(1, k)) * Math.PI * 2 + t * (0.4 - s * 0.04)
            const x = cx + Math.cos(ang) * r
            const y = cy + Math.sin(ang) * r
            ctx.fillStyle = 'rgba(155,224,255,0.5)'
            ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill()
          }
        }

        // Noyau - main focus
        const haloR = 60
        const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, haloR)
        halo.addColorStop(0, 'rgba(255, 200, 100, 0.35)')
        halo.addColorStop(1, 'rgba(255, 200, 100, 0)')
        ctx.fillStyle = halo
        ctx.beginPath(); ctx.arc(cx, cy, haloR, 0, Math.PI * 2); ctx.fill()

        for (const n of nucleons) {
          const wob = Math.sin(t * 3 + n.phase) * 0.6
          const x = cx + n.x * scale + wob
          const y = cy + n.y * scale + wob
          const r = 4
          const g = ctx.createRadialGradient(x - 1, y - 1, 0, x, y, r * 1.6)
          if (n.isProton) {
            g.addColorStop(0, '#ffb1a1'); g.addColorStop(1, '#a02e22')
          } else {
            g.addColorStop(0, '#d0dbf2'); g.addColorStop(1, '#5870a8')
          }
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
          if (nucleons.length < 30) {
            ctx.fillStyle = 'rgba(255,255,255,0.85)'
            ctx.font = 'bold 7px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(n.isProton ? '+' : 'n', x, y)
            ctx.textAlign = 'start'
            ctx.textBaseline = 'alphabetic'
          }
        }

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(label, cx, cy - 80)
        ctx.font = '12px ui-monospace, monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fillText(`A = Z + N = ${el.Z} + ${neutrons} = ${massNumber}`, cx, cy - 60)
        ctx.textAlign = 'start'

        // Légendes particules
        ctx.fillStyle = '#ff7766'
        ctx.beginPath(); ctx.arc(28, h - 70, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = '12px sans-serif'
        ctx.fillText(`${el.Z} protons (+, charge nucléaire)`, 42, h - 66)
        ctx.fillStyle = '#9bb0d6'
        ctx.beginPath(); ctx.arc(28, h - 48, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillText(`${neutrons} neutrons (n, masse sans charge)`, 42, h - 44)
        ctx.fillStyle = '#9be0ff'
        ctx.beginPath(); ctx.arc(28, h - 26, 6, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.fillText(`${electronCount} électrons (en arrière-plan)`, 42, h - 22)

        // Items à droite
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.font = '12px sans-serif'
        const items = [
          '① Le neutron - particule neutre dans le noyau',
          '② Explique les isotopes (même Z, A différents)',
          '③ Cohésion nucléaire par interaction forte',
          '④ A = Z + N (nombre de masse)',
        ]
        const startY = 80
        ctx.textAlign = 'right'
        for (let i = 0; i < items.length; i++) ctx.fillText(items[i], w - 20, startY + i * 18)
        ctx.textAlign = 'start'

        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText('1932', 20, 30)
        ctx.font = '11px sans-serif'
        ctx.fillText('James Chadwick', 20, 48)
      }
    }
  }, [el?.Z, charge, isotopeShift])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Découverte du neutron - le noyau pleinement compris</strong>
        En bombardant du béryllium avec des particules alpha, Chadwick identifie un rayonnement neutre,
        massif comme le proton : le neutron. Le noyau apparaît dès lors comme un assemblage de protons et de neutrons,
        ce qui explique enfin la notion d'isotopes.
      </div>
    </div>
  )
}
