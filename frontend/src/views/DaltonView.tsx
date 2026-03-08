import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore } from '../store/atomStore'

export default function DaltonView() {
  const { currentDetail } = useAtomStore()
  const el = currentDetail

  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      if (!el) return
      const cx = w / 2, cy = h / 2
      const r = Math.min(w, h) * 0.26

      const grd = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.05, cx, cy, r)
      grd.addColorStop(0, '#ffffff')
      grd.addColorStop(0.3, el.color)
      grd.addColorStop(1, '#1a1f2e')
      ctx.fillStyle = grd
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()

      const pulse = 1 + Math.sin(t * 0.6) * 0.03
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + 0.04 * Math.sin(t * 1.5)})`
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2); ctx.stroke()

      ctx.fillStyle = '#0a0e1a'
      ctx.font = `bold ${r * 0.52}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(el.symbol, cx, cy - r * 0.05)

      ctx.font = `${r * 0.13}px sans-serif`
      ctx.fillStyle = 'rgba(10,14,26,0.6)'
      ctx.fillText(`masse ${el.mass} u`, cx, cy + r * 0.42)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'

      const postulates = [
        '① Atomes indivisibles',
        '② Identiques pour un même élément',
        '③ Différents éléments → atomes différents',
        '④ Proportions définies en combinaison'
      ]
      ctx.fillStyle = 'rgba(255,255,255,0.45)'
      ctx.font = '12px sans-serif'
      const startY = h - 14 - (postulates.length - 1) * 18
      for (let i = 0; i < postulates.length; i++) {
        ctx.fillText(postulates[i], 20, startY + i * 18)
      }

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('1803', w - 20, 30)
      ctx.font = '11px sans-serif'
      ctx.fillText('John Dalton', w - 20, 48)
      ctx.textAlign = 'start'
    }
  }), [el?.Z])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Atomes indivisibles - théorie chimique des proportions</strong>
        Dalton conçoit l'atome comme une « bille » solide, indivisible et caractéristique de chaque élément.
        Les composés résultent de leur combinaison en rapports entiers fixes. Aucune structure interne n'est encore connue.
      </div>
    </div>
  )
}
