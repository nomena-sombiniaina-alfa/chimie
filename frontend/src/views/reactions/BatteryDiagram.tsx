import { useCanvas } from '../../hooks/useCanvas'

// Schéma : pile Daniell avec circuit externe et ampoule allumée
export default function BatteryDiagram() {
  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      const cx = w / 2
      const beakerTop = h * 0.32, beakerBot = h * 0.68
      const leftX = w * 0.28, rightX = w * 0.72

      // Béchers (deux compartiments)
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'
      ctx.lineWidth = 2
      drawBeaker(ctx, leftX, beakerTop, beakerBot, 'rgba(150,180,220,0.10)')
      drawBeaker(ctx, rightX, beakerTop, beakerBot, 'rgba(60, 140, 220, 0.18)')

      // Pont salin (en haut)
      const bridgeY = beakerTop - 12
      ctx.fillStyle = 'rgba(200, 200, 100, 0.25)'
      ctx.fillRect(leftX - 50, bridgeY - 12, rightX - leftX + 100, 14)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = 'bold 10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('pont salin (KNO₃)', cx, bridgeY - 2)

      // Électrodes (bandes verticales)
      ctx.fillStyle = '#dde2eb'
      ctx.fillRect(leftX - 6, beakerTop - 20, 12, beakerBot - beakerTop + 10)
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
      // Ampoule
      const onIntensity = 0.6 + 0.4 * Math.sin(t * 3)
      ctx.fillStyle = `rgba(255, 230, 80, ${onIntensity * 0.6})`
      ctx.beginPath(); ctx.arc(cx, wireY, 18, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = '#ffcc44'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cx, wireY, 14, 0, Math.PI * 2); ctx.stroke()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 10px sans-serif'
      ctx.fillText('💡', cx, wireY)

      // Électrons qui circulent dans le fil
      for (let i = 0; i < 5; i++) {
        const k = ((t * 0.5 + i * 0.2) % 1)
        // Trajectoire : Zn -> haut -> centre -> haut -> Cu
        let ex = 0, ey = 0
        if (k < 0.25) {
          // Zn vertical vers haut
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
        ctx.fillStyle = '#9be0ff'
        ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill()
      }
      ctx.fillStyle = 'rgba(155, 224, 255, 0.7)'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('e⁻ →', leftX + 35, wireY - 8)

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

      // Légende
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 16px sans-serif'
      ctx.fillText('Zn + Cu²⁺  →  Zn²⁺ + Cu   (pile Daniell)', w / 2, h - 36)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText('E° = +1,10 V - énergie chimique convertie en courant électrique', w / 2, h - 16)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }), [])

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
