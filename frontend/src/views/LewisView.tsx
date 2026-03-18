import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount } from '../store/atomStore'
import { shellDistribution, getValenceElectrons } from '../data/electronConfig'

export default function LewisView() {
  const { currentDetail, charge } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const shells = shellDistribution(electronCount)
  const valence = getValenceElectrons(shells)

  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h) => {
      if (!el) return
      const cx = w / 2, cy = h / 2
      const sym = el.symbol
      const charged = charge !== 0
      const v = Math.min(8, valence)
      const fs = 84
      const d = 70
      const sep = 14

      ctx.fillStyle = '#fff'
      ctx.font = `bold ${fs}px sans-serif`
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(sym, cx, cy)

      const sides = [
        { x: 0,  y: -d, dx: -sep, dy: 0 },
        { x: d,  y: 0,  dx: 0,    dy: -sep },
        { x: 0,  y: d,  dx: -sep, dy: 0 },
        { x: -d, y: 0,  dx: 0,    dy: -sep },
      ]
      const placements: Array<{ x: number; y: number }> = []
      for (let i = 0; i < Math.min(4, v); i++) {
        const s = sides[i]
        placements.push({ x: cx + s.x, y: cy + s.y })
      }
      for (let i = 4; i < v; i++) {
        const s = sides[i - 4]
        const idx = i - 4
        placements[idx] = { x: cx + s.x - s.dx, y: cy + s.y - s.dy }
        placements.push({ x: cx + s.x + s.dx, y: cy + s.y + s.dy })
      }

      for (const p of placements) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10)
        g.addColorStop(0, '#9be0ff')
        g.addColorStop(1, 'rgba(80,160,240,0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill()
      }

      if (charged) {
        const bL = cx - d - 40, bR = cx + d + 40
        const bT = cy - d - 40, bB = cy + d + 40
        const tick = 16
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2.4
        ctx.beginPath()
        ctx.moveTo(bL + tick, bT); ctx.lineTo(bL, bT); ctx.lineTo(bL, bB); ctx.lineTo(bL + tick, bB)
        ctx.moveTo(bR - tick, bT); ctx.lineTo(bR, bT); ctx.lineTo(bR, bB); ctx.lineTo(bR - tick, bB)
        ctx.stroke()
        ctx.fillStyle = charge > 0 ? '#ff7777' : '#7fffaa'
        ctx.font = 'bold 26px sans-serif'
        const n = Math.abs(charge)
        const txt = (n > 1 ? n : '') + (charge > 0 ? '+' : '−')
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle'
        ctx.fillText(txt, bR + 8, bT + 8)
      }

      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '13px sans-serif'
      ctx.fillText(`${valence} électron(s) de valence`, 20, 30)
      ctx.fillText(`Couche ${['K','L','M','N','O','P','Q'][shells.length - 1] || ''} (n = ${shells.length})`, 20, 50)
    }
  }), [el?.Z, charge])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Quels électrons réagissent ?</strong>
        La représentation de Lewis ne montre que les électrons de la couche externe (valence) -
        ce sont eux qui forment les liaisons chimiques. Un atome cherche à compléter son octet
        (8 électrons) en partageant, donnant ou recevant des électrons.
      </div>
    </div>
  )
}
