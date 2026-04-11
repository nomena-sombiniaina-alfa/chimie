import { useCanvas } from '../../hooks/useCanvas'

// Schéma : glucose + O2 entrent dans la mitochondrie, sortent CO2 + H2O + ATP
export default function RespirationDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2, cy = h / 2 - 20
      const mitoW = 280, mitoH = 130

      // Mitochondrie (ellipse plus stylisée)
      const gMito = ctx.createRadialGradient(cx, cy, 20, cx, cy, 160)
      gMito.addColorStop(0, 'rgba(200, 80, 130, 0.25)')
      gMito.addColorStop(0.8, 'rgba(140, 50, 90, 0.18)')
      gMito.addColorStop(1, 'rgba(140, 50, 90, 0.05)')
      ctx.fillStyle = gMito
      ctx.beginPath(); ctx.ellipse(cx, cy, mitoW / 2, mitoH / 2, 0, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(220, 120, 160, 0.7)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.ellipse(cx, cy, mitoW / 2, mitoH / 2, 0, 0, Math.PI * 2); ctx.stroke()
      // Crêtes mitochondriales
      ctx.strokeStyle = 'rgba(220, 120, 160, 0.4)'
      ctx.lineWidth = 1
      for (let i = 0; i < 4; i++) {
        const ya = cy - 25 + i * 18
        ctx.beginPath()
        ctx.ellipse(cx, ya, mitoW * 0.36, 6, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'italic 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('mitochondrie', cx, cy + mitoH / 2 + 16)

      // Entrées (gauche)
      const inX = cx - mitoW / 2 - 60
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 13px sans-serif'
      ctx.textBaseline = 'middle'
      drawMolBubble(ctx, inX, cy - 30, '#ffd066', 'C₆H₁₂O₆')
      drawMolBubble(ctx, inX, cy + 30, '#ff7788', 'O₂')

      // Flèches entrantes
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(inX + 30, cy - 30); ctx.lineTo(cx - mitoW / 2 + 8, cy - 30); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(inX + 30, cy + 30); ctx.lineTo(cx - mitoW / 2 + 8, cy + 30); ctx.stroke()

      // Sorties (droite)
      const outX = cx + mitoW / 2 + 60
      drawMolBubble(ctx, outX, cy - 30, '#88c8ff', 'H₂O')
      drawMolBubble(ctx, outX, cy + 30, '#ff8866', 'CO₂')

      ctx.beginPath(); ctx.moveTo(cx + mitoW / 2 - 8, cy - 30); ctx.lineTo(outX - 30, cy - 30); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + mitoW / 2 - 8, cy + 30); ctx.lineTo(outX - 30, cy + 30); ctx.stroke()

      // ATP qui sort (en haut, pulsation)
      const atpPhase = (t % 2) / 2
      const atpY = cy - mitoH / 2 - 10 - atpPhase * 20
      const atpAlpha = 1 - atpPhase
      ctx.fillStyle = `rgba(255, 220, 80, ${atpAlpha})`
      ctx.beginPath(); ctx.arc(cx, atpY, 12, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = `rgba(0, 0, 0, ${atpAlpha})`
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText('ATP', cx, atpY)

      ctx.fillStyle = 'rgba(255, 220, 80, 0.6)'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText('~ 38 ATP par glucose', cx, cy - mitoH / 2 - 36)

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText('C₆H₁₂O₆ + 6 O₂  →  6 CO₂ + 6 H₂O + énergie', cx, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Même bilan que la combustion, mais ~30 étapes enzymatiques contrôlées', cx, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawMolBubble(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string, label: string) {
  const g = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, 22)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.5, color)
  g.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, cx, cy)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
