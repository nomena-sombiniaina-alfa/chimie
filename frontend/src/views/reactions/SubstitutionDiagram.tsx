import { useCanvas } from '../../hooks/useCanvas'

// Schéma : Zn + 2 HCl → ZnCl2 + H2 (bulles de dihydrogène)
export default function SubstitutionDiagram() {
  const canvasRef = useCanvas(() => {
    type Bubble = { x: number; y: number; r: number; vy: number }
    let bubbles: Bubble[] = []

    return {
      draw: (ctx, w, h, dt, _t) => {
        const top = h * 0.18, bot = h * 0.72
        const cx = w / 2

        // Cuve
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(w * 0.18, top); ctx.lineTo(w * 0.18, bot)
        ctx.lineTo(w * 0.82, bot); ctx.lineTo(w * 0.82, top)
        ctx.stroke()

        // Solution HCl (légèrement verdâtre)
        ctx.fillStyle = 'rgba(120, 220, 120, 0.10)'
        ctx.fillRect(w * 0.18, top + 8, w * 0.82 - w * 0.18, bot - top - 8)

        // Morceau de zinc au fond
        ctx.fillStyle = '#aab4c5'
        ctx.fillRect(cx - 50, bot - 22, 100, 14)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 13px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Zn (solide)', cx, bot - 15)

        // Ions H+ et Cl- en solution
        for (let i = 0; i < 12; i++) {
          const x = w * 0.22 + (i % 6) * w * 0.10
          const y = top + 30 + Math.floor(i / 6) * 40
          ctx.fillStyle = 'rgba(255, 107, 107, 0.6)'
          ctx.font = 'bold 10px sans-serif'
          ctx.fillText('H⁺', x, y)
          ctx.fillStyle = 'rgba(127, 255, 170, 0.5)'
          ctx.fillText('Cl⁻', x + 25, y + 15)
        }

        // Ions Zn2+ apparaissent près du métal
        for (let i = 0; i < 3; i++) {
          const x = cx - 30 + i * 30
          const y = bot - 40 - 5 * Math.sin(_t * 2 + i)
          ctx.fillStyle = '#dde2eb'
          ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#222'
          ctx.font = 'bold 9px sans-serif'
          ctx.fillText('Zn²⁺', x, y)
        }

        // Génération de bulles H2 (sortent du Zn)
        if (Math.random() < 0.9) {
          bubbles.push({
            x: cx - 50 + Math.random() * 100,
            y: bot - 25,
            r: 4 + Math.random() * 4,
            vy: 50 + Math.random() * 30,
          })
        }
        const alive: Bubble[] = []
        for (const b of bubbles) {
          b.y -= b.vy * dt
          if (b.y < top - 5) continue
          const g = ctx.createRadialGradient(b.x - 1, b.y - 1, 0, b.x, b.y, b.r)
          g.addColorStop(0, 'rgba(200, 230, 255, 0.9)')
          g.addColorStop(1, 'rgba(120, 180, 240, 0.3)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill()
          if (b.r > 5) {
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 7px sans-serif'
            ctx.fillText('H₂', b.x, b.y)
          }
          alive.push(b)
        }
        bubbles = alive

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText('Zn + 2 HCl  →  ZnCl₂ + H₂ ↑', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText('Le Zn (plus réducteur) déplace H - H⁺ est réduit en H₂ gazeux', w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
