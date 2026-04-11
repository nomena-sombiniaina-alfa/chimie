import { useCanvas } from '../../hooks/useCanvas'

// Schéma : équilibre dynamique H2O ⇌ H+ + OH-
// Particules qui se dissocient et se recombinent en permanence.
export default function IonicEquilibriumDiagram() {
  const canvasRef = useCanvas(() => {
    type Particle = { x: number; y: number; vx: number; vy: number; kind: 'h2o' | 'h' | 'oh' }
    let parts: Particle[] = []
    let W = 0, H = 0
    let initialized = false
    let dissocTimer = 0
    let recombTimer = 0

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
        dissocTimer += dt
        if (dissocTimer > 1.2) {
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
            ctx.fillStyle = '#66c8ff'
            ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 8px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H₂O', p.x, p.y)
          } else if (p.kind === 'h') {
            ctx.fillStyle = '#ff7777'
            ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#fff'
            ctx.font = 'bold 9px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('H⁺', p.x, p.y)
          } else if (p.kind === 'oh') {
            ctx.fillStyle = '#7fffaa'
            ctx.beginPath(); ctx.arc(p.x, p.y, 8, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = '#0a0e1a'
            ctx.font = 'bold 8px sans-serif'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText('OH⁻', p.x, p.y)
          }
        }

        // Compteurs
        const cH2O = parts.filter(p => p.kind === 'h2o').length
        const cH = parts.filter(p => p.kind === 'h').length
        const cOH = parts.filter(p => p.kind === 'oh').length
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(`H₂O : ${cH2O}`, 20, 20)
        ctx.fillText(`H⁺ : ${cH}`, 20, 36)
        ctx.fillText(`OH⁻ : ${cOH}`, 20, 52)

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('H₂O  ⇌  H⁺ + OH⁻   (Kw = 10⁻¹⁴ à 25 °C)', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText('Équilibre dynamique : dissociations et recombinaisons constantes - concentrations stables', w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
