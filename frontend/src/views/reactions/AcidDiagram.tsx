import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : ionisation d'un acide dans l'eau.
// mode 'strong' : HCl + H2O -> H3O+ + Cl-, dissociation totale (4/4).
// mode 'weak'   : CH3COOH + H2O ⇌ H3O+ + CH3COO-, dissociation partielle (1/5).

type Props = { mode?: 'strong' | 'weak' }

export default function AcidDiagram({ mode = 'strong' }: Props) {
  const canvasRef = useCanvas(() => {
    const isStrong = mode === 'strong'
    const N_MOL = isStrong ? 4 : 5
    const N_DISSOC = isStrong ? 4 : 1
    const PERIOD = 4
    const MAX_CYCLES = N_MOL  // une molécule traitée par cycle
    const acidFormula = isStrong ? 'HCl' : 'HA'
    const acidColor = isStrong ? '#caff1a' : '#ffb066'
    const baseFormula = isStrong ? 'Cl' : 'A'
    const arrow = isStrong ? '->' : '⇌'
    const ratioLabel = isStrong ? '100 %' : `${Math.round((N_DISSOC / N_MOL) * 100)} %`
    const equationStr = isStrong
      ? 'HCl + H₂O  ->  H₃O⁺ + Cl⁻'
      : 'CH₃COOH + H₂O  ⇌  H₃O⁺ + CH₃COO⁻'
    const subtitleDone = isStrong
      ? 'Acide fort : dissociation totale - aucun HA résiduel'
      : `Acide faible : équilibre atteint - ${N_MOL - N_DISSOC} molécules non dissociées`
    const subtitleRunning = isStrong
      ? 'Ionisation totale d\'un acide fort (Brønsted : donneur de H⁺)'
      : 'Ionisation partielle d\'un acide faible (équilibre, Ka ≈ 10⁻⁵)'

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

        // Colonne de molécules HA à gauche
        const slotH = (colBot - colTop) / Math.max(1, N_MOL - 1)
        for (let i = 0; i < N_MOL; i++) {
          const y = colTop + i * slotH
          // i < N_DISSOC peut se dissocier; au-delà reste HA toujours
          let opacity = 1
          if (i === currentCycle - 1 && i < N_DISSOC) {
            opacity = Math.max(0.15, 1 - phase)
          } else if (i < currentCycle - 1 && i < N_DISSOC) {
            opacity = 0
          }
          ctx.globalAlpha = opacity
          drawMol(ctx, reactX, y, acidFormula, acidColor)
          ctx.globalAlpha = 1
        }

        // Eau (au centre, indicatif)
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
          // Double flèche (équilibre)
          ctx.beginPath()
          ctx.moveTo(arrowX + 50, h * 0.40 - 5); ctx.lineTo(arrowX + 40, h * 0.40 - 11)
          ctx.moveTo(arrowX - 50, h * 0.40 + 5); ctx.lineTo(arrowX - 40, h * 0.40 + 11)
          ctx.stroke()
          ctx.fillStyle = 'rgba(255,200,80,0.6)'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('équilibre', arrowX, h * 0.40 - 18)
        }

        // Produits ionisés à droite (autant que dissociés à ce moment)
        const dissocSoFar = Math.min(N_DISSOC, currentCycle - (frozen ? 0 : 1) + (frozen ? 0 : (phase > 0.6 ? 1 : 0)))
        const visibleIons = Math.max(0, Math.min(N_DISSOC, dissocSoFar))
        if (visibleIons > 0) {
          const ionSlotH = (colBot - colTop) / Math.max(1, visibleIons)
          for (let i = 0; i < visibleIons; i++) {
            const y = colTop + (visibleIons === 1 ? (colBot - colTop) / 2 : i * ionSlotH)
            drawIon(ctx, productX - 22, y - 14, 'H₃O', '+', '#ff7777')
            drawIon(ctx, productX + 22, y + 14, baseFormula, '-', '#7fffaa')
          }
        }

        // Mini-indicateur de proportion en haut à droite
        const badgeX = w - 12
        const badgeY = 12
        const badgeText = `Dissociation : ${ratioLabel}`
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
          { color: acidColor, label: `${acidFormula} (acide ${isStrong ? 'fort' : 'faible'}, intact)` },
          { color: '#66c8ff', label: 'H₂O (solvant)' },
          { color: '#ff7777', label: 'H₃O⁺ (acide conjugué)' },
          { color: '#7fffaa', label: `${baseFormula}⁻ (base conjuguée)` },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, Math.min(cycle, MAX_CYCLES), MAX_CYCLES, 'Molécule')

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
        // (arrow only used in subtitle for weak mode label)
        void arrow
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
  ctx.font = `bold ${Math.max(9, Math.round(radius * 0.55))}px sans-serif`
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
  ctx.fillText(sign, x + 12, y - 12)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
