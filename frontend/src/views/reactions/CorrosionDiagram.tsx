import { useCanvas } from '../../hooks/useCanvas'

// Schéma : plaque de fer qui rouille progressivement au contact de O2 + H2O
export default function CorrosionDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2, cy = h / 2 - 20
      const phase = (t % 8) / 8  // cycle long pour voir la progression

      // Plaque de fer
      const plateY = cy - 40, plateH = 60, plateW = 280
      ctx.fillStyle = '#7a8089'
      ctx.fillRect(cx - plateW / 2, plateY, plateW, plateH)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Fe (plaque)', cx, plateY - 12)

      // Couche de rouille qui s'épaissit avec le temps
      const rustThickness = Math.min(20, phase * 25)
      const grd = ctx.createLinearGradient(0, plateY - rustThickness, 0, plateY)
      grd.addColorStop(0, 'rgba(200, 80, 30, 0)')
      grd.addColorStop(1, '#a04a20')
      ctx.fillStyle = grd
      ctx.fillRect(cx - plateW / 2, plateY - rustThickness, plateW, rustThickness)
      // Texture (taches plus claires)
      ctx.fillStyle = '#c8662f'
      for (let i = 0; i < 8; i++) {
        const x = cx - plateW / 2 + (i + 0.5) * plateW / 8 + Math.sin(t + i) * 4
        const sz = 2 + (phase * 6)
        ctx.beginPath(); ctx.arc(x, plateY - rustThickness / 2, sz, 0, Math.PI * 2); ctx.fill()
      }

      // O2 et H2O dans l'air au-dessus
      ctx.fillStyle = 'rgba(255, 107, 119, 0.7)'
      ctx.font = 'bold 12px sans-serif'
      ctx.fillText('O₂', cx - 70, plateY - 60)
      ctx.fillStyle = 'rgba(102, 200, 255, 0.7)'
      ctx.fillText('H₂O (vapeur)', cx + 50, plateY - 60)

      // Flèches descendantes
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.setLineDash([3, 3])
      for (let i = -2; i <= 2; i++) {
        const x = cx + i * 40
        const y = plateY - 50
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, plateY - 8); ctx.stroke()
      }
      ctx.setLineDash([])

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('4 Fe + 3 O₂ + x H₂O  →  2 Fe₂O₃·x H₂O   (rouille)', w / 2, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Oxydation lente : volume 6× initial, poreuse, n\'isole pas le métal sous-jacent', w / 2, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
