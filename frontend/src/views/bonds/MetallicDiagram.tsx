import { useCanvas } from '../../hooks/useCanvas'

// Schéma : réseau de cations Cu⁺ avec une "mer" d'électrons qui circule librement
export default function MetallicDiagram() {
  const canvasRef = useCanvas(() => {
    let electrons: Array<{ x: number; y: number; vx: number; vy: number }> = []
    let cations: Array<{ x: number; y: number }> = []
    let W = 0, H = 0

    function build(w: number, h: number) {
      W = w; H = h
      cations = []
      const cols = 7, rows = 4
      const padX = w * 0.12
      const padY = h * 0.25
      const stepX = (w - 2 * padX) / (cols - 1)
      const stepY = (h - padY - 100) / (rows - 1)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cations.push({ x: padX + c * stepX, y: padY + r * stepY })
        }
      }
      electrons = []
      for (let i = 0; i < 60; i++) {
        electrons.push({
          x: Math.random() * w,
          y: padY + Math.random() * (h - padY - 100),
          vx: (Math.random() - 0.5) * 80,
          vy: (Math.random() - 0.5) * 80,
        })
      }
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt) => {
        if (W !== w || H !== h) build(w, h)

        // Mer d'électrons en arrière-plan (nuage diffus)
        const grad = ctx.createLinearGradient(0, 80, 0, h - 80)
        grad.addColorStop(0, 'rgba(155, 224, 255, 0.04)')
        grad.addColorStop(0.5, 'rgba(155, 224, 255, 0.10)')
        grad.addColorStop(1, 'rgba(155, 224, 255, 0.04)')
        ctx.fillStyle = grad
        ctx.fillRect(0, 80, w, h - 180)

        // Cations en réseau
        for (const c of cations) {
          const g = ctx.createRadialGradient(c.x - 5, c.y - 5, 1, c.x, c.y, 18)
          g.addColorStop(0, '#ffd566')
          g.addColorStop(1, '#9c6515')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(c.x, c.y, 18, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#0a0e1a'
          ctx.font = 'bold 12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('Cu⁺', c.x, c.y)
        }

        // Électrons délocalisés qui circulent librement
        for (const e of electrons) {
          e.x += e.vx * dt
          e.y += e.vy * dt
          // Rebonds sur les bords de la "mer"
          if (e.x < 20)    { e.x = 20;    e.vx *= -1 }
          if (e.x > w - 20){ e.x = w - 20; e.vx *= -1 }
          if (e.y < 90)    { e.y = 90;    e.vy *= -1 }
          if (e.y > h - 100){ e.y = h - 100; e.vy *= -1 }
          // Évite les cations (repulsion molle)
          for (const c of cations) {
            const dx = e.x - c.x, dy = e.y - c.y
            const d2 = dx * dx + dy * dy
            if (d2 < 900) {
              const d = Math.sqrt(d2) || 1
              e.x += (dx / d) * 1.5
              e.y += (dy / d) * 1.5
            }
          }
          const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 5)
          g.addColorStop(0, '#9be0ff')
          g.addColorStop(1, 'rgba(80, 160, 240, 0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(e.x, e.y, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath(); ctx.arc(e.x, e.y, 1.5, 0, Math.PI * 2); ctx.fill()
        }

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText('Réseau de cations + mer d\'électrons délocalisés', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText('Les électrons libres expliquent conduction, malléabilité, et éclat métallique', w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
