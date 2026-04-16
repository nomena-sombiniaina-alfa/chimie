import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : pile Daniell avec circuit externe et ampoule allumée.
// Décharge progressive de la pile sur MAX_CYCLES recharges; à plat l'ampoule s'éteint.
export default function BatteryDiagram() {
  const canvasRef = useCanvas(() => {
    const CYCLE = 12  // s pour une décharge complète
    const MAX_CYCLES = 3
    let cycle = 1
    let cycleTime = 0
    let pauseAfter = 0
    let drained = false
    return {
      draw: (ctx, w, h, dt, t) => {
        if (!drained) {
          cycleTime += dt
          if (cycleTime >= CYCLE) {
            if (cycle >= MAX_CYCLES) {
              drained = true
            } else {
              pauseAfter += dt
              if (pauseAfter > 1.5) {
                cycle += 1
                cycleTime = 0
                pauseAfter = 0
              }
            }
          }
        }
        const charge = drained ? 0 : Math.max(0, 1 - cycleTime / CYCLE)

        const cx = w / 2
        const beakerTop = h * 0.32, beakerBot = h * 0.68
        const leftX = w * 0.28, rightX = w * 0.72

        // Béchers (deux compartiments)
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.lineWidth = 2
        drawBeaker(ctx, leftX, beakerTop, beakerBot, 'rgba(150,180,220,0.10)')
        drawBeaker(ctx, rightX, beakerTop, beakerBot, `rgba(60, 140, 220, ${0.18 * charge + 0.04})`)

        // Pont salin (en haut)
        const bridgeY = beakerTop - 12
        ctx.fillStyle = 'rgba(200, 200, 100, 0.25)'
        ctx.fillRect(leftX - 50, bridgeY - 12, rightX - leftX + 100, 14)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = 'bold 10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('pont salin (KNO₃)', cx, bridgeY - 2)

        // Électrodes (la Zn rétrécit légèrement avec la décharge)
        const znShrink = 1 - (1 - charge) * 0.35
        const znH = (beakerBot - beakerTop + 10) * znShrink
        ctx.fillStyle = '#dde2eb'
        ctx.fillRect(leftX - 6, beakerTop - 20, 12, znH)
        ctx.fillStyle = '#c88033'
        ctx.fillRect(rightX - 6, beakerTop - 20, 12, beakerBot - beakerTop + 10)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.fillText('Zn', leftX, beakerTop - 28)
        ctx.fillText('Cu', rightX, beakerTop - 28)

        // Circuit externe (fil) avec ampoule au-dessus
        const wireY = h * 0.18
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(leftX, beakerTop - 20); ctx.lineTo(leftX, wireY)
        ctx.lineTo(cx - 20, wireY)
        ctx.moveTo(cx + 20, wireY); ctx.lineTo(rightX, wireY)
        ctx.lineTo(rightX, beakerTop - 20)
        ctx.stroke()
        // Ampoule (luminosité proportionnelle à la charge)
        const onIntensity = drained ? 0 : (0.6 + 0.4 * Math.sin(t * 3)) * charge
        ctx.fillStyle = `rgba(255, 230, 80, ${onIntensity * 0.6})`
        ctx.beginPath(); ctx.arc(cx, wireY, 18, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = drained ? '#666' : '#ffcc44'
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.arc(cx, wireY, 14, 0, Math.PI * 2); ctx.stroke()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 10px sans-serif'
        ctx.fillText('💡', cx, wireY)

        // Électrons qui circulent dans le fil (vitesse propornelle à charge)
        if (!drained) {
          const speed = 0.5 * (0.4 + 0.6 * charge)
          for (let i = 0; i < 5; i++) {
            const k = ((t * speed + i * 0.2) % 1)
            let ex = 0, ey = 0
            if (k < 0.25) {
              ex = leftX
              ey = (beakerTop - 20) + (wireY - (beakerTop - 20)) * (k / 0.25 - 1) * -1
            } else if (k < 0.5) {
              ex = leftX + (cx - 20 - leftX) * ((k - 0.25) / 0.25)
              ey = wireY
            } else if (k < 0.75) {
              ex = cx + 20 + (rightX - cx - 20) * ((k - 0.5) / 0.25)
              ey = wireY
            } else {
              ex = rightX
              ey = wireY + ((beakerTop - 20) - wireY) * ((k - 0.75) / 0.25)
            }
            ctx.fillStyle = `rgba(155, 224, 255, ${0.4 + 0.6 * charge})`
            ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill()
          }
        }
        ctx.fillStyle = 'rgba(155, 224, 255, 0.7)'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('e⁻ ->', leftX + 35, wireY - 8)

        // Annotations potentiels
        ctx.fillStyle = '#ff7777'
        ctx.font = 'bold 14px sans-serif'
        ctx.fillText('-', leftX, beakerBot + 18)
        ctx.fillStyle = '#7fffaa'
        ctx.fillText('+', rightX, beakerBot + 18)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText('anode (oxydation)', leftX, beakerBot + 34)
        ctx.fillText('cathode (réduction)', rightX, beakerBot + 34)

        // Jauge de charge à droite
        const gx = w - 28, gy = h * 0.35, gh = h * 0.30
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(gx, gy, 12, gh)
        const colCharge = charge > 0.5 ? '#7fffaa' : charge > 0.2 ? '#ffcc44' : '#ff7777'
        ctx.fillStyle = colCharge
        ctx.fillRect(gx, gy + gh * (1 - charge), 12, gh * charge)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '9px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${Math.round(charge * 100)}%`, gx + 6, gy - 4)

        // Légende + cycle
        drawLegend(ctx, 10, 10, [
          { color: '#dde2eb', label: 'Zn (anode, s\'oxyde)', shape: 'square' },
          { color: '#c88033', label: 'Cu (cathode, dépôt)', shape: 'square' },
          { color: '#9be0ff', label: 'e⁻ (circulation externe)' },
          { color: '#ffe650', label: 'Ampoule (énergie utilisable)' },
          { color: '#c8c864', label: 'Pont salin (équilibrage)', shape: 'square' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, MAX_CYCLES, 'Recharge')

        // Légende équation
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Zn + Cu²⁺  ->  Zn²⁺ + Cu   (pile Daniell)', w / 2, h - 36)
        ctx.fillStyle = drained ? '#ffcc44' : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(
          drained
            ? 'Pile à plat - réactifs consommés, plus de courant'
            : 'E° = +1,10 V - énergie chimique convertie en courant électrique',
          w / 2, h - 16)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}

function drawBeaker(ctx: CanvasRenderingContext2D, cx: number, top: number, bot: number, fillColor: string) {
  const wB = 90
  ctx.beginPath()
  ctx.moveTo(cx - wB / 2, top - 5)
  ctx.lineTo(cx - wB / 2, bot)
  ctx.lineTo(cx + wB / 2, bot)
  ctx.lineTo(cx + wB / 2, top - 5)
  ctx.stroke()
  ctx.fillStyle = fillColor
  ctx.fillRect(cx - wB / 2 + 1, top, wB - 2, bot - top - 1)
}
