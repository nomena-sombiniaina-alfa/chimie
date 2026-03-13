import { useRef, useState } from 'react'
import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount } from '../store/atomStore'
import { ionLabel, shellDistribution } from '../data/electronConfig'

export default function HeisenbergView() {
  const { currentDetail, charge } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const shells = shellDistribution(electronCount)
  const label = el ? ionLabel(el.symbol, charge) : ''
  const [focus, setFocus] = useState(0.5)
  const focusRef = useRef(focus)
  focusRef.current = focus

  const canvasRef = useCanvas(() => {
    let measurements: Array<{ x: number; y: number; vx: number; vy: number; age: number; life: number }> = []
    let lastSpawn = 0

    function spawnMeasurement(w: number, h: number) {
      const cx = w / 2, cy = h / 2
      if (shells.length === 0) return
      const idx = Math.floor(Math.random() * shells.length)
      const baseR = 55 + idx * 38
      const sigma = 6 + focusRef.current * 50
      const a = Math.random() * Math.PI * 2
      const r = baseR + (Math.random() - 0.5) * sigma * 2
      measurements.push({
        x: cx + Math.cos(a) * r,
        y: cy + Math.sin(a) * r,
        vx: -Math.sin(a) * 60,
        vy: Math.cos(a) * 60,
        age: 0,
        life: 0.9 + Math.random() * 0.6,
      })
    }

    return {
      draw: (ctx, w, h, dt) => {
        if (!el) return
        const cx = w / 2, cy = h / 2
        const f = focusRef.current

        ctx.globalCompositeOperation = 'lighter'
        for (let s = 0; s < shells.length; s++) {
          const baseR = 55 + s * 38
          const cloudWidth = 14 + (1 - f) * 26
          const g = ctx.createRadialGradient(cx, cy, baseR - cloudWidth, cx, cy, baseR + cloudWidth)
          g.addColorStop(0, `hsla(${200 + s * 25}, 80%, 65%, 0)`)
          g.addColorStop(0.5, `hsla(${200 + s * 25}, 80%, 65%, ${0.15 * (shells[s] / 8)})`)
          g.addColorStop(1, `hsla(${200 + s * 25}, 80%, 65%, 0)`)
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(cx, cy, baseR + cloudWidth, 0, Math.PI * 2); ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'

        const spawnRate = 30 + (1 - f) * 50
        lastSpawn += dt
        const interval = 1 / spawnRate
        while (lastSpawn > interval) {
          spawnMeasurement(w, h)
          lastSpawn -= interval
        }

        const remaining: typeof measurements = []
        for (const m of measurements) {
          m.age += dt
          if (m.age >= m.life) continue
          const k = 1 - m.age / m.life
          const dotAlpha = (1 - f) * k
          const arrowAlpha = f * k
          const r = 3 + (1 - f) * 2
          const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, r * 2.5)
          g.addColorStop(0, `rgba(155, 224, 255, ${0.6 * dotAlpha + 0.1})`)
          g.addColorStop(1, 'rgba(80, 160, 220, 0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(m.x, m.y, r * 2.5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = `rgba(255, 255, 255, ${0.85 * dotAlpha + 0.08})`
          ctx.beginPath(); ctx.arc(m.x, m.y, r * 0.7, 0, Math.PI * 2); ctx.fill()
          if (arrowAlpha > 0.04) {
            const len = 20 + f * 25
            const aLen = Math.hypot(m.vx, m.vy)
            const ux = m.vx / aLen, uy = m.vy / aLen
            ctx.strokeStyle = `rgba(255, 200, 100, ${arrowAlpha})`
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(m.x, m.y)
            ctx.lineTo(m.x + ux * len, m.y + uy * len)
            ctx.stroke()
            const ax = m.x + ux * len, ay = m.y + uy * len
            ctx.beginPath()
            ctx.moveTo(ax, ay)
            ctx.lineTo(ax - ux * 6 + uy * 4, ay - uy * 6 - ux * 4)
            ctx.moveTo(ax, ay)
            ctx.lineTo(ax - ux * 6 - uy * 4, ay - uy * 6 + ux * 4)
            ctx.stroke()
          }
          remaining.push(m)
        }
        measurements = remaining

        // Nucleus marker
        const haloR = 18
        const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, haloR)
        halo.addColorStop(0, 'rgba(255, 200, 100, 0.5)')
        halo.addColorStop(1, 'rgba(255, 200, 100, 0)')
        ctx.fillStyle = halo
        ctx.beginPath(); ctx.arc(cx, cy, haloR, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText(label, cx, cy)
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'

        ctx.fillStyle = 'rgba(255,255,255,0.55)'
        ctx.font = 'italic 14px ui-monospace, monospace'
        ctx.fillText('Δx · Δp ≥ ℏ/2', 20, 30)
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.font = '11px sans-serif'
        ctx.fillText('on ne peut connaître précisément position et impulsion', 20, 50)

        const barX = w - 220, barY = h - 40, barW = 200, barH = 6
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(barX, barY, barW, barH)
        ctx.fillStyle = '#9be0ff'
        ctx.fillRect(barX, barY, barW * f, barH)
        ctx.fillStyle = '#ffc97a'
        ctx.fillRect(barX + barW * f, barY, barW * (1 - f), barH)
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '11px sans-serif'
        ctx.fillText('Δx élargi', barX, barY - 6)
        ctx.textAlign = 'right'
        ctx.fillText('Δp élargi', barX + barW, barY - 6)
        ctx.textAlign = 'start'
      }
    }
  }, [el?.Z, charge])

  return (
    <div className="view">
      <div className="stage">
        <canvas ref={canvasRef} />
        <div className="slider-overlay">
          <span className="lab">Δx précis</span>
          <input
            type="range" min="0" max="1" step="0.01"
            value={focus}
            onChange={(e) => setFocus(parseFloat(e.target.value))}
          />
          <span className="lab">Δp précis</span>
        </div>
      </div>
      <div className="caption">
        <strong>Principe d'incertitude - limite fondamentale de la mesure</strong>
        Heisenberg démontre qu'on ne peut pas connaître à la fois la position et l'impulsion d'un électron
        avec une précision arbitraire - leur produit est minoré par ℏ/2. Déplacez le curseur :
        plus la position se précise, plus l'impulsion s'étale, et inversement.
      </div>
      <style>{`
        .slider-overlay {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .slider-overlay input { width: 200px; }
        .slider-overlay .lab { color: var(--text-dim); font-size: 11px; white-space: nowrap; }
      `}</style>
    </div>
  )
}
