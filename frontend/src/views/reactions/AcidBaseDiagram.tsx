import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Titrage : bécher contenant déjà l'acide en solution, burette qui ajoute
// la base (OH-) goutte à goutte. Chaque OH- qui croise un H+ (ou un HA)
// forme une molécule d'eau et disparaît.
//  - mode 'strong' : tout est neutralisé, pH final = 7.
//  - mode 'weak'   : HA + OH- -> A- + H2O, l'A- reste basique -> pH ~ 8.7
//                    et quelques HA restent intacts (équilibre).

type Props = { mode?: 'strong' | 'weak' }

export default function AcidBaseDiagram({ mode = 'strong' }: Props) {
  const canvasRef = useCanvas(() => {
    const isStrong = mode === 'strong'
    const MAX_CYCLES = 3
    const PER_CYCLE = 4              // OH- ajoutés par cycle
    const INITIAL_ACID = 8           // population d'acide initiale
    const CYCLE_DUR = 6
    const acidLabel = isStrong ? 'H⁺' : 'HA'
    const acidColor = isStrong ? '#ff6b6b' : '#ffb066'
    const ACID_R = 14
    const ION_R = 12

    type Kind = 'ACID' | 'OH' | 'A' | 'SPEC_NA' | 'SPEC_CL'
    type P = {
      x: number; y: number; vx: number; vy: number;
      kind: Kind;
      combiningWith?: P;
      combineProgress: number;
      target?: { x: number; y: number }
      // pour weak : marqueur "ne se neutralise pas" sur certains HA
      neutralizable: boolean;
    }
    type Pending = { time: number }

    let parts: P[] = []
    let pending: Pending[] = []
    let combos: { x: number; y: number; age: number }[] = []  // flashes H2O
    let W = 0, H = 0
    let beakerTop = 0, beakerBot = 0, beakerLeft = 0, beakerRight = 0, waterTop = 0
    let cycle = 0
    let cycleStartT = 0
    let frozen = false
    let initialized = false

    function build(w: number, h: number) {
      W = w; H = h
      beakerTop = h * 0.30
      beakerBot = h * 0.82
      beakerLeft = w * 0.28
      beakerRight = w * 0.72
      waterTop = beakerTop + 22
    }

    function randomScatterTarget() {
      const margin = 28
      return {
        x: beakerLeft + margin + Math.random() * (beakerRight - beakerLeft - margin * 2),
        y: waterTop + 30 + Math.random() * (beakerBot - waterTop - 50),
      }
    }

    function preload() {
      parts = []
      combos = []
      // Acide initial : 8 (HA ou H+)
      for (let i = 0; i < INITIAL_ACID; i++) {
        const target = randomScatterTarget()
        parts.push({
          x: target.x, y: target.y,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          kind: 'ACID',
          combineProgress: 0,
          // En mode weak, on garde 2 HA "réfractaires" qui resteront en fin (équilibre)
          neutralizable: isStrong ? true : i < INITIAL_ACID - 2,
        })
      }
      // Ions spectateurs (Na+ ou Cl-) en arrière-plan
      for (let i = 0; i < 6; i++) {
        const target = randomScatterTarget()
        parts.push({
          x: target.x, y: target.y,
          vx: (Math.random() - 0.5) * 30,
          vy: (Math.random() - 0.5) * 30,
          kind: i % 2 === 0 ? 'SPEC_NA' : 'SPEC_CL',
          combineProgress: 0,
          neutralizable: false,
        })
      }
    }

    function startCycle(t: number) {
      cycle += 1
      cycleStartT = t
      for (let i = 0; i < PER_CYCLE; i++) {
        pending.push({ time: t + 0.25 + i * 0.35 })
      }
    }

    function spawnOH() {
      const cx = (beakerLeft + beakerRight) / 2
      parts.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: beakerTop - 80,
        vx: (Math.random() - 0.5) * 45,
        vy: 50,
        kind: 'OH',
        combineProgress: 0,
        target: randomScatterTarget(),
        neutralizable: false,
      })
    }

    function findNeutralizationPair() {
      // Chaque OH- non-combiné cherche le plus proche acide neutralizable
      const ohs = parts.filter(p => p.kind === 'OH' && !p.combiningWith && p.y > waterTop)
      const acids = parts.filter(p => p.kind === 'ACID' && !p.combiningWith && p.neutralizable)
      for (const oh of ohs) {
        let best: P | null = null
        let bestD = Infinity
        for (const a of acids) {
          if (a.combiningWith) continue
          const d = Math.hypot(oh.x - a.x, oh.y - a.y)
          if (d < bestD) { bestD = d; best = a }
        }
        if (best && bestD < 90) {
          oh.combiningWith = best
          best.combiningWith = oh
          oh.target = { x: (oh.x + best.x) / 2, y: (oh.y + best.y) / 2 }
          best.target = oh.target
        }
      }
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)
        if (!initialized) { initialized = true; preload(); startCycle(t) }

        if (!frozen && t - cycleStartT >= CYCLE_DUR) {
          if (cycle >= MAX_CYCLES) frozen = true
          else startCycle(t)
        }

        // Spawn OH-
        const stillPending: Pending[] = []
        for (const p of pending) {
          if (t >= p.time) spawnOH()
          else stillPending.push(p)
        }
        pending = stillPending

        // Burette
        const cyclePhase = (t - cycleStartT) / CYCLE_DUR
        let dropY = -1
        if (!frozen && cyclePhase > 0.10 && cyclePhase < 0.50) {
          const dropPhase = ((cyclePhase - 0.10) * 2.5) % 1
          dropY = beakerTop - 60 + dropPhase * 50
        }

        // Bécher
        ctx.strokeStyle = 'rgba(255,255,255,0.28)'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.moveTo(beakerLeft, beakerTop); ctx.lineTo(beakerLeft, beakerBot)
        ctx.lineTo(beakerRight, beakerBot); ctx.lineTo(beakerRight, beakerTop)
        ctx.stroke()
        // Couleur selon pH approximatif
        const acidCount = parts.filter(p => p.kind === 'ACID').length
        const aCount = parts.filter(p => p.kind === 'A').length
        const ohRemain = parts.filter(p => p.kind === 'OH').length
        let tint = 'rgba(102, 200, 255, 0.10)'
        if (frozen) {
          tint = isStrong ? 'rgba(180, 240, 200, 0.18)' : 'rgba(150, 130, 220, 0.20)'
        } else if (acidCount > 4) tint = 'rgba(255, 160, 120, 0.14)'
        ctx.fillStyle = tint
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
        ctx.fillText('Solution acide', beakerLeft + 8, waterTop - 6)

        // Burette (grande, verticale, à gauche-haut)
        const burX = (beakerLeft + beakerRight) / 2
        const burTop = h * 0.04
        const burBot = beakerTop - 60
        const BUR_W = 28
        // Robinet
        ctx.fillStyle = '#888'
        ctx.fillRect(burX - 14, burBot - 14, 28, 14)
        ctx.fillStyle = '#ccc'
        ctx.fillRect(burX - 18, burBot - 24, 36, 10)
        // Tube
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.lineWidth = 1
        ctx.strokeRect(burX - BUR_W / 2, burTop, BUR_W, burBot - burTop - 14)
        // Liquide (base) dans le tube
        const burFill = frozen ? 0.3 : Math.max(0.3, 1 - (cycle - 1) / MAX_CYCLES - cyclePhase * 0.3)
        const fillH = (burBot - burTop - 14) * burFill
        ctx.fillStyle = '#7fffaa'
        ctx.globalAlpha = 0.55
        ctx.fillRect(burX - BUR_W / 2 + 2, burTop + (burBot - burTop - 14) - fillH, BUR_W - 4, fillH)
        ctx.globalAlpha = 1
        // Graduations
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        for (let i = 1; i < 6; i++) {
          const y = burTop + i * (burBot - burTop - 14) / 6
          ctx.beginPath(); ctx.moveTo(burX - BUR_W / 2, y); ctx.lineTo(burX - BUR_W / 2 + 6, y); ctx.stroke()
        }
        // Label
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('OH⁻ (NaOH)', burX, burTop - 8)

        // Goutte qui tombe
        if (dropY > 0) {
          ctx.fillStyle = '#7fffaa'
          ctx.beginPath()
          ctx.ellipse(burX, dropY, 7, 11, 0, 0, Math.PI * 2)
          ctx.fill()
        }

        // Appariement et combinaison
        findNeutralizationPair()

        // Update particles
        for (const p of parts) {
          if (p.y < waterTop - 4 && p.kind === 'OH') {
            // Chute libre OH-
            p.vy += 250 * dt
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.y >= waterTop - 4) {
              p.y = waterTop
              p.vy *= 0.2
            }
            continue
          }
          if (p.combiningWith) {
            // Se rapproche de la cible (centre du couple)
            const tx = p.target!.x, ty = p.target!.y
            const dx = tx - p.x, dy = ty - p.y
            p.x += dx * 6 * dt
            p.y += dy * 6 * dt
            p.combineProgress += dt / 0.55
          } else if (p.target) {
            const dx = p.target.x - p.x
            const dy = p.target.y - p.y
            const dist = Math.hypot(dx, dy)
            if (dist < 25) p.target = undefined
            else {
              p.vx += (dx / dist) * 120 * dt
              p.vy += (dy / dist) * 120 * dt
            }
          } else {
            p.vx += (Math.random() - 0.5) * 110 * dt
            p.vy += (Math.random() - 0.5) * 110 * dt
            p.vx *= 0.94
            p.vy *= 0.94
            p.x += p.vx * dt
            p.y += p.vy * dt
            if (p.x < beakerLeft + ION_R + 2) { p.x = beakerLeft + ION_R + 2; p.vx *= -0.5 }
            if (p.x > beakerRight - ION_R - 2) { p.x = beakerRight - ION_R - 2; p.vx *= -0.5 }
            if (p.y < waterTop + ION_R) { p.y = waterTop + ION_R; p.vy = Math.abs(p.vy) * 0.4 }
            if (p.y > beakerBot - ION_R - 2) { p.y = beakerBot - ION_R - 2; p.vy = -Math.abs(p.vy) * 0.4 }
          }
        }

        // Finaliser les combinaisons
        const survivors: P[] = []
        const consumed = new Set<P>()
        for (const p of parts) {
          if (consumed.has(p)) continue
          if (p.combiningWith && p.combineProgress >= 1) {
            const other = p.combiningWith
            consumed.add(p); consumed.add(other)
            // Flash H2O au centre
            combos.push({ x: (p.x + other.x) / 2, y: (p.y + other.y) / 2, age: 0 })
            if (!isStrong) {
              // Faible : HA + OH- -> A- + H2O ; on garde A- dans la solution
              const target = randomScatterTarget()
              survivors.push({
                x: p.x, y: p.y,
                vx: (Math.random() - 0.5) * 60,
                vy: (Math.random() - 0.5) * 60,
                kind: 'A',
                combineProgress: 0,
                target,
                neutralizable: false,
              })
            }
            // En mode strong, H+ + OH- -> H2O ; rien à ajouter (les ions disparaissent)
            continue
          }
          survivors.push(p)
        }
        parts = survivors

        // Update flashes H2O
        combos = combos.filter(c => c.age < 0.8)
        for (const c of combos) c.age += dt

        // Dessin particules
        for (const p of parts) {
          if (p.combineProgress > 0) {
            ctx.globalAlpha = Math.max(0.2, 1 - p.combineProgress * 0.5)
          }
          if (p.kind === 'ACID') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, ACID_R)
            g.addColorStop(0, '#ffffff')
            g.addColorStop(0.5, acidColor)
            g.addColorStop(1, acidColor)
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, ACID_R, 0, Math.PI * 2); ctx.fill()
            ctx.strokeStyle = 'rgba(0,0,0,0.4)'
            ctx.lineWidth = 0.8
            ctx.beginPath(); ctx.arc(p.x, p.y, ACID_R, 0, Math.PI * 2); ctx.stroke()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 10px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText(acidLabel, p.x, p.y)
          } else if (p.kind === 'OH') {
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
            ctx.fillText('OH⁻', p.x, p.y)
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
            ctx.fillText('A⁻', p.x, p.y)
          } else if (p.kind === 'SPEC_NA') {
            ctx.fillStyle = 'rgba(255, 138, 138, 0.55)'
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 8px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Na⁺', p.x, p.y)
          } else if (p.kind === 'SPEC_CL') {
            ctx.fillStyle = 'rgba(127, 255, 170, 0.4)'
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 8px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('Cl⁻', p.x, p.y)
          }
          ctx.globalAlpha = 1
        }
        ctx.textBaseline = 'alphabetic'

        // Flashes H2O au point de combinaison
        for (const c of combos) {
          const k = c.age / 0.8
          const r = 10 + k * 18
          ctx.strokeStyle = `rgba(100, 200, 255, ${1 - k})`
          ctx.lineWidth = 2
          ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, Math.PI * 2); ctx.stroke()
          if (k < 0.5) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 - k})`
            ctx.font = 'bold 11px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H₂O', c.x, c.y)
          }
        }
        ctx.textBaseline = 'alphabetic'

        // Jauge de pH
        const pH = frozen
          ? (isStrong ? 7.0 : 8.7)
          : Math.max(2, 7 - acidCount * 0.5 + ohRemain * 0.3)
        drawPHGauge(ctx, w - 50, h * 0.30, 18, h * 0.45, pH)

        // Bilan
        const px0 = 16, py0 = h - 170
        ctx.fillStyle = 'rgba(10,14,26,0.82)'
        ctx.fillRect(px0 - 6, py0 - 6, 220, 135)
        ctx.strokeStyle = 'rgba(255,255,255,0.22)'
        ctx.lineWidth = 1
        ctx.strokeRect(px0 - 6, py0 - 6, 220, 135)
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
        line(`${acidLabel} restants : ${acidCount}`, acidColor)
        line(`OH⁻ en attente : ${ohRemain}`, '#7fffaa')
        if (!isStrong) line(`A⁻ formés : ${aCount}`, '#7fffaa')
        line(`pH ≈ ${pH.toFixed(1)}`, pH < 7 ? '#ff7777' : pH > 7 ? '#c8a8ff' : '#7fffaa')

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: acidColor, label: `${acidLabel} (${isStrong ? 'acide fort' : 'acide faible'})` },
          { color: '#7fffaa', label: 'OH⁻ (base forte ajoutée)' },
          { color: '#64c8ff', label: 'H₂O (formé par neutralisation)', shape: 'bubble' },
          ...(isStrong
            ? [{ color: '#ff8a8a', label: 'Na⁺ / Cl⁻ (spectateurs)' as string }]
            : [{ color: '#7fffaa', label: 'A⁻ (base conjuguée, basique)' as string }]),
        ])
        drawCycleCounter(ctx, w - 80, h - 30, cycle, MAX_CYCLES, 'Versement')

        // Équation + statut
        const eqStr = isStrong
          ? 'H⁺ + OH⁻  ->  H₂O   (sel neutre Na⁺ Cl⁻)'
          : 'HA + OH⁻  ->  A⁻ + H₂O   (sel basique)'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(eqStr, w / 2, h - 32)
        const status = frozen
          ? (isStrong
              ? `Neutralisation totale - pH = 7,0 (sel neutre)`
              : `Sel basique : A⁻ rend la solution basique (pH ≈ 8,7), ${acidCount} HA résiduels`)
          : (isStrong
              ? `Titrage en cours - chaque H⁺ rencontré est neutralisé par un OH⁻`
              : `Titrage en cours - les OH⁻ neutralisent les HA, mais A⁻ s'accumule (basique)`)
        ctx.fillStyle = frozen ? (isStrong ? '#7fffaa' : '#c8a8ff') : 'rgba(255,255,255,0.55)'
        ctx.font = '11px sans-serif'
        ctx.fillText(status, w / 2, h - 14)
        ctx.textAlign = 'start'
      }
    }
  }, [mode])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawPHGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pH: number) {
  const stops: [number, string][] = [
    [0,  '#d62828'],
    [3,  '#f77f00'],
    [6,  '#fcbf49'],
    [7,  '#90be6d'],
    [8,  '#43aa8b'],
    [11, '#577590'],
    [14, '#3a0ca3'],
  ]
  const grad = ctx.createLinearGradient(0, y, 0, y + h)
  for (const [p, c] of stops) grad.addColorStop(p / 14, c)
  ctx.fillStyle = grad
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)
  const pY = y + (pH / 14) * h
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#0a0e1a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - 8, pY)
  ctx.lineTo(x, pY - 6)
  ctx.lineTo(x, pY + 6)
  ctx.closePath()
  ctx.fill(); ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillText(`pH ${pH.toFixed(1)}`, x - 14, pY)
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText('0', x + w / 2, y - 18)
  ctx.textBaseline = 'bottom'
  ctx.fillText('14', x + w / 2, y + h + 18)
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
}
