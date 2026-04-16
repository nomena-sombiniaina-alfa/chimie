import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Scénario saturation : on continue d'ajouter du sel dans une solution déjà
// très concentrée. Une partie se dissout, le reste cristallise au fond.
// On arrête après MAX_SETTLED amas tombés, puis on relance.
export default function PrecipitationDiagram() {
  const canvasRef = useCanvas(() => {
    type Ion = { x: number; y: number; vx: number; vy: number; kind: '+' | '-' }
    type Crystal = { x: number; y: number; vy: number; size: number; settled: boolean; dissolving: number }
    let ions: Ion[] = []
    let crystals: Crystal[] = []
    let nextDrop = 0
    let cycle = 1
    let pauseAfterFull = 0
    let W = 0, H = 0
    let beakerTop = 0, beakerBot = 0, beakerLeft = 0, beakerRight = 0
    let waterTop = 0

    const SAT = 70                // seuil de saturation en ions
    const DROP_INTERVAL = 1.6     // s entre deux ajouts de cristal
    const ION_PER_CRYSTAL = 10
    const MAX_SETTLED = 4         // arrêt après 4 amas au fond

    function build(w: number, h: number) {
      W = w; H = h
      beakerTop = h * 0.16
      beakerBot = h * 0.78
      beakerLeft = w * 0.30
      beakerRight = w * 0.70
      waterTop = beakerTop + 18
      ions = []
      crystals = []
      // Pré-remplir avec beaucoup d'ions déjà dissous (~ saturation)
      for (let i = 0; i < 55; i++) {
        const isPlus = Math.random() < 0.5
        ions.push({
          x: beakerLeft + 8 + Math.random() * (beakerRight - beakerLeft - 16),
          y: waterTop + 4 + Math.random() * (beakerBot - waterTop - 20),
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          kind: isPlus ? '+' : '-',
        })
      }
      nextDrop = 0
    }

    function dropCrystal() {
      crystals.push({
        x: beakerLeft + 30 + Math.random() * (beakerRight - beakerLeft - 60),
        y: beakerTop - 30,
        vy: 0,
        size: 12 + Math.random() * 6,
        settled: false,
        dissolving: 0,
      })
    }

    function spawnIonsAt(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = 60 + Math.random() * 80
        ions.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          kind: Math.random() < 0.5 ? '+' : '-',
        })
      }
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)

        // Bécher + eau (teinte plus trouble si conc augmente)
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(beakerLeft, beakerTop); ctx.lineTo(beakerLeft, beakerBot)
        ctx.lineTo(beakerRight, beakerBot); ctx.lineTo(beakerRight, beakerTop)
        ctx.stroke()
        const conc = Math.min(1, ions.length / SAT)
        const cloudy = Math.floor(conc * 30)
        ctx.fillStyle = `rgba(${100 + cloudy}, ${180 + cloudy * 0.5}, 240, 0.${10 + Math.floor(conc * 6)})`
        ctx.fillRect(beakerLeft + 1, waterTop, beakerRight - beakerLeft - 1, beakerBot - waterTop - 1)
        ctx.strokeStyle = 'rgba(140, 200, 255, 0.5)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(beakerLeft + 1, waterTop); ctx.lineTo(beakerRight - 1, waterTop); ctx.stroke()

        // Salière au-dessus
        const shakerX = (beakerLeft + beakerRight) / 2
        const shakerY = beakerTop - 60 + Math.sin(t * 1.4) * 3
        ctx.fillStyle = '#aab4c5'
        ctx.fillRect(shakerX - 22, shakerY, 44, 28)
        ctx.fillStyle = '#6d7484'
        ctx.fillRect(shakerX - 22, shakerY, 44, 6)
        ctx.fillStyle = '#0a0e1a'
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath(); ctx.arc(shakerX + i * 10, shakerY + 3, 1.6, 0, Math.PI * 2); ctx.fill()
        }
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 8px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('NaCl', shakerX, shakerY + 18)

        // Compteur d'amas au fond + arrêt/reset
        const settledCountNow = crystals.filter(c => c.settled).length
        if (settledCountNow >= MAX_SETTLED) {
          pauseAfterFull += dt
          if (pauseAfterFull > 2.5) {
            build(w, h)
            cycle += 1
            pauseAfterFull = 0
          }
        } else {
          // Spawn périodique de cristaux uniquement tant que la limite n'est pas atteinte
          nextDrop += dt
          if (nextDrop > DROP_INTERVAL) {
            nextDrop = 0
            dropCrystal()
          }
        }

        // Mouvement des ions
        for (const ion of ions) {
          ion.vx += (Math.random() - 0.5) * 50 * dt
          ion.vy += (Math.random() - 0.5) * 50 * dt
          ion.vx *= 0.99
          ion.vy *= 0.99
          ion.x += ion.vx * dt
          ion.y += ion.vy * dt
          if (ion.x < beakerLeft + 5) { ion.x = beakerLeft + 5; ion.vx *= -0.7 }
          if (ion.x > beakerRight - 5) { ion.x = beakerRight - 5; ion.vx *= -0.7 }
          if (ion.y < waterTop + 3) { ion.y = waterTop + 3; ion.vy *= -0.7 }
          if (ion.y > beakerBot - 4) { ion.y = beakerBot - 4; ion.vy *= -0.7 }
        }

        // Cristaux : chute, dissolution ou sédimentation
        for (const c of crystals) {
          if (c.dissolving > 0) { c.dissolving += dt; continue }
          if (c.settled) continue
          c.vy += 80 * dt
          c.y += c.vy * dt
          if (c.y >= waterTop + c.size / 2 && c.y < waterTop + c.size / 2 + 20 && !c.settled) {
            if (ions.length < SAT) {
              c.dissolving = 0.001
              spawnIonsAt(c.x, c.y, ION_PER_CRYSTAL)
              continue
            }
          }
          let rest = beakerBot - c.size / 2 - 2
          for (const o of crystals) {
            if (o === c || !o.settled) continue
            const dx = c.x - o.x
            if (Math.abs(dx) < (c.size + o.size) * 0.55) {
              const top = o.y - (c.size + o.size) * 0.5
              if (top < rest) rest = top
            }
          }
          if (c.y >= rest) { c.y = rest; c.vy = 0; c.settled = true }
        }
        crystals = crystals.filter(c => c.dissolving < 0.6)

        // Dessiner ions
        for (const ion of ions) {
          ctx.fillStyle = ion.kind === '+' ? '#ff8a8a' : '#7fffaa'
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 3.5, 0, Math.PI * 2); ctx.fill()
        }

        // Dessiner cristaux
        for (const c of crystals) {
          const k = c.dissolving > 0 ? Math.max(0, 1 - c.dissolving / 0.6) : 1
          if (k <= 0) continue
          ctx.save()
          ctx.globalAlpha = k
          ctx.translate(c.x, c.y)
          ctx.rotate((c.x + c.y) * 0.01)
          const g = ctx.createLinearGradient(-c.size / 2, -c.size / 2, c.size / 2, c.size / 2)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(1, '#aab4c5')
          ctx.fillStyle = g
          ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size)
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'
          ctx.lineWidth = 1
          ctx.strokeRect(-c.size / 2, -c.size / 2, c.size, c.size)
          ctx.restore()
        }

        // Jauge de saturation à droite
        const gaugeX = beakerRight + 24
        const gaugeY = waterTop
        const gaugeH = beakerBot - waterTop
        const gaugeW = 14
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH)
        const fillH = gaugeH * conc
        const colGauge = conc < 0.7 ? '#7fffaa' : conc < 1 ? '#ffcc44' : '#ff7777'
        ctx.fillStyle = colGauge
        ctx.fillRect(gaugeX, gaugeY + gaugeH - fillH, gaugeW, fillH)
        ctx.strokeStyle = '#ff7777'
        ctx.setLineDash([3, 3])
        ctx.beginPath(); ctx.moveTo(gaugeX - 4, gaugeY); ctx.lineTo(gaugeX + gaugeW + 4, gaugeY); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#ff7777'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('saturation', gaugeX + gaugeW + 6, gaugeY + 4)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '10px sans-serif'
        ctx.fillText(`${Math.round(conc * 100)} %`, gaugeX + gaugeW + 6, gaugeY + gaugeH - 4)

        // Légende + compteur de cycle (en haut, hors du bécher)
        drawLegend(ctx, 10, 10, [
          { color: '#ff8a8a', label: 'Na⁺ (cation dissous)' },
          { color: '#7fffaa', label: 'Cl⁻ (anion dissous)' },
          { color: '#cccccc', label: 'NaCl (cristal solide)', shape: 'block' },
          { color: '#aab4c5', label: 'Salière (ajout continu)', shape: 'square' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, undefined, 'Expérience nº')

        // Statut bas
        const settledCount = crystals.filter(c => c.settled).length
        const status = settledCount >= MAX_SETTLED
          ? `Limite atteinte : ${MAX_SETTLED} amas formés - réinitialisation imminente`
          : conc >= 1
            ? `Solution saturée : le sel ajouté cristallise au fond (${settledCount}/${MAX_SETTLED} amas)`
            : `Solution sous-saturée : le sel se dissout encore (${ions.length}/${SAT} ions)`
        ctx.fillStyle = settledCount >= MAX_SETTLED ? '#ffcc44' : conc >= 1 ? '#ff9999' : '#7fffaa'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabetic'
        ctx.fillText(status, w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText("NaCl + H₂O  ->  Na⁺ + Cl⁻  (jusqu'à saturation, ensuite NaCl(s) ↓)", w / 2, h - 30)

        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
