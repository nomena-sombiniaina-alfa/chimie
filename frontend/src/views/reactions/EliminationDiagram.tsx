import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : éthanol -> éthylène + eau (déshydratation).
// Compte les molécules déshydratées; figé à MAX_CYCLES.
export default function EliminationDiagram() {
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

        // Réactif : éthanol C2H5OH
        const leftCx = w * 0.25
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('C₂H₅-OH', leftCx, cy)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText('éthanol', leftCx, cy + 22)

        // -OH qui se détache
        const ohX = leftCx + 30 + phase * 100
        const ohY = cy - phase * 60
        ctx.globalAlpha = Math.max(0, 1 - phase)
        ctx.fillStyle = 'rgba(127, 200, 255, 0.85)'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText('-OH', leftCx + 26, cy - 4)
        ctx.globalAlpha = phase
        ctx.fillStyle = 'rgba(127, 200, 255, 0.85)'
        ctx.fillText('-OH', ohX, ohY)
        ctx.globalAlpha = 1

        // H+ qui part aussi
        const hX = leftCx + 30 + phase * 90
        const hY = cy + phase * 60
        ctx.globalAlpha = phase
        ctx.fillStyle = 'rgba(255, 180, 80, 0.85)'
        ctx.fillText('H', hX, hY)
        ctx.globalAlpha = 1

        // Flèche centrale + catalyseur
        const arrowX = w * 0.5
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(arrowX - 45, cy); ctx.lineTo(arrowX + 45, cy); ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(arrowX + 45, cy); ctx.lineTo(arrowX + 35, cy - 5)
        ctx.moveTo(arrowX + 45, cy); ctx.lineTo(arrowX + 35, cy + 5)
        ctx.stroke()
        ctx.fillStyle = 'rgba(255, 230, 80, 0.85)'
        ctx.font = 'bold 11px sans-serif'
        ctx.fillText('H₂SO₄, Δ', arrowX, cy - 14)

        // Produit : C2H4 + H2O
        const rightCx = w * 0.78
        ctx.globalAlpha = Math.max(0, (phase - 0.3) / 0.5)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 14px sans-serif'
        ctx.fillText('CH₂=CH₂', rightCx, cy - 20)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText('éthène', rightCx, cy + 2)

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 14px sans-serif'
        ctx.fillText('+   H₂O', rightCx + 5, cy + 30)
        ctx.globalAlpha = 1

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: '#ffffff', label: 'Squelette C-C (carbone)' },
          { color: '#7fc8ff', label: 'Groupe -OH éliminé' },
          { color: '#ffb450', label: 'H voisin éliminé' },
          { color: '#ffe650', label: 'H₂SO₄ + chaleur (catalyseur)' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Élimination')

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('C₂H₅OH  ->  CH₂=CH₂ + H₂O   (déshydratation)', w / 2, h - 50)
        ctx.fillStyle = frozen ? '#ffcc44' : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(
          frozen
            ? `Réacteur vidé (${MAX_CYCLES} molécules déshydratées)`
            : 'Une H et un OH voisins partent ensemble, formant une double liaison (inverse de l\'addition)',
          w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
