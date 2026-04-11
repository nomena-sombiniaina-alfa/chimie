import { useCanvas } from '../../hooks/useCanvas'

// Schéma : ions Ag+ et Cl- en solution qui forment des AgCl tombant au fond
export default function PrecipitationDiagram() {
  const canvasRef = useCanvas(() => {
    type Ion = { x: number; y: number; vx: number; vy: number; type: 'Ag' | 'Cl' }
    type Precipitate = { x: number; y: number; vy: number; settled: boolean; r: number }
    let ions: Ion[] = []
    let precipitates: Precipitate[] = []
    let W = 0, H = 0
    let initialized = false

    function build(w: number, h: number) {
      W = w; H = h
      ions = []
      precipitates = []
      for (let i = 0; i < 25; i++) {
        ions.push({
          x: 30 + Math.random() * (w - 60),
          y: h * 0.18 + Math.random() * (h * 0.55),
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          type: 'Ag',
        })
      }
      for (let i = 0; i < 25; i++) {
        ions.push({
          x: 30 + Math.random() * (w - 60),
          y: h * 0.18 + Math.random() * (h * 0.55),
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          type: 'Cl',
        })
      }
      initialized = true
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt) => {
        if (!initialized || W !== w || H !== h) build(w, h)

        // Cuve
        const top = h * 0.15, bot = h * 0.78
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(w * 0.15, top); ctx.lineTo(w * 0.15, bot)
        ctx.lineTo(w * 0.85, bot); ctx.lineTo(w * 0.85, top)
        ctx.stroke()
        ctx.fillStyle = 'rgba(100, 180, 240, 0.06)'
        ctx.fillRect(w * 0.15, h * 0.20, w * 0.70, bot - h * 0.20)

        // Déplacer les ions et détecter les collisions Ag+...Cl-
        for (const ion of ions) {
          ion.vx += (Math.random() - 0.5) * 30 * dt
          ion.vy += (Math.random() - 0.5) * 30 * dt
          ion.vx *= 0.99
          ion.vy *= 0.99
          ion.x += ion.vx * dt
          ion.y += ion.vy * dt
          // Bords
          if (ion.x < w * 0.17) { ion.x = w * 0.17; ion.vx *= -0.7 }
          if (ion.x > w * 0.83) { ion.x = w * 0.83; ion.vx *= -0.7 }
          if (ion.y < h * 0.20) { ion.y = h * 0.20; ion.vy *= -0.7 }
          if (ion.y > bot - 4)  { ion.y = bot - 4;  ion.vy *= -0.7 }
        }

        // Collisions
        const consumed = new Set<number>()
        for (let i = 0; i < ions.length; i++) {
          if (consumed.has(i)) continue
          const a = ions[i]
          for (let j = i + 1; j < ions.length; j++) {
            if (consumed.has(j)) continue
            const b = ions[j]
            if (a.type === b.type) continue
            const dx = a.x - b.x, dy = a.y - b.y
            if (dx * dx + dy * dy < 14 * 14) {
              consumed.add(i); consumed.add(j)
              precipitates.push({
                x: (a.x + b.x) / 2,
                y: (a.y + b.y) / 2,
                vy: 0,
                settled: false,
                r: 5 + Math.random() * 2,
              })
              break
            }
          }
        }
        ions = ions.filter((_, i) => !consumed.has(i))

        // Précipité tombe et s'empile
        const floor = bot - 4
        for (let i = 0; i < precipitates.length; i++) {
          const p = precipitates[i]
          if (p.settled) continue
          p.vy += 80 * dt
          p.y += p.vy * dt
          let rest = floor - p.r
          for (const o of precipitates) {
            if (!o.settled || o === p) continue
            const dx = p.x - o.x
            if (Math.abs(dx) < (p.r + o.r) * 0.9) {
              const top2 = o.y - (p.r + o.r) * 0.9
              if (top2 < rest) rest = top2
            }
          }
          if (p.y >= rest) { p.y = rest; p.vy = 0; p.settled = true }
        }

        // Dessiner ions
        for (const ion of ions) {
          const color = ion.type === 'Ag' ? '#bfd8ff' : '#9be8a3'
          const glow = ion.type === 'Ag' ? 'rgba(100, 160, 255, 0.5)' : 'rgba(120, 220, 140, 0.5)'
          ctx.shadowColor = glow
          ctx.shadowBlur = 6
          ctx.fillStyle = color
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 5, 0, Math.PI * 2); ctx.fill()
          ctx.shadowBlur = 0
          ctx.fillStyle = '#0c1424'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ion.type === 'Ag' ? '+' : '-', ion.x, ion.y)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        // Dessiner précipité (AgCl blanc)
        for (const p of precipitates) {
          const g = ctx.createRadialGradient(p.x - 1, p.y - 1, 0.5, p.x, p.y, p.r)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(1, '#a8b6cc')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
        }

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Ag⁺(aq) + Cl⁻(aq)  →  AgCl(s) ↓', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(`${precipitates.length} précipités formés · ${ions.length} ions restants`, w / 2, h - 25)
        ctx.textAlign = 'start'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
