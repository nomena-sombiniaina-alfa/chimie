import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Neutralisation acide + base.
// mode 'strong' : H+ + OH- -> H2O ; pH final = 7 (sel neutre NaCl).
// mode 'weak'   : acide faible HA + base forte OH- -> A- + H2O ;
//                 reste des A- en solution -> pH final basique (~ 9).

type Props = { mode?: 'strong' | 'weak' }

export default function AcidBaseDiagram({ mode = 'strong' }: Props) {
  const canvasRef = useCanvas(() => {
    const isStrong = mode === 'strong'
    const MAX_CYCLES = 4
    const PERIOD = 4
    let cycle = 1
    let frozen = false
    let frozenT = 0
    return {
      draw: (ctx, w, h, dt, t) => {
        if (!frozen) {
          const c = Math.min(MAX_CYCLES, Math.floor(t / PERIOD) + 1)
          if (c !== cycle) cycle = c
          if (cycle >= MAX_CYCLES && (t % PERIOD) / PERIOD > 0.95) {
            frozen = true
            frozenT = t
          }
        }
        const animT = frozen ? frozenT : t
        const cx = w / 2, cy = h / 2 - 30
        const phase = (animT % PERIOD) / PERIOD
        const sep = Math.max(60, 220 - phase * 360)

        // Cuve
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(w * 0.18, h * 0.18)
        ctx.lineTo(w * 0.18, h * 0.72)
        ctx.lineTo(w * 0.82, h * 0.72)
        ctx.lineTo(w * 0.82, h * 0.18)
        ctx.stroke()

        // Niveau de l'eau, teinté selon le pH final si frozen
        let waterTint = 'rgba(100, 180, 240, 0.08)'
        if (frozen) {
          waterTint = isStrong ? 'rgba(180, 240, 200, 0.12)' : 'rgba(150, 130, 220, 0.18)'
        }
        ctx.fillStyle = waterTint
        ctx.fillRect(w * 0.18, h * 0.35, w * 0.64, h * 0.37)

        // Ions H+ et OH- qui se rapprochent (ou acide faible HA + OH-)
        if (isStrong) {
          drawIon(ctx, cx - sep / 2, cy, 'H', '+', '#ff6b6b')
          drawIon(ctx, cx + sep / 2, cy, 'OH', '-', '#7fffaa')
        } else {
          drawIon(ctx, cx - sep / 2, cy, 'HA', '', '#ffb066')
          drawIon(ctx, cx + sep / 2, cy, 'OH', '-', '#7fffaa')
        }

        // Fusion : H2O au centre (+ A- éjecté si faible)
        if (sep <= 70) {
          const k = (70 - sep) / 60
          ctx.fillStyle = `rgba(100, 200, 255, ${k})`
          ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(255, 255, 255, ${k})`
          ctx.font = 'bold 14px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('H₂O', cx, cy)
          if (!isStrong) {
            // A- libéré, dérive vers le bas
            const ax = cx + 50 + k * 30
            const ay = cy + 20 + k * 15
            ctx.globalAlpha = k
            drawIon(ctx, ax, ay, 'A', '-', '#7fffaa')
            ctx.globalAlpha = 1
          }
        }

        // Ions spectateurs / produits accumulés au fond
        if (isStrong) {
          for (let i = 0; i < 6; i++) {
            const x = w * 0.25 + (i % 3) * 40
            const y = h * 0.55 + Math.floor(i / 3) * 35
            ctx.fillStyle = 'rgba(255, 107, 107, 0.5)'
            ctx.font = 'bold 11px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('Na⁺', x, y)
            ctx.fillStyle = 'rgba(127, 255, 170, 0.5)'
            ctx.fillText('Cl⁻', x + w * 0.45, y)
          }
        } else {
          // Acide faible : A- accumulés (couleur conjuguée basique) + qq HA résiduels en bas
          const ions = Math.min(cycle, MAX_CYCLES)
          for (let i = 0; i < ions; i++) {
            const x = w * 0.22 + (i % 4) * 35
            const y = h * 0.62 + Math.floor(i / 4) * 20
            ctx.fillStyle = 'rgba(127, 255, 170, 0.6)'
            ctx.font = 'bold 11px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('A⁻', x, y)
            ctx.fillStyle = 'rgba(255, 138, 138, 0.55)'
            ctx.fillText('Na⁺', x + w * 0.45, y)
          }
          // 1 HA résiduel (équilibre faible n'est jamais total)
          if (frozen) {
            ctx.fillStyle = 'rgba(255, 176, 102, 0.7)'
            ctx.font = 'bold 12px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('HA', w * 0.30, h * 0.30)
            ctx.fillText('HA', w * 0.65, h * 0.28)
          }
        }

        // Indicateur de pH à droite (bandes type universal indicator)
        const pH = frozen ? (isStrong ? 7.0 : 8.7) : (isStrong ? 7 - phase * 0 : 8 - phase * 0)
        drawPHGauge(ctx, w - 36, h * 0.18, 16, h * 0.50, pH)

        // Légende + cycle
        if (isStrong) {
          drawLegend(ctx, 10, 10, [
            { color: '#ff6b6b', label: 'H⁺ (acide fort)' },
            { color: '#7fffaa', label: 'OH⁻ (base forte)' },
            { color: '#64c8ff', label: 'H₂O (produit neutre)' },
            { color: '#ff6b6b', label: 'Na⁺ (spectateur)' },
            { color: '#7fffaa', label: 'Cl⁻ (spectateur)' },
          ])
        } else {
          drawLegend(ctx, 10, 10, [
            { color: '#ffb066', label: 'HA (acide faible, intact)' },
            { color: '#7fffaa', label: 'OH⁻ (base forte)' },
            { color: '#64c8ff', label: 'H₂O (produit neutre)' },
            { color: '#7fffaa', label: 'A⁻ (base conjuguée)' },
            { color: '#ff8a8a', label: 'Na⁺ (cation spectateur)' },
          ])
        }
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Rencontre')

        // Équation + verdict final
        const equationStr = isStrong
          ? 'H⁺ + OH⁻  ->  H₂O   (sel neutre Na⁺ Cl⁻)'
          : 'HA + OH⁻  ->  A⁻ + H₂O   (équilibre, A⁻ basique)'
        const verdictDone = isStrong
          ? 'Neutralisation totale - pH = 7 (sel neutre)'
          : 'Sel basique : A⁻ ré-arrache H⁺ à l\'eau - pH > 7 (~ 8,7)'
        const verdictRun = isStrong
          ? 'Exothermique : ΔH ≈ -57 kJ/mol (acide fort + base forte)'
          : 'Acide faible + base forte : la base conjuguée A⁻ reste basique en solution'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(equationStr, w / 2, h - 50)
        ctx.fillStyle = frozen ? (isStrong ? '#7fffaa' : '#c8a8ff') : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(frozen ? verdictDone : verdictRun, w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [mode])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawIon(ctx: CanvasRenderingContext2D, x: number, y: number,
                 label: string, sign: string, color: string) {
  const g = ctx.createRadialGradient(x - 4, y - 4, 1, x, y, 24)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.4, color)
  g.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y - 2)
  if (sign) {
    ctx.font = 'bold 14px sans-serif'
    ctx.fillStyle = sign === '+' ? '#ff7777' : '#7fffaa'
    ctx.fillText(sign, x + 14, y - 14)
  }
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'start'
}

function drawPHGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pH: number) {
  // Bande verticale : pH 0 (haut) -> 14 (bas)
  const stops: [number, string][] = [
    [0,  '#d62828'],   // rouge
    [3,  '#f77f00'],   // orange
    [6,  '#fcbf49'],   // jaune
    [7,  '#90be6d'],   // vert
    [8,  '#43aa8b'],   // turquoise
    [11, '#577590'],   // bleu
    [14, '#3a0ca3'],   // violet
  ]
  const grad = ctx.createLinearGradient(0, y, 0, y + h)
  for (const [p, c] of stops) grad.addColorStop(p / 14, c)
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)
  // Curseur
  const pY = y + (pH / 14) * h
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#0a0e1a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 6, pY)
  ctx.lineTo(x, pY - 5)
  ctx.lineTo(x, pY + 5)
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(`pH ${pH.toFixed(1)}`, x - 10, pY)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '9px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('0', x + w / 2, y - 12)
  ctx.textBaseline = 'bottom'
  ctx.fillText('14', x + w / 2, y + h + 12)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
