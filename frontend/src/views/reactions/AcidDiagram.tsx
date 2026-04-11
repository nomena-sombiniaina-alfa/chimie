import { useCanvas } from '../../hooks/useCanvas'

// Schéma : HCl s'ionise dans l'eau, produit H3O+ et Cl-
export default function AcidDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cy = h / 2 - 30
      const phase = (t % 4) / 4
      const reactX = w * 0.22
      const arrowX = w / 2
      const productX = w * 0.78

      // Réactifs : HCl + H2O
      const opacityIn = 1 - Math.max(0, (phase - 0.4) / 0.5)
      ctx.globalAlpha = opacityIn
      drawMol(ctx, reactX, cy - 30, 'HCl', '#caff1a')
      drawMol(ctx, reactX, cy + 30, 'H₂O', '#66c8ff')
      ctx.globalAlpha = 1

      // Flèche
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(arrowX - 45, cy); ctx.lineTo(arrowX + 45, cy); ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(arrowX + 45, cy); ctx.lineTo(arrowX + 35, cy - 6)
      ctx.moveTo(arrowX + 45, cy); ctx.lineTo(arrowX + 35, cy + 6)
      ctx.stroke()

      // Produits : H3O+ et Cl-
      const opacityOut = Math.max(0, (phase - 0.3) / 0.5)
      ctx.globalAlpha = opacityOut
      drawIon(ctx, productX - 35, cy - 30, 'H₃O', '+', '#ff7777')
      drawIon(ctx, productX + 35, cy + 30, 'Cl', '-', '#7fffaa')
      ctx.globalAlpha = 1

      // H+ qui voyage de HCl vers H2O (animation centrale)
      if (phase > 0.2 && phase < 0.6) {
        const k = (phase - 0.2) / 0.4
        const hx = reactX + (productX - 35 - reactX) * k
        const hy = cy - 30 + (cy + 30 - (cy - 30)) * Math.sin(k * Math.PI) * 0.5
        ctx.fillStyle = 'rgba(255, 200, 80, 0.8)'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('H⁺', hx, hy)
        ctx.textAlign = 'start'
      }

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('HCl + H₂O  →  H₃O⁺ + Cl⁻', w / 2, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Ionisation totale d\'un acide fort (Brønsted : donneur de H⁺)', w / 2, h - 25)
      ctx.textAlign = 'start'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawMol(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string) {
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
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}

function drawIon(ctx: CanvasRenderingContext2D, x: number, y: number,
                 label: string, sign: string, color: string) {
  drawMol(ctx, x, y, label, color)
  ctx.fillStyle = sign === '+' ? '#ff7777' : '#7fffaa'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(sign, x + 14, y - 14)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
