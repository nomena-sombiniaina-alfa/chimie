import { useCanvas } from '../../hooks/useCanvas'

// Schéma : deux atomes apolaires avec dipôles instantanés qui s'alignent
export default function VanDerWaalsDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2, cy = h / 2
      const sep = 180
      const aX = cx - sep / 2
      const bX = cx + sep / 2

      // Phase de la fluctuation électronique
      const phase = Math.sin(t * 2.5) * 0.6  // entre -0.6 et 0.6

      // Atome A : nuage électronique décalé selon phase
      drawAtomWithDipole(ctx, aX, cy, 'A', phase)
      // Atome B : dipôle induit (en phase opposée - l'attraction l'aligne)
      drawAtomWithDipole(ctx, bX, cy, 'B', phase)

      // Flèche dipôle au-dessus de chaque atome
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.8)'
      ctx.lineWidth = 2
      drawDipoleArrow(ctx, aX, cy - 65, phase * 40)
      drawDipoleArrow(ctx, bX, cy - 65, phase * 40)

      // Force d'attraction faible
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)'
      ctx.setLineDash([3, 3])
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(aX + 40, cy)
      ctx.lineTo(bX - 40, cy)
      ctx.stroke()
      ctx.setLineDash([])

      // Légendes
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Dipôles instantanés synchronisés (force de London)', cx, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('~1 kJ/mol - toujours présent, augmente avec la polarisabilité', cx, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawAtomWithDipole(ctx: CanvasRenderingContext2D, cx: number, cy: number,
                            label: string, shift: number) {
  // Noyau immobile
  ctx.fillStyle = '#ff7766'
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy - 18)

  // Nuage électronique décalé
  const g = ctx.createRadialGradient(cx + shift * 50, cy, 5, cx + shift * 50, cy, 40)
  g.addColorStop(0, 'rgba(155, 224, 255, 0.45)')
  g.addColorStop(0.6, 'rgba(155, 224, 255, 0.18)')
  g.addColorStop(1, 'rgba(155, 224, 255, 0)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(cx + shift * 50, cy, 40, 0, Math.PI * 2); ctx.fill()

  // δ⁺ / δ⁻ visibles si dipôle marqué
  if (Math.abs(shift) > 0.1) {
    ctx.font = 'bold 13px sans-serif'
    ctx.fillStyle = shift > 0 ? '#ff7777' : '#7fffaa'
    ctx.fillText(shift > 0 ? 'δ⁻' : 'δ⁺', cx + 35, cy + 5)
    ctx.fillStyle = shift > 0 ? '#7fffaa' : '#ff7777'
    ctx.fillText(shift > 0 ? 'δ⁺' : 'δ⁻', cx - 35, cy + 5)
  }
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}

function drawDipoleArrow(ctx: CanvasRenderingContext2D, x: number, y: number, length: number) {
  if (Math.abs(length) < 5) return
  ctx.beginPath()
  ctx.moveTo(x - length, y)
  ctx.lineTo(x + length, y)
  ctx.stroke()
  // Tête de flèche
  const tipX = x + length
  const dir = Math.sign(length) || 1
  ctx.beginPath()
  ctx.moveTo(tipX, y)
  ctx.lineTo(tipX - 7 * dir, y - 4)
  ctx.moveTo(tipX, y)
  ctx.lineTo(tipX - 7 * dir, y + 4)
  ctx.stroke()
}
