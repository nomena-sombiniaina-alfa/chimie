import { useCanvas } from '../../hooks/useCanvas'

// Schéma : deux atomes H qui approchent, leurs orbitales 1s se recouvrent,
// l'électron est partagé dans une orbitale moléculaire σ.
export default function CovalentDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2, cy = h / 2
      const phase = (t % 6) / 6

      // Animation : les deux H s'approchent jusqu'à former H₂
      const minSep = 80
      const maxSep = 280
      const sep = maxSep - (maxSep - minSep) * Math.min(1, phase * 2)
      const aX = cx - sep / 2
      const bX = cx + sep / 2

      // Orbitales 1s (cercles diffus)
      drawOrbital(ctx, aX, cy, 60)
      drawOrbital(ctx, bX, cy, 60)

      // Recouvrement = zone où les orbitales se touchent
      const overlap = Math.max(0, 60 + 60 - sep)
      if (overlap > 0) {
        const overlapAlpha = Math.min(1, overlap / 60) * 0.5
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30 + overlap / 2)
        g.addColorStop(0, `rgba(0, 212, 255, ${overlapAlpha})`)
        g.addColorStop(1, 'rgba(0, 212, 255, 0)')
        ctx.fillStyle = g
        ctx.beginPath(); ctx.arc(cx, cy, 30 + overlap / 2, 0, Math.PI * 2); ctx.fill()
      }

      // Noyaux H
      drawNucleus(ctx, aX, cy, 'H')
      drawNucleus(ctx, bX, cy, 'H')

      // Les deux électrons : un de chaque, oscillant entre les deux noyaux quand liés
      const bound = sep < 100
      if (bound) {
        const t1 = t * 1.5
        const e1x = (aX + bX) / 2 + Math.cos(t1) * 20
        const e2x = (aX + bX) / 2 - Math.cos(t1) * 20
        const e1y = cy + Math.sin(t1) * 6
        const e2y = cy - Math.sin(t1) * 6
        drawElectron(ctx, e1x, e1y, '↑')
        drawElectron(ctx, e2x, e2y, '↓')
      } else {
        drawElectron(ctx, aX, cy, '↑')
        drawElectron(ctx, bX, cy, '↓')
      }

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const label = bound
        ? 'Recouvrement σ : paire d\'électrons partagée entre les deux noyaux'
        : 'Atomes H séparés : chaque électron sur son orbitale 1s'
      ctx.fillText(label, cx, h - 50)

      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('H-H : 432 kJ/mol - ΔEN = 0, liaison strictement non polaire', cx, h - 25)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawOrbital(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, 'rgba(0, 212, 255, 0.35)')
  g.addColorStop(0.6, 'rgba(0, 212, 255, 0.10)')
  g.addColorStop(1, 'rgba(0, 212, 255, 0)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
}

function drawNucleus(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 14)
  g.addColorStop(0, '#ffb1a1')
  g.addColorStop(1, '#a02e22')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
}

function drawElectron(ctx: CanvasRenderingContext2D, x: number, y: number, spin: string) {
  ctx.fillStyle = '#9be0ff'
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(spin, x + 8, y - 6)
}
