import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Bécher d'eau dans lequel on verse un acide avec une pipette.
// Les molécules HA tombent, plongent, puis :
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

    type P = {
      x: number; y: number; vx: number; vy: number;
      kind: 'HA' | 'H3O' | 'A';
      dissocAt: number;       // -1 = jamais
      splitProgress: number;  // animation de scission 0..1
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
      beakerBot = h * 0.80
      beakerLeft = w * 0.30
      beakerRight = w * 0.70
      waterTop = beakerTop + 22
    }

    function startCycle(t: number) {
      cycle += 1
      cycleStartT = t
      for (let i = 0; i < PER_CYCLE; i++) {
        pending.push({
          time: t + 0.2 + i * 0.25,
          willDissociate: i < N_DISSOC,
        })
      }
    }

    function spawnHA(t: number, willDissoc: boolean) {
      const cx = (beakerLeft + beakerRight) / 2
      parts.push({
        x: cx + (Math.random() - 0.5) * 20,
        y: beakerTop - 60,
        vx: (Math.random() - 0.5) * 15,
        vy: 30,
        kind: 'HA',
        dissocAt: willDissoc ? t + 2.5 + Math.random() * 1.5 : -1,
        splitProgress: 0,
      })
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)
        if (!initialized) { initialized = true; startCycle(t) }

        // Gestion des cycles
        if (!frozen && t - cycleStartT >= CYCLE_DUR) {
          if (cycle >= MAX_CYCLES) frozen = true
          else startCycle(t)
        }

        // Spawn des particules en attente
        const stillPending: Pending[] = []
        for (const p of pending) {
          if (t >= p.time) spawnHA(t, p.willDissociate)
          else stillPending.push(p)
        }
        pending = stillPending

        // Phase d'animation de la pipette (descente, lâcher, remontée)
        const cyclePhase = (t - cycleStartT) / CYCLE_DUR
        let pipetteOffset = 0
        if (!frozen) {
          if (cyclePhase < 0.05) pipetteOffset = (cyclePhase / 0.05) * 25
          else if (cyclePhase < 0.25) pipetteOffset = 25
          else if (cyclePhase < 0.32) pipetteOffset = 25 * (1 - (cyclePhase - 0.25) / 0.07)
        }

        // Bécher
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(beakerLeft, beakerTop); ctx.lineTo(beakerLeft, beakerBot)
        ctx.lineTo(beakerRight, beakerBot); ctx.lineTo(beakerRight, beakerTop)
        ctx.stroke()
        // Eau (très légèrement plus colorée si beaucoup d'ions)
        const ionDensity = parts.filter(p => p.kind !== 'HA').length / 20
        const tintR = Math.min(60, ionDensity * 40)
        ctx.fillStyle = `rgba(${100 + tintR}, 180, 240, 0.${10 + Math.min(8, Math.floor(ionDensity * 4))})`
        ctx.fillRect(beakerLeft + 1, waterTop, beakerRight - beakerLeft - 2, beakerBot - waterTop - 1)
        // Surface ondulante
        ctx.strokeStyle = 'rgba(140, 200, 255, 0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = beakerLeft + 1; x <= beakerRight - 1; x += 4) {
          const y = waterTop + Math.sin(x * 0.06 + t * 2.5) * 1.2
          if (x === beakerLeft + 1) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.fillStyle = 'rgba(102, 200, 255, 0.5)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('H₂O', beakerLeft + 6, waterTop - 4)

        // Pipette
        const pipX = (beakerLeft + beakerRight) / 2
        const pipBaseY = beakerTop - 50
        const pipY = pipBaseY + pipetteOffset
        ctx.fillStyle = '#aab4c5'
        ctx.fillRect(pipX - 9, pipY - 36, 18, 36)
        ctx.fillStyle = '#6d7484'
        ctx.fillRect(pipX - 9, pipY - 36, 18, 6)
        ctx.fillStyle = '#888'
        ctx.beginPath()
        ctx.moveTo(pipX - 9, pipY)
        ctx.lineTo(pipX, pipY + 14)
        ctx.lineTo(pipX + 9, pipY)
        ctx.closePath(); ctx.fill()
        ctx.fillStyle = acidColor
        ctx.fillRect(pipX - 6, pipY - 30, 12, 22)
        ctx.fillStyle = '#0a0e1a'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(acidShort, pipX, pipY - 18)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 11px sans-serif'
        ctx.fillText(acidName, pipX, pipY - 44)

        // Mise à jour des particules
        for (const p of parts) {
          if (p.y < waterTop - 2) {
            p.vy += 220 * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.y >= waterTop - 2) {
              p.y = waterTop
              p.vy *= 0.25
              p.vy += 25
            }
          } else {
            p.vx += (Math.random() - 0.5) * 80 * dt
            p.vy += (Math.random() - 0.5) * 60 * dt + 8 * dt
            p.vx *= 0.95
            p.vy *= 0.95
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.x < beakerLeft + 8) { p.x = beakerLeft + 8; p.vx *= -0.5 }
            if (p.x > beakerRight - 8) { p.x = beakerRight - 8; p.vx *= -0.5 }
            if (p.y < waterTop + 4) { p.y = waterTop + 4; p.vy = Math.abs(p.vy) * 0.5 }
            if (p.y > beakerBot - 6) { p.y = beakerBot - 6; p.vy = -Math.abs(p.vy) * 0.5 }
          }

          // Scission
          if (p.kind === 'HA' && p.dissocAt > 0 && t >= p.dissocAt) {
            p.splitProgress += dt / 0.7
            if (p.splitProgress >= 1) {
              p.kind = 'H3O'
              p.dissocAt = -1
              p.splitProgress = 0
              parts.push({
                x: p.x + 6, y: p.y - 2,
                vx: -p.vx * 0.4 + (Math.random() - 0.5) * 50,
                vy: -p.vy * 0.4 + (Math.random() - 0.5) * 50,
                kind: 'A', dissocAt: -1, splitProgress: 0,
              })
            }
          }
        }

        // Dessin des particules
        for (const p of parts) {
          if (p.kind === 'HA') {
            const flicker = p.splitProgress > 0 ? 0.5 + 0.5 * Math.sin(p.splitProgress * 25) : 1
            ctx.globalAlpha = flicker
            ctx.fillStyle = acidColor
            ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill()
            ctx.strokeStyle = 'rgba(0,0,0,0.4)'
            ctx.lineWidth = 0.5
            ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.stroke()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 7px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(acidShort, p.x, p.y)
            ctx.globalAlpha = 1
          } else if (p.kind === 'H3O') {
            ctx.fillStyle = '#ff7777'
            ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 7px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H₃O⁺', p.x, p.y)
          } else if (p.kind === 'A') {
            ctx.fillStyle = '#7fffaa'
            ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 7px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(`${anion}⁻`, p.x, p.y)
          }
        }
        ctx.textBaseline = 'alphabetic'

        // Comptes (panneau en bas-gauche)
        const ha = parts.filter(p => p.kind === 'HA').length
        const h3o = parts.filter(p => p.kind === 'H3O').length
        const totalAdded = cycle * PER_CYCLE
        const dissocPct = totalAdded > 0 ? Math.round((h3o / totalAdded) * 100) : 0
        const px0 = 14, py0 = h - 100
        ctx.fillStyle = 'rgba(10,14,26,0.78)'
        ctx.fillRect(px0 - 4, py0 - 4, 140, 70)
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'
        ctx.lineWidth = 1
        ctx.strokeRect(px0 - 4, py0 - 4, 140, 70)
        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText('BILAN', px0, py0)
        let yLine = py0 + 14
        const line = (label: string, color: string) => {
          ctx.fillStyle = color
          ctx.font = '10px sans-serif'
          ctx.fillText(label, px0, yLine)
          yLine += 13
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
