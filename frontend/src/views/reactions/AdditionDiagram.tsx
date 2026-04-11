import { useCanvas } from '../../hooks/useCanvas'

// Schéma : C2H4 + H2 -> C2H6. Double liaison s'ouvre pour fixer H2.
export default function AdditionDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cy = h / 2 - 30
      const phase = (t % 4) / 4

      // Réactif gauche : éthène C2H4
      const leftCx = w * 0.25
      const c1 = { x: leftCx - 25, y: cy }
      const c2 = { x: leftCx + 25, y: cy }
      drawAtom(ctx, c1.x, c1.y, 'C')
      drawAtom(ctx, c2.x, c2.y, 'C')
      // Double liaison
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(c1.x + 12, c1.y - 3); ctx.lineTo(c2.x - 12, c1.y - 3); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(c1.x + 12, c1.y + 3); ctx.lineTo(c2.x - 12, c1.y + 3); ctx.stroke()
      // 4 H
      for (const [cxh, dyh] of [[c1.x - 18, -18], [c1.x - 18, 18], [c2.x + 18, -18], [c2.x + 18, 18]] as const) {
        drawAtomSmall(ctx, cxh, cy + dyh, 'H')
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.beginPath(); ctx.moveTo(cxh < leftCx ? c1.x - 10 : c2.x + 10, cy + dyh / 2); ctx.lineTo(cxh, cy + dyh); ctx.stroke()
      }
      ctx.fillStyle = '#fff'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('C₂H₄ (éthène)', leftCx, cy + 50)

      // H2 (à incorporer)
      const h2x = w * 0.45 - (1 - phase) * 30
      const h2y = cy + 60 - phase * 40
      ctx.globalAlpha = 1 - Math.max(0, (phase - 0.5) / 0.4)
      drawAtomSmall(ctx, h2x - 6, h2y, 'H')
      drawAtomSmall(ctx, h2x + 6, h2y, 'H')
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(h2x - 4, h2y); ctx.lineTo(h2x + 4, h2y); ctx.stroke()
      ctx.globalAlpha = 1

      // Flèche centrale
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(w * 0.49, cy); ctx.lineTo(w * 0.59, cy); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(w * 0.59, cy); ctx.lineTo(w * 0.585, cy - 5)
      ctx.moveTo(w * 0.59, cy); ctx.lineTo(w * 0.585, cy + 5)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Ni / Pt', w * 0.54, cy - 14)

      // Produit : éthane C2H6 (simple liaison + 2 H supplémentaires)
      const rightCx = w * 0.78
      const c3 = { x: rightCx - 25, y: cy }
      const c4 = { x: rightCx + 25, y: cy }
      ctx.globalAlpha = Math.max(0, (phase - 0.3) / 0.5)
      drawAtom(ctx, c3.x, c3.y, 'C')
      drawAtom(ctx, c4.x, c4.y, 'C')
      ctx.strokeStyle = 'rgba(255,255,255,0.7)'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(c3.x + 12, c3.y); ctx.lineTo(c4.x - 12, c3.y); ctx.stroke()
      // 6 H (4 anciens + 2 nouveaux soulignés)
      const hPositions: [number, number, boolean][] = [
        [c3.x - 18, -18, false], [c3.x - 18, 18, false],
        [c4.x + 18, -18, false], [c4.x + 18, 18, false],
        [c3.x, -25, true], [c4.x, 25, true],
      ]
      for (const [cxh, dyh, isNew] of hPositions) {
        drawAtomSmall(ctx, cxh, cy + dyh, 'H')
        ctx.strokeStyle = isNew ? 'rgba(127, 255, 170, 0.7)' : 'rgba(255,255,255,0.3)'
        ctx.lineWidth = isNew ? 2 : 1.5
        ctx.beginPath()
        ctx.moveTo(cxh, cy + (dyh > 0 ? dyh - 8 : dyh + 8))
        ctx.lineTo((cxh < rightCx ? c3.x : c4.x), cy + dyh / 2)
        ctx.stroke()
      }
      ctx.fillStyle = '#fff'
      ctx.font = '11px sans-serif'
      ctx.fillText('C₂H₆ (éthane)', rightCx, cy + 50)
      ctx.globalAlpha = 1

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('C₂H₄ + H₂  →  C₂H₆   (hydrogénation)', w / 2, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('La double liaison s\'ouvre, deux H se fixent - économie atomique 100 %', w / 2, h - 25)
      ctx.textAlign = 'start'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawAtom(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.fillStyle = '#a0a0a0'
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
  ctx.textBaseline = 'alphabetic'
}
function drawAtomSmall(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.fillStyle = '#dfe6f5'
  ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = 'bold 9px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
  ctx.textBaseline = 'alphabetic'
}
