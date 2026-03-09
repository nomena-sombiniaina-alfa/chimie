import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount, getNeutrons } from '../store/atomStore'
import { ionLabel, shellDistribution } from '../data/electronConfig'

export default function BohrView() {
  const { currentDetail, charge, isotopeShift } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const neutrons = getNeutrons(el, isotopeShift)
  const shells = shellDistribution(electronCount)
  const label = el ? ionLabel(el.symbol, charge) : ''

  const canvasRef = useCanvas(() => {
    let particles: Array<{ shell: number; radius: number; angle: number; speed: number }> = []

    function shellRadius(s: number, total: number, w: number, h: number): number {
      const maxR = Math.min(w, h) * 0.42
      if (total <= 1) return maxR * 0.6
      const minR = 55
      return minR + (maxR - minR) * (s / Math.max(1, total - 1))
    }

    function build(w: number, h: number) {
      particles = []
      for (let s = 0; s < shells.length; s++) {
        const k = shells[s]
        const r = shellRadius(s, shells.length, w, h)
        for (let i = 0; i < k; i++) {
          particles.push({
            shell: s,
            radius: r,
            angle: (i / Math.max(1, k)) * Math.PI * 2 + Math.random() * 0.1,
            speed: 1.6 - s * 0.15,
          })
        }
      }
    }

    function drawNucleus(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
      if (!el) return
      const Z = el.Z
      const total = Z + neutrons
      const cluster = Math.min(28, total)
      const baseR = 28
      const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, baseR + 8)
      halo.addColorStop(0, 'rgba(255, 200, 100, 0.45)')
      halo.addColorStop(1, 'rgba(255, 200, 100, 0)')
      ctx.fillStyle = halo
      ctx.beginPath(); ctx.arc(cx, cy, baseR + 8, 0, Math.PI * 2); ctx.fill()
      for (let i = 0; i < cluster; i++) {
        const a = (i / cluster) * Math.PI * 2 + (i % 3) * 0.5
        const rr = 4 + (i % 4) * 4
        const x = cx + Math.cos(a) * rr
        const y = cy + Math.sin(a) * rr
        const isProton = i < Math.min(Z, (cluster * Z) / total + 0.5)
        ctx.fillStyle = isProton ? '#ff7766' : '#9bb0d6'
        ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill()
      }
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(label, cx, cy - 36)
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt) => {
        if (!el) return
        const cx = w / 2, cy = h / 2

        ctx.strokeStyle = 'rgba(255,255,255,0.06)'
        ctx.lineWidth = 1
        for (let s = 0; s < shells.length; s++) {
          const r = shellRadius(s, shells.length, w, h)
          ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
        }
        drawNucleus(ctx, cx, cy)

        for (const e of particles) {
          e.angle += e.speed * dt
          const x = cx + Math.cos(e.angle) * e.radius
          const y = cy + Math.sin(e.angle) * e.radius
          const g = ctx.createRadialGradient(x, y, 0, x, y, 8)
          g.addColorStop(0, '#9be0ff')
          g.addColorStop(1, 'rgba(80,160,240,0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill()
        }

        const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q']
        ctx.fillStyle = 'rgba(255,255,255,0.35)'
        ctx.font = '11px sans-serif'
        for (let s = 0; s < shells.length; s++) {
          const r = shellRadius(s, shells.length, w, h)
          ctx.fillText(`${shellNames[s]} (${shells[s]})`, cx + r + 6, cy + 4)
        }
      }
    }
  }, [el?.Z, charge])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Où sont les électrons ?</strong>
        Les électrons se répartissent sur des couches d'énergie discrètes (K, L, M, …). Chaque couche
        ne peut accueillir qu'un nombre limité d'électrons (2, 8, 8, 18, …).
      </div>
    </div>
  )
}
