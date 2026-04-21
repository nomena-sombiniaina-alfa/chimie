import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Schéma : équilibre dynamique H2O ⇌ H+ + OH-.
// Compte les dissociations; quand un seuil est atteint le système stabilise
// (autant de dissociations que de recombinaisons par seconde).
export default function IonicEquilibriumDiagram() {
  const canvasRef = useCanvas(() => {
    type Particle = { x: number; y: number; vx: number; vy: number; kind: 'h2o' | 'h' | 'oh' }
    let parts: Particle[] = []
    let W = 0, H = 0
    let initialized = false
    let dissocTimer = 0
    let recombTimer = 0
    let dissocCount = 0
    const MAX_DISSOC = 8
    let equilibrium = false

    function build(w: number, h: number) {
      W = w; H = h
      parts = []
      for (let i = 0; i < 22; i++) {
        parts.push({
          x: 40 + Math.random() * (w - 80),
          y: 80 + Math.random() * (h - 200),
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60,
          kind: 'h2o',
        })
      }
      initialized = true
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt) => {
        if (!initialized || W !== w || H !== h) build(w, h)

        // Mise à jour positions
        for (const p of parts) {
          p.vx += (Math.random() - 0.5) * 30 * dt
          p.vy += (Math.random() - 0.5) * 30 * dt
          p.vx *= 0.98
          p.vy *= 0.98
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.x < 30) { p.x = 30; p.vx *= -0.7 }
          if (p.x > w - 30) { p.x = w - 30; p.vx *= -0.7 }
          if (p.y < 70) { p.y = 70; p.vy *= -0.7 }
          if (p.y > h - 100) { p.y = h - 100; p.vy *= -0.7 }
        }

        // Dissociation occasionnelle (H2O -> H+ + OH-)
        // En équilibre : on dissocie uniquement si moins d'ions présents
        // (autant de fwd que de bwd, le compteur n'augmente plus)
        dissocTimer += dt
        const ionCount = parts.filter(p => p.kind !== 'h2o').length
        const allowDissoc = !equilibrium || ionCount < 4
        if (dissocTimer > 1.2 && allowDissoc) {
          dissocTimer = 0
          const candidates = parts.filter(p => p.kind === 'h2o')
          if (candidates.length > 0) {
            const p = candidates[Math.floor(Math.random() * candidates.length)]
            p.kind = 'h'
            parts.push({
              x: p.x + 10, y: p.y + 10,
              vx: -p.vx * 0.5, vy: -p.vy * 0.5,
              kind: 'oh',
            })
            if (!equilibrium) {
              dissocCount += 1
              if (dissocCount >= MAX_DISSOC) equilibrium = true
            }
          }
        }

        // Recombinaison (H+ + OH- -> H2O)
        recombTimer += dt
        if (recombTimer > 0.5) {
          recombTimer = 0
          const hs = parts.map((p, i) => ({ p, i })).filter(o => o.p.kind === 'h')
          for (const { p: h_, i: hi } of hs) {
            for (let j = 0; j < parts.length; j++) {
              if (j === hi || parts[j].kind !== 'oh') continue
              const oh = parts[j]
              const dx = h_.x - oh.x, dy = h_.y - oh.y
              if (dx * dx + dy * dy < 25 * 25) {
                h_.kind = 'h2o'
                parts.splice(j, 1)
                break
              }
            }
          }
        }

        // Dessin
        for (const p of parts) {
          if (p.kind === 'h2o') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, 13)
            g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#66c8ff'); g.addColorStop(1, '#66c8ff')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, 13, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 10px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H₂O', p.x, p.y)
          } else if (p.kind === 'h') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, 11)
            g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#ff7777'); g.addColorStop(1, '#ff7777')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 11px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H⁺', p.x, p.y)
          } else if (p.kind === 'oh') {
            const g = ctx.createRadialGradient(p.x - 3, p.y - 3, 0, p.x, p.y, 12)
            g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#7fffaa'); g.addColorStop(1, '#7fffaa')
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 10px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('OH⁻', p.x, p.y)
          }
        }

        // Compteurs (en haut à droite pour ne pas chevaucher la légende)
        const cH2O = parts.filter(p => p.kind === 'h2o').length
        const cH = parts.filter(p => p.kind === 'h').length
        const cOH = parts.filter(p => p.kind === 'oh').length
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText(`H₂O : ${cH2O}`, w - 20, 20)
        ctx.fillText(`H⁺ : ${cH}`, w - 20, 36)
        ctx.fillText(`OH⁻ : ${cOH}`, w - 20, 52)

        // Légende + compteur
        drawLegend(ctx, 10, 10, [
          { color: '#66c8ff', label: 'H₂O (eau, forme neutre)' },
          { color: '#ff7777', label: 'H⁺ (proton libéré)' },
          { color: '#7fffaa', label: 'OH⁻ (ion hydroxyde)' },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, dissocCount, MAX_DISSOC, 'Dissociation')

        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('H₂O  ⇌  H⁺ + OH⁻   (Kw = 10⁻¹⁴ à 25 °C)', w / 2, h - 50)
        ctx.fillStyle = equilibrium ? '#7fffaa' : 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText(
          equilibrium
            ? 'Équilibre atteint - autant de dissociations que de recombinaisons'
            : 'Équilibre dynamique : dissociations et recombinaisons constantes - concentrations stables',
          w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
