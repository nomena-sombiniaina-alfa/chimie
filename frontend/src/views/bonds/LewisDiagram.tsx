import { useCanvas } from '../../hooks/useCanvas'

// Schéma : 4 structures de Lewis classiques (H₂O, NH₃, CO₂, CH₄)
export default function LewisDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h) => {
      const cellW = w / 2
      const cellH = (h - 80) / 2

      // 4 cellules : H₂O, NH₃, CO₂, CH₄
      drawH2O(ctx, cellW * 0.5, cellH * 0.5 + 30)
      drawNH3(ctx, cellW * 1.5, cellH * 0.5 + 30)
      drawCO2(ctx, cellW * 0.5, cellH * 1.5 + 30)
      drawCH4(ctx, cellW * 1.5, cellH * 1.5 + 30)

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('Structures de Lewis : doublets liants (-) et doublets libres (:)', w / 2, h - 50)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('Règle de l\'octet : chaque atome cherche 8 e⁻ de valence (2 pour H)', w / 2, h - 25)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawAtomLabel(ctx: CanvasRenderingContext2D, x: number, y: number, s: string, color = '#fff') {
  ctx.fillStyle = color
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(s, x, y)
}

function drawBond(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, multi = 1) {
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 2
  if (multi === 1) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
  } else {
    // double ou triple : plusieurs lignes parallèles
    const dx = x2 - x1, dy = y2 - y1
    const len = Math.hypot(dx, dy)
    const ox = -dy / len * 3, oy = dx / len * 3
    for (let i = 0; i < multi; i++) {
      const k = i - (multi - 1) / 2
      ctx.beginPath()
      ctx.moveTo(x1 + k * ox * 2, y1 + k * oy * 2)
      ctx.lineTo(x2 + k * ox * 2, y2 + k * oy * 2)
      ctx.stroke()
    }
  }
}

function drawLonePair(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = '#9be0ff'
  ctx.beginPath(); ctx.arc(x - 3, y, 2.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.arc(x + 3, y, 2.5, 0, Math.PI * 2); ctx.fill()
}

function drawFormula(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
  ctx.fillStyle = 'rgba(0, 212, 255, 0.9)'
  ctx.font = 'bold 13px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
}

function drawH2O(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawAtomLabel(ctx, cx, cy, 'O')
  drawAtomLabel(ctx, cx - 50, cy + 30, 'H')
  drawAtomLabel(ctx, cx + 50, cy + 30, 'H')
  drawBond(ctx, cx - 14, cy + 8, cx - 38, cy + 20)
  drawBond(ctx, cx + 14, cy + 8, cx + 38, cy + 20)
  drawLonePair(ctx, cx, cy - 18)
  drawLonePair(ctx, cx - 18, cy - 8)
  drawFormula(ctx, cx, cy + 60, 'H₂O')
}

function drawNH3(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawAtomLabel(ctx, cx, cy, 'N', '#5070f8')
  drawAtomLabel(ctx, cx - 40, cy + 30, 'H')
  drawAtomLabel(ctx, cx + 40, cy + 30, 'H')
  drawAtomLabel(ctx, cx, cy + 40, 'H')
  drawBond(ctx, cx - 12, cy + 8, cx - 28, cy + 20)
  drawBond(ctx, cx + 12, cy + 8, cx + 28, cy + 20)
  drawBond(ctx, cx, cy + 14, cx, cy + 30)
  drawLonePair(ctx, cx, cy - 18)
  drawFormula(ctx, cx, cy + 60, 'NH₃')
}

function drawCO2(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawAtomLabel(ctx, cx, cy, 'C')
  drawAtomLabel(ctx, cx - 55, cy, 'O')
  drawAtomLabel(ctx, cx + 55, cy, 'O')
  drawBond(ctx, cx - 14, cy, cx - 41, cy, 2)
  drawBond(ctx, cx + 14, cy, cx + 41, cy, 2)
  drawLonePair(ctx, cx - 55, cy - 22)
  drawLonePair(ctx, cx - 55, cy + 22)
  drawLonePair(ctx, cx + 55, cy - 22)
  drawLonePair(ctx, cx + 55, cy + 22)
  drawFormula(ctx, cx, cy + 50, 'CO₂   (O=C=O)')
}

function drawCH4(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  drawAtomLabel(ctx, cx, cy, 'C')
  drawAtomLabel(ctx, cx - 40, cy + 30, 'H')
  drawAtomLabel(ctx, cx + 40, cy + 30, 'H')
  drawAtomLabel(ctx, cx - 40, cy - 30, 'H')
  drawAtomLabel(ctx, cx + 40, cy - 30, 'H')
  drawBond(ctx, cx - 12, cy + 8, cx - 28, cy + 20)
  drawBond(ctx, cx + 12, cy + 8, cx + 28, cy + 20)
  drawBond(ctx, cx - 12, cy - 8, cx - 28, cy - 20)
  drawBond(ctx, cx + 12, cy - 8, cx + 28, cy - 20)
  drawFormula(ctx, cx, cy + 60, 'CH₄')
}
