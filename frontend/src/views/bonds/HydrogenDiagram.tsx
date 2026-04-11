import { useCanvas } from '../../hooks/useCanvas'

// Schéma : deux molécules d'eau, liaison H pointillée entre H δ+ et O δ-
export default function HydrogenDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2, cy = h / 2

      // Molécule 1 à gauche, molécule 2 à droite légèrement déplacée
      const offset = 100 + Math.sin(t * 0.8) * 8  // léger frémissement thermique

      drawWater(ctx, cx - offset, cy, -1)  // O pointe à droite (vers la liaison H)
      drawWater(ctx, cx + offset, cy + 30, 1)  // O pointe à gauche

      // La liaison hydrogène (pointillée) entre le H de la molécule de gauche
      // et l'O de la molécule de droite
      const hX = cx - offset + 40   // H proche
      const hY = cy - 18
      const oX = cx + offset - 28
      const oY = cy + 30

      ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)'
      ctx.lineWidth = 2
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(hX, hY)
      ctx.lineTo(oX, oY)
      ctx.stroke()
      ctx.setLineDash([])

      // Charges partielles
      ctx.fillStyle = '#ff7777'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('δ⁺', hX + 5, hY - 12)
      ctx.fillStyle = '#7fffaa'
      ctx.fillText('δ⁻', oX - 5, oY - 12)
      ctx.textAlign = 'start'

      // Label central
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('liaison H', (hX + oX) / 2, (hY + oY) / 2 - 14)

      // Légende en bas
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textBaseline = 'middle'
      ctx.fillText('Pont hydrogène : H δ⁺ (sur O) attiré par doublet libre d\'un O voisin', cx, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('~21 kJ/mol par pont - réseau dense dans l\'eau liquide', cx, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

// Dessine une molécule d'eau H₂O. dir = -1 (H's à droite) ou +1 (H's à gauche)
function drawWater(ctx: CanvasRenderingContext2D, cx: number, cy: number, dir: number) {
  const angle = (104.5 / 2) * Math.PI / 180  // demi-angle de la molécule
  const bondLen = 38
  const hOffsetX = Math.sin(angle) * bondLen * dir
  const hOffsetY = Math.cos(angle) * bondLen

  // Atome O au centre
  const og = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 22)
  og.addColorStop(0, '#ffb1a1')
  og.addColorStop(0.5, '#ff3030')
  og.addColorStop(1, '#7a0e0e')
  ctx.fillStyle = og
  ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill()

  // Liaisons O-H
  const h1x = cx + hOffsetX, h1y = cy - hOffsetY
  const h2x = cx + hOffsetX * 0.6, h2y = cy + hOffsetY * 1.1
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(h1x, h1y); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(h2x, h2y); ctx.stroke()

  // Atomes H
  for (const [hx, hy] of [[h1x, h1y], [h2x, h2y]]) {
    const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 12)
    g.addColorStop(0, '#fff')
    g.addColorStop(1, '#9bb0d6')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#0a0e1a'
    ctx.font = 'bold 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('H', hx, hy)
  }
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 14px sans-serif'
  ctx.fillText('O', cx, cy)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
