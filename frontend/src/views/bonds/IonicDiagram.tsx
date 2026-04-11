import { useCanvas } from '../../hooks/useCanvas'

// Schéma : transfert d'un électron de Na vers Cl, puis attraction Na⁺ ⋯ Cl⁻
export default function IonicDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2, cy = h / 2
      const phase = (t % 6) / 6  // cycle de 6 secondes

      // Position des deux atomes : ils se rapprochent puis se stabilisent
      const sep = 220 - Math.min(80, phase * 200)
      const naX = cx - sep / 2
      const clX = cx + sep / 2

      // Phase de transfert d'électron (0.2 → 0.5)
      const transferring = phase > 0.2 && phase < 0.5
      const transferred  = phase >= 0.5

      // Atome Na (cation potentiel) - rouge alcalin
      drawAtom(ctx, naX, cy, 38, '#ff6b6b', 'Na', transferred ? '⁺' : '')
      // Atome Cl (anion potentiel) - vert halogène
      drawAtom(ctx, clX, cy, 42, '#caff1a', 'Cl', transferred ? '⁻' : '')

      // Électron 3s du Na (le seul électron de valence)
      const electronX = transferring
        ? naX + (clX - naX) * ((phase - 0.2) / 0.3)
        : transferred
          ? clX - 50
          : naX + 50
      const electronY = cy
      drawElectron(ctx, electronX, electronY)

      // Champ électrique entre les ions une fois transférés
      if (transferred) {
        drawAttraction(ctx, naX, clX, cy)
      }

      // Légendes en bas
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const label =
        phase < 0.2 ? 'Atomes neutres : Na (1 e⁻ de valence) et Cl (7 e⁻)'
        : transferring ? 'Transfert : Na perd son 3s¹, Cl complète sa couche'
        : 'Attraction électrostatique Na⁺ ⋯ Cl⁻'
      ctx.fillText(label, cx, h - 50)

      // Différence d'électronégativité
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('ΔEN(Cl - Na) = 3,16 - 0,93 = 2,23 → caractère ionique dominant', cx, h - 25)

      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawAtom(ctx: CanvasRenderingContext2D, x: number, y: number, r: number,
                  color: string, symbol: string, suffix: string) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.4, color)
  g.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = `bold ${r * 0.6}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(symbol + suffix, x, y)
}

function drawElectron(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 12)
  g.addColorStop(0, '#9be0ff')
  g.addColorStop(1, 'rgba(80, 160, 240, 0)')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill()
}

function drawAttraction(ctx: CanvasRenderingContext2D, x1: number, x2: number, y: number) {
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.55)'
  ctx.lineWidth = 1.5
  ctx.setLineDash([6, 4])
  ctx.beginPath()
  ctx.moveTo(x1 + 50, y)
  ctx.lineTo(x2 - 50, y)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(0, 212, 255, 0.8)'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('F = k·q₁q₂/r²', (x1 + x2) / 2, y - 20)
  ctx.textAlign = 'start'
}
