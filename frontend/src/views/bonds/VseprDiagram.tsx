import { useCanvas } from '../../hooks/useCanvas'

// Schéma : 4 géométries VSEPR avec rotation lente
export default function VseprDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cellW = w / 2
      const cellH = (h - 80) / 2
      const rot = t * 0.4

      drawLinear(ctx, cellW * 0.5, cellH * 0.5 + 30, rot)
      drawTrigonalPlanar(ctx, cellW * 1.5, cellH * 0.5 + 30, rot)
      drawTetrahedral(ctx, cellW * 0.5, cellH * 1.5 + 30, rot)
      drawOctahedral(ctx, cellW * 1.5, cellH * 1.5 + 30, rot)

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('VSEPR : les paires d\'électrons se repoussent et adoptent la géométrie de plus faible énergie', w / 2, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Notation AXₙEₘ : A = atome central, X = liaison, E = doublet libre', w / 2, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawCentral(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#a0a0a0'
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill()
}
function drawPeripheral(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const g = ctx.createRadialGradient(x - 2, y - 2, 0, x, y, 9)
  g.addColorStop(0, '#9be0ff')
  g.addColorStop(1, '#3aa0ff')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill()
}
function drawBondLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
}
function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string) {
  ctx.fillStyle = 'rgba(0, 212, 255, 0.9)'
  ctx.font = 'bold 12px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.fillText(text, x, y)
}

function drawLinear(ctx: CanvasRenderingContext2D, cx: number, cy: number, _rot: number) {
  const r = 48
  drawBondLine(ctx, cx - r, cy, cx + r, cy)
  drawPeripheral(ctx, cx - r, cy)
  drawCentral(ctx, cx, cy)
  drawPeripheral(ctx, cx + r, cy)
  drawLabel(ctx, cx, cy + 38, 'linéaire 180°  (AX₂ : CO₂)')
}

function drawTrigonalPlanar(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) {
  const r = 48
  for (let i = 0; i < 3; i++) {
    const a = rot + i * (2 * Math.PI / 3) - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    drawBondLine(ctx, cx, cy, x, y)
    drawPeripheral(ctx, x, y)
  }
  drawCentral(ctx, cx, cy)
  drawLabel(ctx, cx, cy + 60, 'trigonal plan 120°  (AX₃ : BF₃)')
}

function drawTetrahedral(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) {
  // 4 sommets : 2 dans le plan, 1 devant (gros), 1 derrière (petit)
  const r = 48
  const a1 = rot - Math.PI / 2
  const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r  // haut
  const x2 = cx + Math.cos(a1 + Math.PI) * r, y2 = cy + Math.sin(a1 + Math.PI) * r  // bas
  const x3 = cx - 40, y3 = cy + 5  // arrière-gauche
  const x4 = cx + 40, y4 = cy + 5  // avant-droit

  drawBondLine(ctx, cx, cy, x1, y1)
  drawBondLine(ctx, cx, cy, x2, y2)
  // Liaison vers l'arrière (pointillée)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x3, y3); ctx.stroke()
  ctx.setLineDash([])
  // Liaison vers l'avant (triangle solide simulé par une ligne épaisse)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x4, y4); ctx.stroke()
  ctx.lineWidth = 2

  drawPeripheral(ctx, x1, y1)
  drawPeripheral(ctx, x2, y2)
  drawPeripheral(ctx, x3, y3)
  drawPeripheral(ctx, x4, y4)
  drawCentral(ctx, cx, cy)
  drawLabel(ctx, cx, cy + 70, 'tétraédrique 109,5°  (AX₄ : CH₄)')
}

function drawOctahedral(ctx: CanvasRenderingContext2D, cx: number, cy: number, rot: number) {
  const r = 48
  // 4 sommets dans le plan + 1 devant + 1 derrière
  for (let i = 0; i < 4; i++) {
    const a = rot + i * (Math.PI / 2)
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    drawBondLine(ctx, cx, cy, x, y)
    drawPeripheral(ctx, x, y)
  }
  // Avant et arrière
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.setLineDash([3, 3])
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx - 18, cy - 18); ctx.stroke()
  ctx.setLineDash([])
  drawPeripheral(ctx, cx - 18, cy - 18)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 4
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 18, cy + 18); ctx.stroke()
  ctx.lineWidth = 2
  drawPeripheral(ctx, cx + 18, cy + 18)
  drawCentral(ctx, cx, cy)
  drawLabel(ctx, cx, cy + 70, 'octaédrique 90°  (AX₆ : SF₆)')
}
