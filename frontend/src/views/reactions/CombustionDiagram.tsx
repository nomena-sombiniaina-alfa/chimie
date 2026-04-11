import { useCanvas } from '../../hooks/useCanvas'

// Schéma : CH4 + 2 O2 -> CO2 + 2 H2O + flammes
export default function CombustionDiagram() {
  const canvasRef = useCanvas(() => {
    type Flame = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number }
    let flames: Flame[] = []

    return {
      draw: (ctx, w, h, dt, t) => {
        const cy = h / 2 - 20
        const phase = (t % 4) / 4
        const arrowX = w * 0.5
        const reactX = w * 0.22
        const productX = w * 0.78

        // Reactifs (gauche) - CH4 + 2 O2
        drawMolecule(ctx, reactX, cy - 50, 'CH₄', '#2a2f3a')
        drawMolecule(ctx, reactX - 40, cy + 50, 'O₂', '#ff6677')
        drawMolecule(ctx, reactX + 40, cy + 50, 'O₂', '#ff6677')

        // Fleche centrale avec étincelle pendant phase 0..0.3
        const sparking = phase < 0.3
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(arrowX - 60, cy); ctx.lineTo(arrowX + 60, cy); ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(arrowX + 60, cy); ctx.lineTo(arrowX + 50, cy - 6)
        ctx.moveTo(arrowX + 60, cy); ctx.lineTo(arrowX + 50, cy + 6)
        ctx.stroke()

        if (sparking) {
          ctx.fillStyle = `rgba(255, 230, 80, ${0.4 + 0.5 * Math.sin(t * 20)})`
          ctx.font = 'bold 22px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('⚡', arrowX, cy - 16)
          ctx.textAlign = 'start'
        }
        ctx.fillStyle = 'rgba(255, 230, 80, 0.7)'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Δ', arrowX, cy + 22)
        ctx.textAlign = 'start'

        // Produits (droite) - CO2 + 2 H2O
        const productsOpacity = Math.min(1, phase * 3)
        ctx.globalAlpha = productsOpacity
        drawMolecule(ctx, productX, cy - 50, 'CO₂', '#ff7788')
        drawMolecule(ctx, productX - 40, cy + 50, 'H₂O', '#66c8ff')
        drawMolecule(ctx, productX + 40, cy + 50, 'H₂O', '#66c8ff')
        ctx.globalAlpha = 1

        // Flammes
        if (phase > 0.15 && phase < 0.85) {
          if (Math.random() < 0.7) {
            flames.push({
              x: arrowX + (Math.random() - 0.5) * 60,
              y: cy + 30 + Math.random() * 10,
              vx: (Math.random() - 0.5) * 40,
              vy: -50 - Math.random() * 60,
              age: 0,
              life: 0.6 + Math.random() * 0.5,
              r: 4 + Math.random() * 6,
            })
          }
        }
        ctx.globalCompositeOperation = 'lighter'
        const alive: Flame[] = []
        for (const f of flames) {
          f.age += dt
          if (f.age > f.life) continue
          f.x += f.vx * dt
          f.y += f.vy * dt
          f.vy -= 90 * dt
          const k = 1 - f.age / f.life
          const r = f.r * (0.6 + (1 - k) * 1.2)
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r)
          g.addColorStop(0, `rgba(255, 230, 120, ${0.9 * k})`)
          g.addColorStop(0.5, `rgba(255, 130, 40, ${0.5 * k})`)
          g.addColorStop(1, 'rgba(180, 30, 0, 0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, Math.PI * 2); ctx.fill()
          alive.push(f)
        }
        flames = alive
        ctx.globalCompositeOperation = 'source-over'

        // Énergie dégagée label
        ctx.fillStyle = 'rgba(255, 180, 80, 0.9)'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('+ énergie (chaleur, lumière)', arrowX, cy + 80)

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText('CH₄ + 2 O₂  →  CO₂ + 2 H₂O', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText('Exothermique : ΔH = -890 kJ/mol', w / 2, h - 25)
        ctx.textAlign = 'start'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawMolecule(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string) {
  const g = ctx.createRadialGradient(x - 6, y - 6, 1, x, y, 22)
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
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'start'
}
