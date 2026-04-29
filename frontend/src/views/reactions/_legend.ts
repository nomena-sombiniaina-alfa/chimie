// Helper partagé : dessine un panneau de légende et un compteur de cycle
// dans le coin d'un canvas de réaction chimique.

export type LegendShape = 'circle' | 'square' | 'block' | 'bubble' | 'flame'

export interface LegendItem {
  color: string
  label: string
  shape?: LegendShape
}

/**
 * Dessine un panneau de légende semi-transparent.
 * Positionné en (x, y) (coin haut-gauche du panneau).
 */
export function drawLegend(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  items: LegendItem[],
  title = 'Légende',
) {
  const pad = 12
  const swatch = 16
  const lineH = 24
  const titleH = 18
  const titleFontPx = 14
  const itemFontPx = 15

  ctx.font = `${itemFontPx}px sans-serif`
  let maxW = 0
  for (const it of items) {
    const w = ctx.measureText(it.label).width
    if (w > maxW) maxW = w
  }
  ctx.font = `bold ${titleFontPx}px sans-serif`
  const titleW = ctx.measureText(title.toUpperCase()).width
  const innerW = Math.max(maxW + swatch + 10, titleW)
  const boxW = pad * 2 + innerW
  const boxH = pad * 2 + titleH + items.length * lineH

  // Fond
  ctx.fillStyle = 'rgba(10, 14, 26, 0.82)'
  ctx.fillRect(x, y, boxW, boxH)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, boxW, boxH)

  // Titre
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'
  ctx.font = `bold ${titleFontPx}px sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText(title.toUpperCase(), x + pad, y + pad)

  // Items
  ctx.font = `${itemFontPx}px sans-serif`
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const cy = y + pad + titleH + 4 + i * lineH + swatch / 2
    const cx = x + pad + swatch / 2
    drawSwatch(ctx, cx, cy, swatch, it.color, it.shape || 'circle')
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(it.label, x + pad + swatch + 10, cy)
  }
}

function drawSwatch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string,
  shape: LegendShape,
) {
  const r = size / 2
  switch (shape) {
    case 'square':
      ctx.fillStyle = color
      ctx.fillRect(cx - r, cy - r, size, size)
      break
    case 'block': {
      const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r)
      g.addColorStop(0, '#ffffff')
      g.addColorStop(1, color)
      ctx.fillStyle = g
      ctx.fillRect(cx - r, cy - r, size, size)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.lineWidth = 0.6
      ctx.strokeRect(cx - r, cy - r, size, size)
      break
    }
    case 'bubble':
      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.lineWidth = 0.8
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
      break
    case 'flame': {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      g.addColorStop(0, '#fff0a0')
      g.addColorStop(0.5, color)
      g.addColorStop(1, 'rgba(180, 30, 0, 0)')
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      break
    }
    case 'circle':
    default: {
      const g = ctx.createRadialGradient(cx - 1, cy - 1, 0, cx, cy, r)
      g.addColorStop(0, '#ffffff')
      g.addColorStop(0.5, color)
      g.addColorStop(1, color)
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
    }
  }
}

/**
 * Petit indicateur de progression de cycle, en bas-droite du canvas.
 * Affiche "Cycle : X / Y" ou "Cycle X" si max non fourni.
 */
export function drawCycleCounter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  current: number,
  max?: number,
  label = 'Cycle',
) {
  const txt = max ? `${label} : ${current} / ${max}` : `${label} : ${current}`
  ctx.font = 'bold 14px sans-serif'
  const tw = ctx.measureText(txt).width
  const padX = 12
  const boxW = tw + padX * 2
  const boxH = 28
  ctx.fillStyle = 'rgba(10, 14, 26, 0.78)'
  ctx.fillRect(x - boxW, y - boxH, boxW, boxH)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.lineWidth = 1
  ctx.strokeRect(x - boxW, y - boxH, boxW, boxH)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText(txt, x - boxW + padX, y - boxH / 2)
}
