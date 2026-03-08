import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount } from '../store/atomStore'
import { ionLabel } from '../data/electronConfig'

export default function ThomsonView() {
  const { currentDetail, charge } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const label = el ? ionLabel(el.symbol, charge) : ''

  const canvasRef = useCanvas(() => {
    let electrons: Array<{ ox: number; oy: number; phase: number; amp: number }> = []
    let plusSigns: Array<{ x: number; y: number }> = []

    function build(w: number, h: number) {
      const R = Math.min(w, h) * 0.32
      electrons = []
      plusSigns = []
      for (let i = 0; i < electronCount; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * R * 0.85
        electrons.push({
          ox: Math.cos(a) * r,
          oy: Math.sin(a) * r,
          phase: Math.random() * Math.PI * 2,
          amp: 2 + Math.random() * 3
        })
      }
      const Z = el?.Z || 0
      for (let i = 0; i < Math.min(30, Z); i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * R * 0.75
        plusSigns.push({ x: Math.cos(a) * r, y: Math.sin(a) * r })
      }
    }

    return {
      onResize: build,
      draw: (ctx, w, h, _dt, t) => {
        if (!el) return
        const cx = w / 2, cy = h / 2
        const R = Math.min(w, h) * 0.32

        const grd = ctx.createRadialGradient(cx, cy, 8, cx, cy, R)
        grd.addColorStop(0,   'rgba(255, 190, 130, 0.55)')
        grd.addColorStop(0.6, 'rgba(255, 130, 100, 0.30)')
        grd.addColorStop(1,   'rgba(255, 90, 70, 0)')
        ctx.fillStyle = grd
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = 'rgba(255,140,110,0.55)'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        for (const p of plusSigns) ctx.fillText('+', cx + p.x, cy + p.y)

        for (const e of electrons) {
          const wob = Math.sin(t * 2 + e.phase) * e.amp
          const x = cx + e.ox + Math.cos(t * 1.3 + e.phase) * wob
          const y = cy + e.oy + Math.sin(t * 0.9 + e.phase) * wob
          const g = ctx.createRadialGradient(x, y, 0, x, y, 8)
          g.addColorStop(0, '#9be0ff')
          g.addColorStop(1, 'rgba(60,140,220,0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#ffffff'
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill()
        }

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 20px sans-serif'
        ctx.fillText(label, cx, cy - R - 28)

        ctx.textAlign = 'start'
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.font = '12px sans-serif'
        const items = [
          '① Sphère de charge positive uniforme',
          `② ${electronCount} électron(s) "corpuscules" embarqués`,
          '③ Charge globale neutralisée',
          '④ Pas de noyau (encore)'
        ]
        const startY = h - 14 - (items.length - 1) * 18
        for (let i = 0; i < items.length; i++) ctx.fillText(items[i], 20, startY + i * 18)

        ctx.fillStyle = 'rgba(255,255,255,0.3)'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText('1904', w - 20, 30)
        ctx.font = '11px sans-serif'
        ctx.fillText('J. J. Thomson', w - 20, 48)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [el?.Z, charge])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Modèle « plum-pudding » - découverte de l'électron</strong>
        Après avoir identifié l'électron (1897), Thomson imagine l'atome comme une sphère
        de charge positive diffuse dans laquelle baignent des « corpuscules » négatifs.
        Modèle invalidé en 1911 par Rutherford.
      </div>
    </div>
  )
}
