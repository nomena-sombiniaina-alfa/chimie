import { useCanvas } from '../../hooks/useCanvas'

// Schéma : diagramme d'énergie des orbitales moléculaires pour H₂
export default function MoDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h) => {
      const cx = w / 2
      const topY = 80
      const botY = h - 100

      // Niveaux 1s des deux atomes H (gauche et droite)
      const atomLevelY = (topY + botY) / 2
      const leftX = cx - 220
      const rightX = cx + 220

      // OM σ (liante, plus basse) et σ* (antiliante, plus haute)
      const sigmaY = atomLevelY + 80
      const sigmaStarY = atomLevelY - 80
      const moX = cx
      const lineLen = 100

      // Pointillés relient les OA aux OM
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(leftX + 30, atomLevelY); ctx.lineTo(moX - lineLen / 2, sigmaY)
      ctx.moveTo(leftX + 30, atomLevelY); ctx.lineTo(moX - lineLen / 2, sigmaStarY)
      ctx.moveTo(rightX - 30, atomLevelY); ctx.lineTo(moX + lineLen / 2, sigmaY)
      ctx.moveTo(rightX - 30, atomLevelY); ctx.lineTo(moX + lineLen / 2, sigmaStarY)
      ctx.stroke()
      ctx.setLineDash([])

      // Niveaux 1s
      drawLevel(ctx, leftX - 30, leftX + 30, atomLevelY, '1s', '#9be0ff')
      drawLevel(ctx, rightX - 30, rightX + 30, atomLevelY, '1s', '#9be0ff')

      // OM σ et σ*
      drawLevel(ctx, moX - lineLen / 2, moX + lineLen / 2, sigmaY, 'σ (liante)', '#7fffaa')
      drawLevel(ctx, moX - lineLen / 2, moX + lineLen / 2, sigmaStarY, 'σ* (antiliante)', '#ff7777')

      // Électrons : 1 sur chaque H, 2 dans σ (H₂)
      drawElectron(ctx, leftX - 8, atomLevelY, '↑')
      drawElectron(ctx, rightX + 8, atomLevelY, '↓')
      drawElectron(ctx, moX - 12, sigmaY, '↑')
      drawElectron(ctx, moX + 12, sigmaY, '↓')

      // Axes énergie
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(40, topY - 10)
      ctx.lineTo(40, botY + 10)
      ctx.stroke()
      ctx.fillStyle = 'rgba(255,255,255,0.6)'
      ctx.font = 'italic 12px sans-serif'
      ctx.fillText('E', 26, topY - 6)

      // Labels
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('H', leftX, atomLevelY - 32)
      ctx.fillText('H', rightX, atomLevelY - 32)
      ctx.fillText('H₂', moX, topY + 10)

      // Légende
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Diagramme d\'orbitales moléculaires : H + H → H₂', cx, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Ordre de liaison = (n_σ - n_σ*) / 2 = (2 - 0) / 2 = 1', cx, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawLevel(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number,
                   label: string, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke()
  ctx.fillStyle = color
  ctx.font = 'bold 12px ui-monospace, monospace'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x2 + 8, y)
  ctx.textAlign = 'start'
}

function drawElectron(ctx: CanvasRenderingContext2D, x: number, y: number, spin: string) {
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(spin, x, y - 12)
  ctx.beginPath(); ctx.arc(x, y - 4, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.textAlign = 'start'
}
