import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount, getNeutrons } from '../store/atomStore'
import { ionLabel } from '../data/electronConfig'

export default function RutherfordView() {
  const { currentDetail, charge, isotopeShift } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const neutrons = getNeutrons(el, isotopeShift)
  const label = el ? ionLabel(el.symbol, charge) : ''

  const canvasRef = useCanvas(() => {
    let electrons: Array<{ rx: number; ry: number; rot: number; angle: number; speed: number }> = []

    function build() {
      electrons = []
      for (let i = 0; i < electronCount; i++) {
        electrons.push({
          rx: 80 + Math.random() * 130,
          ry: 50 + Math.random() * 110,
          rot: Math.random() * Math.PI,
          angle: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 2 * (Math.random() < 0.5 ? 1 : -1),
        })
      }
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt) => {
        if (!el) return
        const cx = w / 2, cy = h / 2

        // Grille de fond
        ctx.strokeStyle = 'rgba(255, 200, 80, 0.04)'
        ctx.lineWidth = 1
        const spacing = 60
        for (let x = cx % spacing; x < w; x += spacing) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
        }
        for (let y = cy % spacing; y < h; y += spacing) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
        }

        // Orbites faibles
        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 0.8
        for (const e of electrons) {
          ctx.save()
          ctx.translate(cx, cy)
          ctx.rotate(e.rot)
          ctx.beginPath(); ctx.ellipse(0, 0, e.rx, e.ry, 0, 0, Math.PI * 2); ctx.stroke()
          ctx.restore()
        }

        // Noyau (minuscule)
        const baseR = 14
        const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, baseR + 6)
        halo.addColorStop(0, 'rgba(255, 200, 100, 0.7)')
        halo.addColorStop(1, 'rgba(255, 200, 100, 0)')
        ctx.fillStyle = halo
        ctx.beginPath(); ctx.arc(cx, cy, baseR + 6, 0, Math.PI * 2); ctx.fill()
        const total = el.Z + neutrons
        const cluster = Math.min(12, total)
        for (let i = 0; i < cluster; i++) {
          const a = (i / cluster) * Math.PI * 2 + (i % 3) * 0.3
          const rr = 2 + (i % 3) * 2
          const x = cx + Math.cos(a) * rr
          const y = cy + Math.sin(a) * rr
          ctx.fillStyle = '#ff7766'
          ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill()
        }
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(label, cx, cy - baseR - 14)
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'

        // Electrons mobiles
        for (const e of electrons) {
          e.angle += e.speed * dt
          const lx = Math.cos(e.angle) * e.rx
          const ly = Math.sin(e.angle) * e.ry
          const c = Math.cos(e.rot), s = Math.sin(e.rot)
          const x = cx + lx * c - ly * s
          const y = cy + lx * s + ly * c
          const g = ctx.createRadialGradient(x, y, 0, x, y, 7)
          g.addColorStop(0, '#9be0ff')
          g.addColorStop(1, 'rgba(80,160,240,0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill()
        }

        // Pointillé "vide"
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'
        ctx.setLineDash([3, 4])
        ctx.beginPath(); ctx.moveTo(cx + baseR + 8, cy); ctx.lineTo(cx + 90, cy - 50); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.font = 'italic 11px sans-serif'
        ctx.fillText('… atome surtout vide …', cx + 90, cy - 56)

        // Légende
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.font = '12px sans-serif'
        const items = [
          '① Noyau dense central (charge +)',
          '② Atome >99,99 % de vide',
          '③ Électrons en orbites « planétaires »',
          "④ Inspiré de l'expérience de la feuille d'or",
        ]
        const startY = h - 14 - (items.length - 1) * 18
        for (let i = 0; i < items.length; i++) ctx.fillText(items[i], 20, startY + i * 18)

        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('1911', w - 20, 30)
        ctx.font = '11px sans-serif'
        ctx.fillText('Ernest Rutherford', w - 20, 48)
        ctx.textAlign = 'start'
      }
    }
  }, [el?.Z, charge])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Modèle planétaire - naissance du noyau atomique</strong>
        En bombardant une feuille d'or de particules alpha, Rutherford constate que la quasi-totalité
        passent à travers - quelques-unes rebondissent. Conclusion : la masse et la charge positive
        sont concentrées dans un minuscule noyau central, et l'atome est essentiellement vide.
      </div>
    </div>
  )
}
