import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : ionisation d'une base dans l'eau.
// mode 'strong' : NaOH(s) -> Na+ + OH- (dissociation totale).
// mode 'weak'   : NH3 + H2O ⇌ NH4+ + OH- (équilibre, peu d'OH-).

type Props = { mode?: 'strong' | 'weak' }

export default function BaseDiagram({ mode = 'strong' }: Props) {
  const canvasRef = useCanvas(() => {
    const isStrong = mode === 'strong'
    const N_MOL = isStrong ? 4 : 5
    const N_DISSOC = isStrong ? 4 : 1
    const PERIOD = 4
    const MAX_CYCLES = N_MOL
    const baseLabel = isStrong ? 'NaOH(s)' : 'NH₃'
    const cationLabel = isStrong ? 'Na' : 'NH₄'
    const baseColor = isStrong ? '#dde2eb' : '#b8e090'
    const ratioLabel = isStrong ? '100 %' : `${Math.round((N_DISSOC / N_MOL) * 100)} %`
    const equationStr = isStrong
      ? 'NaOH(s)  ->  Na⁺(aq) + OH⁻(aq)'
      : 'NH₃ + H₂O  ⇌  NH₄⁺ + OH⁻'
    const subtitleDone = isStrong
      ? `Base forte : solution riche en OH⁻ (${MAX_CYCLES} pastilles dissoutes)`
      : `Base faible : équilibre - peu d'OH⁻ (${N_MOL - N_DISSOC} NH₃ intacts)`
    const subtitleRunning = isStrong
      ? 'Base forte d\'Arrhenius : libère OH⁻ totalement en solution'
      : 'Base faible (Brønsted) : NH₃ arrache un H⁺ à H₂O - équilibre, Kb ≈ 1,8·10⁻⁵'

    let cycle = 1
    let frozen = false
    let frozenT = 0

    return {
      draw: (ctx, w, h, _dt, t) => {
        if (!frozen) {
          const c = Math.min(MAX_CYCLES, Math.floor(t / PERIOD) + 1)
          if (c !== cycle) cycle = c
          if (cycle >= MAX_CYCLES && (t % PERIOD) / PERIOD > 0.95) {
            frozen = true
            frozenT = t
          }
        }
        const animT = frozen ? frozenT : t
        const currentCycle = frozen ? MAX_CYCLES : Math.min(MAX_CYCLES, Math.floor(animT / PERIOD) + 1)
        const phase = (animT % PERIOD) / PERIOD

        const colTop = h * 0.18
        const colBot = h * 0.62
        const reactX = w * 0.22
        const arrowX = w / 2
        const productX = w * 0.78

        // Colonne de bases à gauche (pastilles ou NH3)
        const slotH = (colBot - colTop) / Math.max(1, N_MOL - 1)
        for (let i = 0; i < N_MOL; i++) {
          const y = colTop + i * slotH
          let opacity = 1
          if (i === currentCycle - 1 && i < N_DISSOC) {
            opacity = Math.max(0.15, 1 - phase)
          } else if (i < currentCycle - 1 && i < N_DISSOC) {
            opacity = 0
          }
          ctx.globalAlpha = opacity
          if (isStrong) {
            // Pastille NaOH cubique
            ctx.fillStyle = baseColor
            ctx.fillRect(reactX - 20, y - 20, 40, 40)
            ctx.strokeStyle = '#fff'
            ctx.lineWidth = 1
            ctx.strokeRect(reactX - 20, y - 20, 40, 40)
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 11px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(baseLabel, reactX, y)
          } else {
            drawMol(ctx, reactX, y, baseLabel, baseColor)
          }
          ctx.globalAlpha = 1
        }

        // Eau (au centre)
        for (let i = 0; i < 3; i++) {
          const y = colTop + 10 + i * (slotH * 0.8)
          drawMol(ctx, w * 0.36, y, 'H₂O', '#66c8ff', 16)
        }

        // Flèche centrale
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(arrowX - 50, h * 0.40); ctx.lineTo(arrowX + 50, h * 0.40); ctx.stroke()
        if (isStrong) {
          ctx.beginPath()
          ctx.moveTo(arrowX + 50, h * 0.40); ctx.lineTo(arrowX + 40, h * 0.40 - 6)
          ctx.moveTo(arrowX + 50, h * 0.40); ctx.lineTo(arrowX + 40, h * 0.40 + 6)
          ctx.stroke()
        } else {
          ctx.beginPath()
          ctx.moveTo(arrowX + 50, h * 0.40 - 5); ctx.lineTo(arrowX + 40, h * 0.40 - 11)
          ctx.moveTo(arrowX - 50, h * 0.40 + 5); ctx.lineTo(arrowX - 40, h * 0.40 + 11)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,200,80,0.6)'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('équilibre', arrowX, h * 0.40 - 18)
        }

        // Produits à droite
        const visibleIons = Math.max(0, Math.min(N_DISSOC, currentCycle - (frozen ? 0 : 1) + (frozen ? 0 : (phase > 0.6 ? 1 : 0))))
        if (visibleIons > 0) {
          const ionSlotH = (colBot - colTop) / Math.max(1, visibleIons)
          for (let i = 0; i < visibleIons; i++) {
            const y = colTop + (visibleIons === 1 ? (colBot - colTop) / 2 : i * ionSlotH)
            drawIon(ctx, productX - 22, y - 14, cationLabel, '+', '#ff8a8a')
            drawIon(ctx, productX + 22, y + 14, 'OH', '-', '#7fffaa')
          }
        }

        // Mini-indicateur de proportion
        const badgeX = w - 12
        const badgeY = 12
        const badgeText = `OH⁻ libérés : ${ratioLabel}`
        ctx.font = 'bold 11px sans-serif'
        const tw = ctx.measureText(badgeText).width
        const padX = 8
        const bw = tw + padX * 2
        const bh = 22
        ctx.fillStyle = isStrong ? 'rgba(127,255,170,0.18)' : 'rgba(255,200,80,0.18)'
        ctx.fillRect(badgeX - bw, badgeY, bw, bh)
        ctx.strokeStyle = isStrong ? 'rgba(127,255,170,0.5)' : 'rgba(255,200,80,0.5)'
        ctx.lineWidth = 1
        ctx.strokeRect(badgeX - bw, badgeY, bw, bh)
        ctx.fillStyle = isStrong ? '#7fffaa' : '#ffc850'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(badgeText, badgeX - bw + padX, badgeY + bh / 2)

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: baseColor, label: `${baseLabel} (base ${isStrong ? 'forte' : 'faible'}, intacte)`, shape: isStrong ? 'square' : 'circle' },
          { color: '#66c8ff', label: 'H₂O (solvant)' },
          { color: '#ff8a8a', label: `${cationLabel}⁺ (cation conjugué)` },
          { color: '#7fffaa', label: 'OH⁻ (hydroxyde, base)' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, Math.min(cycle, MAX_CYCLES), MAX_CYCLES, isStrong ? 'Pastille' : 'Molécule')

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(equationStr, w / 2, h - 50)
        ctx.fillStyle = frozen ? (isStrong ? '#7fffaa' : '#ffc850') : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(frozen ? subtitleDone : subtitleRunning, w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [mode])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawMol(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, radius = 22) {
  const g = ctx.createRadialGradient(x - 4, y - 4, 0, x, y, radius)
  g.addColorStop(0, '#fff')
  g.addColorStop(0.4, color)
  g.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#0a0e1a'
  ctx.font = `bold ${Math.max(9, Math.round(radius * 0.5))}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(label, x, y)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}

function drawIon(ctx: CanvasRenderingContext2D, x: number, y: number,
                 label: string, sign: string, color: string) {
  drawMol(ctx, x, y, label, color, 18)
  ctx.fillStyle = sign === '+' ? '#ff7777' : '#7fffaa'
  ctx.font = 'bold 12px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(sign, x + 14, y - 12)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
