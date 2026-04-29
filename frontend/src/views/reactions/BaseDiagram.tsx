import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Bécher d'eau dans lequel on ajoute une base.
//  - mode 'strong' (NaOH) : pastilles tombent depuis une grande salière, se dissolvent totalement.
//  - mode 'weak'   (NH₃)  : molécules tombent depuis une pipette généreuse, ~20 % protonées.
// Au bout de MAX_CYCLES ajouts, l'état final est figé.

type Props = { mode?: 'strong' | 'weak' }

export default function BaseDiagram({ mode = 'strong' }: Props) {
  const canvasRef = useCanvas(() => {
    const isStrong = mode === 'strong'
    const MAX_CYCLES = 3
    const PER_CYCLE = isStrong ? 3 : 5
    const N_DISSOC = isStrong ? PER_CYCLE : 1
    const CYCLE_DUR = 6
    const baseName = isStrong ? 'NaOH (pastilles)' : 'NH₃ (gaz dissous)'
    const baseShort = isStrong ? 'NaOH' : 'NH₃'
    const cation = isStrong ? 'Na' : 'NH₄'
    const baseColor = isStrong ? '#dde2eb' : '#b8e090'
    const BASE_R = isStrong ? 16 : 13
    const ION_R = 11

    type P = {
      x: number; y: number; vx: number; vy: number;
      kind: 'BASE' | 'CAT' | 'OH';
      dissocAt: number;
      splitProgress: number;
      size: number;
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
          time: t + 0.25 + i * 0.35,
          willDissociate: i < N_DISSOC,
        })
      }
    }

    function randomScatterTarget() {
      const margin = 28
      return {
        x: beakerLeft + margin + Math.random() * (beakerRight - beakerLeft - margin * 2),
        y: waterTop + 30 + Math.random() * (beakerBot - waterTop - 50),
      }
    }

    function spawnBase(t: number, willDissoc: boolean) {
      const cx = (beakerLeft + beakerRight) / 2
      parts.push({
        x: cx + (Math.random() - 0.5) * 35,
        y: beakerTop - 70,
        vx: (Math.random() - 0.5) * 55,
        vy: 50,
        kind: 'BASE',
        dissocAt: willDissoc ? t + 2.0 + Math.random() * 1.5 : -1,
        splitProgress: 0,
        size: BASE_R,
        target: randomScatterTarget(),
      })
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)
        if (!initialized) { initialized = true; startCycle(t) }

        if (!frozen && t - cycleStartT >= CYCLE_DUR) {
          if (cycle >= MAX_CYCLES) frozen = true
          else startCycle(t)
        }

        const stillPending: Pending[] = []
        for (const p of pending) {
          if (t >= p.time) spawnBase(t, p.willDissociate)
          else stillPending.push(p)
        }
        pending = stillPending

        const cyclePhase = (t - cycleStartT) / CYCLE_DUR
        let pipetteOffset = 0
        if (!frozen) {
          if (cyclePhase < 0.05) pipetteOffset = (cyclePhase / 0.05) * 30
          else if (cyclePhase < 0.34) pipetteOffset = 30
          else if (cyclePhase < 0.42) pipetteOffset = 30 * (1 - (cyclePhase - 0.34) / 0.08)
        }

        // Bécher
        ctx.strokeStyle = 'rgba(255,255,255,0.28)'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(beakerLeft, beakerTop); ctx.lineTo(beakerLeft, beakerBot)
        ctx.lineTo(beakerRight, beakerBot); ctx.lineTo(beakerRight, beakerTop)
        ctx.stroke()
        // Eau (devient plus violette si beaucoup d'OH-)
        const ohCount = parts.filter(p => p.kind === 'OH').length
        const violetBoost = Math.min(40, ohCount * 4)
        ctx.fillStyle = `rgba(${120 - violetBoost * 0.5}, ${180 - violetBoost * 0.5}, ${240}, 0.${10 + Math.min(8, Math.floor(ohCount / 3))})`
        ctx.fillRect(beakerLeft + 1, waterTop, beakerRight - beakerLeft - 2, beakerBot - waterTop - 1)
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

        // Salière (strong) ou pipette (weak), tailles agrandies
        const pipX = (beakerLeft + beakerRight) / 2
        const pipBaseY = beakerTop - 70
        const pipY = pipBaseY + pipetteOffset
        if (isStrong) {
          const SW = 72, SH = 46
          ctx.fillStyle = '#aab4c5'
          ctx.fillRect(pipX - SW / 2, pipY - SH, SW, SH)
          ctx.fillStyle = '#6d7484'
          ctx.fillRect(pipX - SW / 2, pipY - SH, SW, 10)
          ctx.fillStyle = '#0a0e1a'
          for (let i = -2; i <= 2; i++) {
            ctx.beginPath(); ctx.arc(pipX + i * 12, pipY - SH + 5, 2.2, 0, Math.PI * 2); ctx.fill()
          }
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(baseShort, pipX, pipY - SH / 2 + 6)
        } else {
          const PIP_W = 30, PIP_H = 60
          ctx.fillStyle = '#aab4c5'
          ctx.fillRect(pipX - PIP_W / 2, pipY - PIP_H, PIP_W, PIP_H)
          ctx.fillStyle = '#6d7484'
          ctx.fillRect(pipX - PIP_W / 2, pipY - PIP_H, PIP_W, 10)
          ctx.fillStyle = '#7a818f'
          ctx.beginPath()
          ctx.moveTo(pipX - PIP_W / 2, pipY)
          ctx.lineTo(pipX, pipY + 22)
          ctx.lineTo(pipX + PIP_W / 2, pipY)
          ctx.closePath(); ctx.fill()
          ctx.fillStyle = baseColor
          ctx.fillRect(pipX - PIP_W / 2 + 4, pipY - PIP_H + 12, PIP_W - 8, PIP_H - 18)
          ctx.fillStyle = '#0a0e1a'
          ctx.font = 'bold 11px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(baseShort, pipX, pipY - PIP_H / 2 + 2)
        }
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'center'
        ctx.fillText(baseName, pipX, pipY - (isStrong ? 52 : 68))

        // Goutte si pipette
        if (!isStrong && !frozen && cyclePhase > 0.10 && cyclePhase < 0.40) {
          const dropPhase = ((cyclePhase - 0.10) * 2) % 1
          const dropY = pipY + 22 + dropPhase * (waterTop - pipY - 26)
          ctx.fillStyle = baseColor
          ctx.beginPath()
          ctx.ellipse(pipX, dropY, 6, 9, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // Update particles
        for (const p of parts) {
          if (p.y < waterTop - 4) {
            p.vy += 250 * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.y >= waterTop - 4) {
              p.y = waterTop
              p.vy *= 0.2
            }
          } else {
            if (p.target) {
              const dx = p.target.x - p.x
              const dy = p.target.y - p.y
              const dist = Math.hypot(dx, dy)
              if (dist < 25) p.target = undefined
              else {
                p.vx += (dx / dist) * 120 * dt
                p.vy += (dy / dist) * 120 * dt
              }
            }
            p.vx += (Math.random() - 0.5) * 110 * dt
            p.vy += (Math.random() - 0.5) * 110 * dt
            p.vx *= 0.94
            p.vy *= 0.94
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.x < beakerLeft + p.size + 2) { p.x = beakerLeft + p.size + 2; p.vx *= -0.5 }
            if (p.x > beakerRight - p.size - 2) { p.x = beakerRight - p.size - 2; p.vx *= -0.5 }
            if (p.y < waterTop + p.size) { p.y = waterTop + p.size; p.vy = Math.abs(p.vy) * 0.4 }
            if (p.y > beakerBot - p.size - 2) { p.y = beakerBot - p.size - 2; p.vy = -Math.abs(p.vy) * 0.4 }
          }

          if (p.kind === 'BASE' && p.dissocAt > 0 && t >= p.dissocAt) {
            p.splitProgress += dt / 0.7
            if (p.splitProgress >= 1) {
              p.kind = 'CAT'
              p.dissocAt = -1
              p.splitProgress = 0
              p.size = ION_R
              p.target = randomScatterTarget()
              parts.push({
                x: p.x + 10, y: p.y - 4,
                vx: -p.vx * 0.3 + (Math.random() - 0.5) * 80,
                vy: -p.vy * 0.3 + (Math.random() - 0.5) * 80,
                kind: 'OH', dissocAt: -1, splitProgress: 0, size: ION_R,
                target: randomScatterTarget(),
              })
            }
          }
        }

        // Dessin particules
        for (const p of parts) {
          if (p.kind === 'BASE') {
            const flicker = p.splitProgress > 0 ? 0.5 + 0.5 * Math.sin(p.splitProgress * 25) : 1
            ctx.globalAlpha = flicker
            if (isStrong) {
              // Cube de NaOH (pastille)
              const g = ctx.createLinearGradient(p.x - p.size, p.y - p.size, p.x + p.size, p.y + p.size)
              g.addColorStop(0, '#ffffff')
              g.addColorStop(1, baseColor)
              ctx.fillStyle = g
              ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
              ctx.strokeStyle = 'rgba(0,0,0,0.35)'
              ctx.lineWidth = 0.8
              ctx.strokeRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2)
              ctx.fillStyle = '#0a0e1a'
              ctx.font = 'bold 10px sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(baseShort, p.x, p.y)
            } else {
              const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, p.size)
              g.addColorStop(0, '#ffffff')
              g.addColorStop(0.5, baseColor)
              g.addColorStop(1, baseColor)
              ctx.fillStyle = g
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
              ctx.strokeStyle = 'rgba(0,0,0,0.45)'
              ctx.lineWidth = 0.8
              ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.stroke()
              ctx.fillStyle = '#0a0e1a'
              ctx.font = 'bold 10px sans-serif'
              ctx.textAlign = 'center'
              ctx.textBaseline = 'middle'
              ctx.fillText(baseShort, p.x, p.y)
            }
            ctx.globalAlpha = 1
          } else if (p.kind === 'CAT') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, p.size)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.45, '#ff8a8a')
            g.addColorStop(1, '#ff8a8a')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 9px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${cation}⁺`, p.x, p.y)
          } else if (p.kind === 'OH') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, p.size)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.45, '#7fffaa')
            g.addColorStop(1, '#7fffaa')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 9px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('OH⁻', p.x, p.y)
          }
        }
        ctx.textBaseline = 'alphabetic'

        // Bilan
        const intact = parts.filter(p => p.kind === 'BASE').length
        const oh = parts.filter(p => p.kind === 'OH').length
        const totalAdded = cycle * PER_CYCLE
        const dissocPct = totalAdded > 0 ? Math.round((oh / totalAdded) * 100) : 0
        const px0 = 16, py0 = h - 140
        ctx.fillStyle = 'rgba(10,14,26,0.82)'
        ctx.fillRect(px0 - 6, py0 - 6, 220, 110)
        ctx.strokeStyle = 'rgba(255,255,255,0.22)'
        ctx.lineWidth = 1
        ctx.strokeRect(px0 - 6, py0 - 6, 220, 110)
        ctx.fillStyle = 'rgba(255,255,255,0.65)'
        ctx.font = 'bold 14px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('BILAN', px0, py0)
        let yLine = py0 + 24
        const line = (label: string, color: string) => {
          ctx.fillStyle = color
          ctx.font = '15px sans-serif'
          ctx.fillText(label, px0, yLine)
          yLine += 22
        }
        line(`${baseShort} restants : ${intact}`, baseColor)
        line(`OH⁻ libérés : ${oh}`, '#7fffaa')
        line(`Dissocié : ${dissocPct} %`, dissocPct >= 90 ? '#7fffaa' : dissocPct >= 30 ? '#ffcc44' : '#ffc850')

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: baseColor, label: `${baseShort} (${isStrong ? 'base forte' : 'base faible'})`, shape: isStrong ? 'square' : 'circle' },
          { color: '#66c8ff', label: 'H₂O (solvant)' },
          { color: '#ff8a8a', label: `${cation}⁺ (cation conjugué)` },
          { color: '#7fffaa', label: 'OH⁻ (ion hydroxyde)' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Ajout')

        // Équation + statut
        const eqStr = isStrong
          ? 'NaOH(s)  ->  Na⁺(aq) + OH⁻(aq)   (dissociation totale)'
          : 'NH₃ + H₂O  ⇌  NH₄⁺ + OH⁻   (équilibre)'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(eqStr, w / 2, h - 32)
        const status = frozen
          ? (isStrong
              ? `Toutes les pastilles dissoutes - solution riche en OH⁻`
              : `Équilibre : ${intact} ${baseShort} encore intacts (~ ${dissocPct} % protoné)`)
          : (isStrong
              ? `Ajout en cours - chaque pastille fond rapidement en Na⁺ + OH⁻`
              : `Ajout en cours - seul ~ 1 ${baseShort} sur ${PER_CYCLE} arrache un H⁺ à l'eau`)
        ctx.fillStyle = frozen ? (isStrong ? '#7fffaa' : '#ffc850') : 'rgba(255,255,255,0.55)'
        ctx.font = '11px sans-serif'
        ctx.fillText(status, w / 2, h - 14)
        ctx.textAlign = 'start'
      }
    }
  }, [mode])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
