import { useCanvas } from '../hooks/useCanvas'
import { useAtomStore, getElectronCount } from '../store/atomStore'
import { ionLabel, shellDistribution, getElectronConfig } from '../data/electronConfig'

const SUBSHELL_CAP: Record<string, number> = { s: 2, p: 6, d: 10, f: 14 }

export default function SchrodingerView() {
  const { currentDetail, charge } = useAtomStore()
  const el = currentDetail
  const electronCount = getElectronCount(el, charge)
  const shells = shellDistribution(electronCount)
  const cfg = getElectronConfig(electronCount)
  const label = el ? ionLabel(el.symbol, charge) : ''

  const canvasRef = useCanvas(() => ({
    draw: (ctx, w, h, _dt, t) => {
      if (!el) return
      const cx = w / 2, cy = h / 2
      const maxN = shells.length

      const byShell: Record<number, Array<[string, number]>> = {}
      for (const [sub, count] of cfg) {
        const n = +sub[0]
        if (!byShell[n]) byShell[n] = []
        byShell[n].push([sub, count])
      }

      ctx.globalCompositeOperation = 'lighter'
      for (let n = 1; n <= maxN; n++) {
        const baseR = 50 + (n - 1) * 38
        const R = baseR + Math.sin(t * 0.6 + n) * 4
        const subs = byShell[n] || []
        for (const [sub, count] of subs) {
          const type = sub[1]
          const occ = count / SUBSHELL_CAP[type]
          if (type === 's') {
            const g = ctx.createRadialGradient(cx, cy, baseR * 0.6, cx, cy, R + 16)
            g.addColorStop(0, 'hsla(200, 80%, 65%, 0)')
            g.addColorStop(0.5, `hsla(200, 80%, 65%, ${0.18 * occ})`)
            g.addColorStop(1, 'hsla(200, 80%, 65%, 0)')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(cx, cy, R + 16, 0, Math.PI * 2); ctx.fill()
          } else if (type === 'p') {
            for (let a = 0; a < 3; a++) {
              const ang = (a / 3) * Math.PI + t * 0.05
              const ux = Math.cos(ang), uy = Math.sin(ang)
              for (let side = -1; side <= 1; side += 2) {
                const ex = cx + ux * baseR * 0.95 * side
                const ey = cy + uy * baseR * 0.95 * side
                const gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, baseR * 0.55)
                gg.addColorStop(0, `hsla(40, 95%, 65%, ${0.30 * occ})`)
                gg.addColorStop(1, 'hsla(40, 95%, 65%, 0)')
                ctx.fillStyle = gg
                ctx.beginPath(); ctx.arc(ex, ey, baseR * 0.55, 0, Math.PI * 2); ctx.fill()
              }
            }
          } else if (type === 'd') {
            for (let a = 0; a < 4; a++) {
              const ang = (a / 4) * Math.PI * 2 + Math.PI / 4 + t * 0.03
              const ex = cx + Math.cos(ang) * baseR * 0.9
              const ey = cy + Math.sin(ang) * baseR * 0.9
              const gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, baseR * 0.4)
              gg.addColorStop(0, `hsla(330, 90%, 70%, ${0.28 * occ})`)
              gg.addColorStop(1, 'hsla(330, 90%, 70%, 0)')
              ctx.fillStyle = gg
              ctx.beginPath(); ctx.arc(ex, ey, baseR * 0.4, 0, Math.PI * 2); ctx.fill()
            }
          } else if (type === 'f') {
            for (let a = 0; a < 8; a++) {
              const ang = (a / 8) * Math.PI * 2 + t * 0.02
              const ex = cx + Math.cos(ang) * baseR * 0.95
              const ey = cy + Math.sin(ang) * baseR * 0.95
              const gg = ctx.createRadialGradient(ex, ey, 0, ex, ey, baseR * 0.32)
              gg.addColorStop(0, `hsla(280, 85%, 75%, ${0.30 * occ})`)
              gg.addColorStop(1, 'hsla(280, 85%, 75%, 0)')
              ctx.fillStyle = gg
              ctx.beginPath(); ctx.arc(ex, ey, baseR * 0.32, 0, Math.PI * 2); ctx.fill()
            }
          }
        }
      }
      ctx.globalCompositeOperation = 'source-over'

      // Nucleus
      const haloR = 22
      const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, haloR)
      halo.addColorStop(0, 'rgba(255, 200, 100, 0.55)')
      halo.addColorStop(1, 'rgba(255, 200, 100, 0)')
      ctx.fillStyle = halo
      ctx.beginPath(); ctx.arc(cx, cy, haloR, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px sans-serif'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(label, cx, cy)
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'

      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      ctx.font = 'italic 14px ui-monospace, monospace'
      ctx.fillText('iℏ ∂Ψ/∂t = ĤΨ', 20, 30)
      ctx.fillStyle = 'rgba(255,255,255,0.35)'
      ctx.font = '11px sans-serif'
      ctx.fillText('|Ψ|² = densité de probabilité de présence', 20, 50)

      const legend = [
        { color: 'hsl(200,80%,65%)', label: 's : sphère' },
        { color: 'hsl(40,95%,65%)',  label: 'p : haltères' },
        { color: 'hsl(330,90%,70%)', label: 'd : trèfle' },
        { color: 'hsl(280,85%,75%)', label: 'f : 8 lobes' },
      ]
      ctx.font = '11px sans-serif'
      let lx = 16, ly = h - 14
      for (const l of legend) {
        ctx.fillStyle = l.color
        ctx.beginPath(); ctx.arc(lx + 4, ly - 3, 4, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.fillText(l.label, lx + 12, ly)
        lx += 100
      }

      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.font = 'bold 13px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText('1926', w - 20, 30)
      ctx.font = '11px sans-serif'
      ctx.fillText('Erwin Schrödinger', w - 20, 48)
      ctx.textAlign = 'start'
    }
  }), [el?.Z, charge])

  return (
    <div className="view">
      <div className="stage"><canvas ref={canvasRef} /></div>
      <div className="caption">
        <strong>Mécanique ondulatoire - fonction d'onde Ψ</strong>
        Schrödinger remplace les orbites de Bohr par une fonction d'onde Ψ dont le carré |Ψ|² donne
        la densité de probabilité de présence. L'électron n'a plus de trajectoire :
        il est décrit par un nuage - une orbitale (s, p, d, f).
      </div>
    </div>
  )
}
