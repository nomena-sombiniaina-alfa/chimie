import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Morceau de zinc qui s'amenuise réellement dans l'acide. Les bulles d'H2
// jaillissent du métal, montent à la surface et éclatent. Le zinc rétrécit
// au fil du temps jusqu'à disparaître, puis la séquence recommence.
export default function SubstitutionDiagram() {
  const canvasRef = useCanvas(() => {
    type Bubble = { x: number; y: number; r: number; vy: number; vx: number; surfacing: number }
    let bubbles: Bubble[] = []
    let nextBubble = 0
    let znSize = 1.0    // 1 = entier, 0 = disparu
    let cycle = 1
    const MAX_CYCLES = 3
    let consumed = false
    let pauseAfter = 0
    let W = 0, H = 0
    let beakerTop = 0, beakerBot = 0, beakerLeft = 0, beakerRight = 0
    let waterTop = 0
    const ZN_INITIAL_W = 90
    const ZN_INITIAL_H = 30

    function build(w: number, h: number) {
      W = w; H = h
      beakerTop = h * 0.12
      beakerBot = h * 0.78
      beakerLeft = w * 0.18
      beakerRight = w * 0.82
      waterTop = beakerTop + 22
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)

        // Cycle : zinc rétrécit. À épuisement on relance MAX_CYCLES fois.
        if (!consumed) {
          znSize -= dt * (1 / 12)
          if (znSize <= 0.05) {
            znSize = 0.05
            consumed = true
            pauseAfter = 0
          }
        } else {
          pauseAfter += dt
          if (pauseAfter > 2.5) {
            if (cycle < MAX_CYCLES) {
              cycle += 1
              znSize = 1.0
              bubbles = []
              consumed = false
              pauseAfter = 0
            }
            // sinon : reste épuisé en permanence (3 cycles atteints)
          }
        }

        // Bécher
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(beakerLeft, beakerTop); ctx.lineTo(beakerLeft, beakerBot)
        ctx.lineTo(beakerRight, beakerBot); ctx.lineTo(beakerRight, beakerTop)
        ctx.stroke()
        // Solution HCl (vert très pâle)
        ctx.fillStyle = 'rgba(120, 220, 120, 0.10)'
        ctx.fillRect(beakerLeft + 1, waterTop, beakerRight - beakerLeft - 1, beakerBot - waterTop - 1)
        // Surface ondulant légèrement
        ctx.strokeStyle = 'rgba(180, 240, 180, 0.5)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let x = beakerLeft; x <= beakerRight; x += 4) {
          const y = waterTop + Math.sin(x * 0.08 + t * 3) * 1.5
          if (x === beakerLeft) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()

        // Ions H+ et Cl- en fond
        for (let i = 0; i < 18; i++) {
          const px = beakerLeft + 12 + ((i * 37) % (beakerRight - beakerLeft - 24))
          const py = waterTop + 14 + Math.floor(i / 8) * 22 + Math.sin(t * 2 + i) * 3
          ctx.fillStyle = 'rgba(255, 107, 107, 0.45)'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('H⁺', px, py)
          ctx.fillStyle = 'rgba(127, 255, 170, 0.4)'
          ctx.fillText('Cl⁻', px + 22, py + 12)
        }

        // Bloc de zinc qui rétrécit
        const cx = w / 2
        const cy = beakerBot - ZN_INITIAL_H * znSize / 2 - 4
        const zw = ZN_INITIAL_W * znSize
        const zh = ZN_INITIAL_H * znSize
        // Bordure granuleuse simulée (le zinc s'effrite)
        const ironGrad = ctx.createLinearGradient(0, cy - zh / 2, 0, cy + zh / 2)
        ironGrad.addColorStop(0, '#bcc3d1')
        ironGrad.addColorStop(1, '#7a8092')
        ctx.fillStyle = ironGrad
        ctx.fillRect(cx - zw / 2, cy - zh / 2, zw, zh)
        // Effet rongé : petites encoches aléatoires sur les bords
        ctx.fillStyle = 'rgba(120, 220, 120, 0.12)'
        for (let i = 0; i < 8; i++) {
          const ex = cx - zw / 2 + (i / 7) * zw + Math.sin(t * 2 + i) * 2
          const ey = cy - zh / 2 - 2
          ctx.beginPath(); ctx.arc(ex, ey, 1.5 + Math.random() * 1.5, 0, Math.PI * 2); ctx.fill()
        }
        // Label
        if (zw > 30) {
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('Zn', cx, cy)
        }

        // Ions Zn²⁺ qui partent du métal (petits glyphes)
        for (let i = 0; i < 4; i++) {
          const off = (t * 30 + i * 90) % 120
          if (off < 100 && zw > 20) {
            const ix = cx - zw / 2 - 8 - off * 0.3
            const iy = cy - zh / 4 + (i - 1.5) * 15
            const fade = 1 - off / 100
            ctx.fillStyle = `rgba(221, 226, 235, ${fade})`
            ctx.beginPath(); ctx.arc(ix, iy, 6, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = `rgba(0, 0, 0, ${fade})`
            ctx.font = 'bold 8px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('Zn²⁺', ix, iy)
          }
        }

        // Spawn de bulles depuis le bloc zinc
        nextBubble += dt
        if (nextBubble > 0.05 && zw > 15) {
          nextBubble = 0
          const bubblesPerSpawn = 1 + Math.floor(Math.random() * 2)
          for (let i = 0; i < bubblesPerSpawn; i++) {
            bubbles.push({
              x: cx + (Math.random() - 0.5) * zw,
              y: cy - zh / 2 + (Math.random() - 0.5) * zh / 2,
              r: 2 + Math.random() * 4,
              vy: 40 + Math.random() * 50,
              vx: (Math.random() - 0.5) * 15,
              surfacing: 0,
            })
          }
        }

        // Animation des bulles
        const alive: Bubble[] = []
        for (const b of bubbles) {
          if (b.surfacing > 0) {
            b.surfacing += dt
            if (b.surfacing > 0.3) continue
            // Bulle qui éclate à la surface (cercle qui s'agrandit et s'estompe)
            const popK = b.surfacing / 0.3
            ctx.strokeStyle = `rgba(200, 230, 255, ${1 - popK})`
            ctx.lineWidth = 1.5
            ctx.beginPath(); ctx.arc(b.x, b.y, b.r * (1 + popK * 2), 0, Math.PI * 2); ctx.stroke()
            alive.push(b)
            continue
          }
          b.x += b.vx * dt
          b.y -= b.vy * dt
          b.vx += (Math.random() - 0.5) * 30 * dt
          b.vx *= 0.98
          if (b.y <= waterTop + 4) {
            b.surfacing = 0.001
            b.y = waterTop + 4
          }
          // Dessin bulle
          ctx.fillStyle = 'rgba(220, 240, 255, 0.7)'
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
          ctx.strokeStyle = 'rgba(255,255,255,0.8)'
          ctx.lineWidth = 0.7
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.stroke()
          if (b.r > 4) {
            ctx.fillStyle = 'rgba(255,255,255,0.9)'
            ctx.font = 'bold 6px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H₂', b.x, b.y)
          }
          alive.push(b)
        }
        bubbles = alive

        // Indicateur de masse restante de Zn
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`Zn restant : ${Math.round(znSize * 100)} %`, beakerLeft + 6, beakerTop - 8)
        ctx.textAlign = 'right'
        ctx.fillText(`H₂ libéré : ${bubbles.length} bulles`, beakerRight - 6, beakerTop - 8)

        // Légende
        drawLegend(ctx, 10, 10, [
          { color: '#9aa1b3', label: 'Zn (métal qui s\'effrite)', shape: 'square' },
          { color: '#ff6b6b', label: 'H⁺ (acide en solution)' },
          { color: '#7fffaa', label: 'Cl⁻ (anion spectateur)' },
          { color: '#dde2eb', label: 'Zn²⁺ (libéré en solution)' },
          { color: '#dcf0ff', label: 'H₂ (gaz qui s\'échappe)', shape: 'bubble' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Morceau')

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Zn + 2 HCl  ->  ZnCl₂ + H₂ ↑', w / 2, h - 50)
        ctx.fillStyle = consumed && cycle >= MAX_CYCLES ? '#ffcc44' : 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText(
          consumed && cycle >= MAX_CYCLES
            ? 'Tout le zinc disponible a été consommé - réaction terminée'
            : 'Le zinc cède 2 e⁻ et passe en solution. Les H⁺ captent les e⁻ et s\'échappent en H₂ gazeux.',
          w / 2, h - 28)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
