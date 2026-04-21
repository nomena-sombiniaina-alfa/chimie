import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Bécher d'eau dans lequel on verse un acide avec une pipette généreuse.
// Les molécules HA tombent, plongent, puis s'éparpillent dans tout le bécher.
//  - mode 'strong' : 100 % se dissocient en H₃O⁺ + A⁻
//  - mode 'weak'   : ~20 % se dissocient, le reste flotte intact
// Après MAX_CYCLES ajouts, on fige l'état final.

type Props = { mode?: 'strong' | 'weak' }

export default function AcidDiagram({ mode = 'strong' }: Props) {
  const canvasRef = useCanvas(() => {
    const isStrong = mode === 'strong'
    const MAX_CYCLES = 3
    const PER_CYCLE = 5
    const N_DISSOC = isStrong ? PER_CYCLE : 1
    const CYCLE_DUR = 6
    const acidName = isStrong ? 'HCl' : 'CH₃COOH'
    const acidShort = isStrong ? 'HCl' : 'HA'
    const anion = isStrong ? 'Cl' : 'A'
    const acidColor = isStrong ? '#caff1a' : '#ffb066'
    const HA_R = 13
    const ION_R = 11

    type P = {
      x: number; y: number; vx: number; vy: number;
      kind: 'HA' | 'H3O' | 'A';
      dissocAt: number;
      splitProgress: number;
      target?: { x: number; y: number }
    }
    type Pending = { time: number; willDissociate: boolean }

    let parts: P[] = []
    let pending: Pending[] = []
    let W = 0, H = 0
    let beakerTop = 0, beakerBot = 0, beakerLeft = 0, beakerRight = 0, waterTop = 0
    let cycle = 0
    let cycleStartT = 0
    let frozen = false
    let initialized = false

    function build(w: number, h: number) {
      W = w; H = h
      beakerTop = h * 0.22
      beakerBot = h * 0.82
      beakerLeft = w * 0.28
      beakerRight = w * 0.72
      waterTop = beakerTop + 26
    }

    function startCycle(t: number) {
      cycle += 1
      cycleStartT = t
      for (let i = 0; i < PER_CYCLE; i++) {
        pending.push({
          time: t + 0.25 + i * 0.30,
          willDissociate: i < N_DISSOC,
        })
      }
    }

    function randomScatterTarget() {
      const margin = 24
      return {
        x: beakerLeft + margin + Math.random() * (beakerRight - beakerLeft - margin * 2),
        y: waterTop + 30 + Math.random() * (beakerBot - waterTop - 50),
      }
    }

    function spawnHA(t: number, willDissoc: boolean) {
      const cx = (beakerLeft + beakerRight) / 2
      parts.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: beakerTop - 70,
        vx: (Math.random() - 0.5) * 60,
        vy: 50,
        kind: 'HA',
        dissocAt: willDissoc ? t + 2.0 + Math.random() * 1.5 : -1,
        splitProgress: 0,
        target: randomScatterTarget(),
      })
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)
        if (!initialized) { initialized = true; startCycle(t) }

        // Cycles
        if (!frozen && t - cycleStartT >= CYCLE_DUR) {
          if (cycle >= MAX_CYCLES) frozen = true
          else startCycle(t)
        }

        // Spawn en attente
        const stillPending: Pending[] = []
        for (const p of pending) {
          if (t >= p.time) spawnHA(t, p.willDissociate)
          else stillPending.push(p)
        }
        pending = stillPending

        // Pipette
        const cyclePhase = (t - cycleStartT) / CYCLE_DUR
        let pipetteOffset = 0
        if (!frozen) {
          if (cyclePhase < 0.05) pipetteOffset = (cyclePhase / 0.05) * 30
          else if (cyclePhase < 0.32) pipetteOffset = 30
          else if (cyclePhase < 0.40) pipetteOffset = 30 * (1 - (cyclePhase - 0.32) / 0.08)
        }

        // Bécher
        ctx.strokeStyle = 'rgba(255,255,255,0.28)'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(beakerLeft, beakerTop); ctx.lineTo(beakerLeft, beakerBot)
        ctx.lineTo(beakerRight, beakerBot); ctx.lineTo(beakerRight, beakerTop)
        ctx.stroke()
        // Eau
        const ionDensity = parts.filter(p => p.kind !== 'HA').length / 18
        const tintR = Math.min(60, ionDensity * 40)
        ctx.fillStyle = `rgba(${100 + tintR}, 180, 240, 0.${10 + Math.min(8, Math.floor(ionDensity * 4))})`
        ctx.fillRect(beakerLeft + 1, waterTop, beakerRight - beakerLeft - 2, beakerBot - waterTop - 1)
        // Surface
        ctx.strokeStyle = 'rgba(140, 200, 255, 0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = beakerLeft + 1; x <= beakerRight - 1; x += 4) {
          const y = waterTop + Math.sin(x * 0.06 + t * 2.5) * 1.6
          if (x === beakerLeft + 1) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.fillStyle = 'rgba(102, 200, 255, 0.55)'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('H₂O', beakerLeft + 8, waterTop - 6)

        // Pipette (élargie)
        const pipX = (beakerLeft + beakerRight) / 2
        const pipBaseY = beakerTop - 70
        const pipY = pipBaseY + pipetteOffset
        const PIP_W = 30
        const PIP_H = 60
        // Bulbe (corps)
        ctx.fillStyle = '#aab4c5'
        ctx.fillRect(pipX - PIP_W / 2, pipY - PIP_H, PIP_W, PIP_H)
        // Anneau supérieur
        ctx.fillStyle = '#6d7484'
        ctx.fillRect(pipX - PIP_W / 2, pipY - PIP_H, PIP_W, 10)
        // Pointe
        ctx.fillStyle = '#7a818f'
        ctx.beginPath()
        ctx.moveTo(pipX - PIP_W / 2, pipY)
        ctx.lineTo(pipX, pipY + 22)
        ctx.lineTo(pipX + PIP_W / 2, pipY)
        ctx.closePath(); ctx.fill()
        ctx.strokeStyle = '#5b6170'
        ctx.lineWidth = 1
        ctx.stroke()
        // Contenu liquide visible
        ctx.fillStyle = acidColor
        ctx.fillRect(pipX - PIP_W / 2 + 4, pipY - PIP_H + 12, PIP_W - 8, PIP_H - 18)
        ctx.fillStyle = '#0a0e1a'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(acidShort, pipX, pipY - PIP_H / 2 + 2)
        // Label au-dessus
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(acidName, pipX, pipY - PIP_H - 8)

        // Goutte qui tombe pendant la phase d'éjection
        if (!frozen && cyclePhase > 0.10 && cyclePhase < 0.35) {
          const dropPhase = (cyclePhase - 0.10) / 0.25
          const dropY = pipY + 22 + dropPhase * (waterTop - pipY - 26)
          ctx.fillStyle = acidColor
          ctx.beginPath()
          ctx.ellipse(pipX, dropY, 6, 9, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // Update particules
        for (const p of parts) {
          if (p.y < waterTop - 4) {
            // En chute libre
            p.vy += 250 * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.y >= waterTop - 4) {
              p.y = waterTop
              p.vy *= 0.2
            }
          } else {
            // Dans l'eau : on dirige doucement vers le target puis on lâche
            if (p.target) {
              const dx = p.target.x - p.x
              const dy = p.target.y - p.y
              const dist = Math.hypot(dx, dy)
              if (dist < 25) {
                p.target = undefined
              } else {
                p.vx += (dx / dist) * 120 * dt
                p.vy += (dy / dist) * 120 * dt
              }
            }
            // Mouvement brownien (plus prononcé)
            p.vx += (Math.random() - 0.5) * 110 * dt
            p.vy += (Math.random() - 0.5) * 110 * dt
            p.vx *= 0.94
            p.vy *= 0.94
            p.x += p.vx * dt
            p.y += p.vy * dt
            // Bornes
            if (p.x < beakerLeft + HA_R + 2) { p.x = beakerLeft + HA_R + 2; p.vx *= -0.5 }
            if (p.x > beakerRight - HA_R - 2) { p.x = beakerRight - HA_R - 2; p.vx *= -0.5 }
            if (p.y < waterTop + HA_R) { p.y = waterTop + HA_R; p.vy = Math.abs(p.vy) * 0.4 }
            if (p.y > beakerBot - HA_R - 2) { p.y = beakerBot - HA_R - 2; p.vy = -Math.abs(p.vy) * 0.4 }
          }

          if (p.kind === 'HA' && p.dissocAt > 0 && t >= p.dissocAt) {
            p.splitProgress += dt / 0.7
            if (p.splitProgress >= 1) {
              p.kind = 'H3O'
              p.dissocAt = -1
              p.splitProgress = 0
              p.target = randomScatterTarget()
              parts.push({
                x: p.x + 10, y: p.y - 4,
                vx: -p.vx * 0.3 + (Math.random() - 0.5) * 80,
                vy: -p.vy * 0.3 + (Math.random() - 0.5) * 80,
                kind: 'A', dissocAt: -1, splitProgress: 0,
                target: randomScatterTarget(),
              })
            }
          }
        }

        // Dessin particules
        for (const p of parts) {
          if (p.kind === 'HA') {
            const flicker = p.splitProgress > 0 ? 0.5 + 0.5 * Math.sin(p.splitProgress * 25) : 1
            ctx.globalAlpha = flicker
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, HA_R)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.5, acidColor)
            g.addColorStop(1, acidColor)
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, HA_R, 0, Math.PI * 2); ctx.fill()
            ctx.strokeStyle = 'rgba(0,0,0,0.45)'
            ctx.lineWidth = 0.8
            ctx.beginPath(); ctx.arc(p.x, p.y, HA_R, 0, Math.PI * 2); ctx.stroke()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 10px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(acidShort, p.x, p.y)
            ctx.globalAlpha = 1
          } else if (p.kind === 'H3O') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, ION_R)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.45, '#ff7777')
            g.addColorStop(1, '#ff7777')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, ION_R, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 9px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H₃O⁺', p.x, p.y)
          } else if (p.kind === 'A') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, ION_R)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.45, '#7fffaa')
            g.addColorStop(1, '#7fffaa')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, ION_R, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 9px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${anion}⁻`, p.x, p.y)
          }
        }
        ctx.textBaseline = 'alphabetic'

        // Bilan
        const ha = parts.filter(p => p.kind === 'HA').length
        const h3o = parts.filter(p => p.kind === 'H3O').length
        const totalAdded = cycle * PER_CYCLE
        const dissocPct = totalAdded > 0 ? Math.round((h3o / totalAdded) * 100) : 0
        const px0 = 14, py0 = h - 110
        ctx.fillStyle = 'rgba(10,14,26,0.78)'
        ctx.fillRect(px0 - 4, py0 - 4, 160, 80)
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'
        ctx.lineWidth = 1
        ctx.strokeRect(px0 - 4, py0 - 4, 160, 80)
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('BILAN', px0, py0)
        let yLine = py0 + 16
        const line = (label: string, color: string) => {
          ctx.fillStyle = color
          ctx.font = '11px sans-serif'
          ctx.fillText(label, px0, yLine)
          yLine += 15
        }
        line(`${acidShort} restants : ${ha}`, acidColor)
        line(`H₃O⁺ formés : ${h3o}`, '#ff7777')
        line(`Dissocié : ${dissocPct} %`, dissocPct >= 90 ? '#7fffaa' : dissocPct >= 30 ? '#ffcc44' : '#ffc850')

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: acidColor, label: `${acidShort} (${isStrong ? 'acide fort' : 'acide faible'})` },
          { color: '#66c8ff', label: 'H₂O (solvant)' },
          { color: '#ff7777', label: 'H₃O⁺ (acide conjugué)' },
          { color: '#7fffaa', label: `${anion}⁻ (base conjuguée)` },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Ajout')

        // Équation + statut
        const eqStr = isStrong
          ? 'HCl + H₂O  ->  H₃O⁺ + Cl⁻   (dissociation totale)'
          : 'CH₃COOH + H₂O  ⇌  H₃O⁺ + CH₃COO⁻   (équilibre)'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(eqStr, w / 2, h - 32)
        const status = frozen
          ? (isStrong
              ? `Tout l'acide consommé - solution saturée en H₃O⁺`
              : `Équilibre : ${ha} ${acidShort} encore intacts (~ ${dissocPct} % ionisé)`)
          : (isStrong
              ? `Ajout en cours - chaque ${acidShort} qui touche l'eau se dissocie immédiatement`
              : `Ajout en cours - seul ~ 1 ${acidShort} sur ${PER_CYCLE} se dissocie, les autres flottent`)
        ctx.fillStyle = frozen ? (isStrong ? '#7fffaa' : '#ffc850') : 'rgba(255,255,255,0.55)'
        ctx.font = '11px sans-serif'
        ctx.fillText(status, w / 2, h - 14)
        ctx.textAlign = 'start'
      }
    }
  }, [mode])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
