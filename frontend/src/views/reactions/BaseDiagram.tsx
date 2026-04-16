import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : NaOH se dissout, libère Na+ et OH-.
// Compte les pastilles dissoutes; figé à MAX_CYCLES.
export default function BaseDiagram() {
  const canvasRef = useCanvas(() => {
    const MAX_CYCLES = 4
    const PERIOD = 4
    let cycle = 1
    let frozen = false
    let frozenT = 0
    return {
      draw: (ctx, w, h, _dt, t) => {
        if (!frozen) {
          const c = Math.min(MAX_CYCLES, Math.floor(t / PERIOD) + 1)
          if (c !== cycle) cycle = c
          if (cycle >= MAX_CYCLES && (t % PERIOD) / PERIOD > 0.95) {
            frozen = true
            frozenT = t
          }
        }
        const animT = frozen ? frozenT : t
        const cy = h / 2 - 30
        const phase = (animT % PERIOD) / PERIOD
        const reactX = w * 0.25
        const arrowX = w / 2
        const productX = w * 0.75

        // NaOH solide (cube) en entrée
        const opIn = 1 - Math.max(0, (phase - 0.4) / 0.5)
        ctx.globalAlpha = opIn
        ctx.fillStyle = '#dde2eb'
        ctx.fillRect(reactX - 22, cy - 22, 44, 44)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 1
        ctx.strokeRect(reactX - 22, cy - 22, 44, 44)
        ctx.fillStyle = '#0a0e1a'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('NaOH(s)', reactX, cy)
        ctx.globalAlpha = 1

        // Flèche dans l'eau (label H2O)
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(arrowX - 60, cy); ctx.lineTo(arrowX + 60, cy); ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(arrowX + 60, cy); ctx.lineTo(arrowX + 50, cy - 6)
        ctx.moveTo(arrowX + 60, cy); ctx.lineTo(arrowX + 50, cy + 6)
        ctx.stroke()
        ctx.fillStyle = 'rgba(102, 200, 255, 0.85)'
        ctx.font = 'bold 12px sans-serif'
        ctx.fillText('H₂O', arrowX, cy - 14)

        // Produits ionisés
        const opOut = Math.max(0, (phase - 0.3) / 0.5)
        ctx.globalAlpha = opOut
        drawIon(ctx, productX - 30, cy - 30, 'Na', '+', '#ff8a8a')
        drawIon(ctx, productX + 30, cy + 30, 'OH', '-', '#7fffaa')
        ctx.globalAlpha = 1

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: '#dde2eb', label: 'NaOH(s) (pastille solide)', shape: 'square' },
          { color: '#66c8ff', label: 'H₂O (solvant)' },
          { color: '#ff8a8a', label: 'Na⁺ (cation libéré)' },
          { color: '#7fffaa', label: 'OH⁻ (ion hydroxyde)' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Pastille')

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('NaOH(s)  ->  Na⁺(aq) + OH⁻(aq)', w / 2, h - 50)
        ctx.fillStyle = frozen ? '#ffcc44' : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(
          frozen
            ? `Solution saturée d\'OH⁻ (${MAX_CYCLES} pastilles dissoutes)`
            : 'Base forte d\'Arrhenius : libère OH⁻ totalement en solution',
          w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawIon(ctx: CanvasRenderingContext2D, x: number, y: number,
                 label: string, sign: string, color: string) {
  const g = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, 22)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.4, color)
  g.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
  ctx.fillStyle = sign === '+' ? '#ff7777' : '#7fffaa'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText(sign, x + 14, y - 14)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
