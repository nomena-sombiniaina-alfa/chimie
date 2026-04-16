import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : H+ et OH- s'attirent pour former H2O. Ions spectateurs Na+ Cl- visibles.
// Après MAX_CYCLES rencontres, la cuve reste figée (réaction complète).
export default function AcidBaseDiagram() {
  const canvasRef = useCanvas(() => {
    const MAX_CYCLES = 4
    const PERIOD = 4
    let cycle = 1
    let frozen = false
    let frozenT = 0
    return {
      draw: (ctx, w, h, dt, t) => {
        if (!frozen) {
          const newCycle = Math.min(MAX_CYCLES, Math.floor(t / PERIOD) + 1)
          if (newCycle !== cycle) cycle = newCycle
          if (cycle >= MAX_CYCLES && (t % PERIOD) / PERIOD > 0.95) {
            frozen = true
            frozenT = t
          }
        }
        const animT = frozen ? frozenT : t
        const cx = w / 2, cy = h / 2 - 30
        const phase = (animT % PERIOD) / PERIOD
        const sep = Math.max(60, 220 - phase * 360)

        // Cuve (bécher)
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(w * 0.18, h * 0.18)
        ctx.lineTo(w * 0.18, h * 0.72)
        ctx.lineTo(w * 0.82, h * 0.72)
        ctx.lineTo(w * 0.82, h * 0.18)
        ctx.stroke()

        // Niveau de l'eau
        ctx.fillStyle = 'rgba(100, 180, 240, 0.08)'
        ctx.fillRect(w * 0.18, h * 0.35, w * 0.64, h * 0.37)

        // Ions H+ et OH- qui se rapprochent
        drawIon(ctx, cx - sep / 2, cy, 'H', '+', '#ff6b6b')
        drawIon(ctx, cx + sep / 2, cy, 'OH', '-', '#7fffaa')

        // Si proche, fusion en H2O
        if (sep <= 70) {
          const k = (70 - sep) / 60
          ctx.fillStyle = `rgba(100, 200, 255, ${k})`
          ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(255, 255, 255, ${k})`
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('H₂O', cx, cy)
        }

        // Ions spectateurs Na+, Cl- en arrière-plan
        for (let i = 0; i < 6; i++) {
          const x = w * 0.25 + (i % 3) * 40
          const y = h * 0.55 + Math.floor(i / 3) * 35
          ctx.fillStyle = 'rgba(255, 107, 107, 0.5)'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('Na⁺', x, y)
          ctx.fillStyle = 'rgba(127, 255, 170, 0.5)'
          ctx.fillText('Cl⁻', x + w * 0.45, y)
        }

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: '#ff6b6b', label: 'H⁺ (acide)' },
          { color: '#7fffaa', label: 'OH⁻ (base)' },
          { color: '#64c8ff', label: 'H₂O (produit neutre)' },
          { color: '#ff6b6b', label: 'Na⁺ (spectateur)' },
          { color: '#7fffaa', label: 'Cl⁻ (spectateur)' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Rencontre')

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('H⁺ + OH⁻  ->  H₂O   (ions Na⁺ et Cl⁻ spectateurs)', w / 2, h - 50)
        ctx.fillStyle = frozen ? '#ffcc44' : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(
          frozen
            ? 'Neutralisation complète - milieu à pH 7'
            : 'Exothermique : ΔH ≈ -57 kJ/mol (acide fort + base forte)',
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
  const g = ctx.createRadialGradient(x - 4, y - 4, 1, x, y, 24)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.4, color)
  g.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y - 2)
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText(sign, x + 14, y - 14)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'start'
}
