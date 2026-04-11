import { useCanvas } from '../../hooks/useCanvas'

// Schéma : éthanol -> éthylène + eau (déshydratation)
export default function EliminationDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cy = h / 2 - 30
      const phase = (t % 4) / 4

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

      // -OH qui se détache (animation)
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

      // H+ qui part aussi (depuis le C voisin)
      const hX = leftCx + 30 + phase * 90
      const hY = cy + phase * 60
      ctx.globalAlpha = phase
      ctx.fillStyle = 'rgba(255, 180, 80, 0.85)'
      ctx.fillText('H', hX, hY)
      ctx.globalAlpha = 1

      // Flèche centrale + catalyseur H+ / chauffage
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

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('C₂H₅OH  →  CH₂=CH₂ + H₂O   (déshydratation)', w / 2, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Une H et un OH voisins partent ensemble, formant une double liaison (inverse de l\'addition)', w / 2, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
