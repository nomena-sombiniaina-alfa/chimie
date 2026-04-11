import { useCanvas } from '../../hooks/useCanvas'

// Schéma : cristal de NaCl qui se désagrège dans l'eau, ions solvatés
export default function DissolutionDiagram() {
  const canvasRef = useCanvas(() => {
    type Ion = { x: number; y: number; vx: number; vy: number; type: 'Na' | 'Cl'; t: number }
    let ions: Ion[] = []
    let nextRelease = 0

    return {
      draw: (ctx, w, h, dt, t) => {
        const cx = w / 2, cy = h / 2 - 20
        const crystalSize = 80

        // Fond solution
        ctx.fillStyle = 'rgba(60, 140, 220, 0.06)'
        ctx.fillRect(0, 60, w, h - 130)

        // Cristal de NaCl (réseau) - rapetisse avec le temps
        const phase = (t % 8) / 8
        const shrink = 1 - phase * 0.3
        const cs = crystalSize * shrink
        // Dessiner réseau : 4x4 alternance Na+/Cl-
        const cellSize = cs / 4
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            const ionX = cx - cs / 2 + cellSize * (i + 0.5)
            const ionY = cy - cs / 2 + cellSize * (j + 0.5)
            const isNa = (i + j) % 2 === 0
            ctx.fillStyle = isNa ? '#ff8a8a' : '#7fffaa'
            ctx.beginPath(); ctx.arc(ionX, ionY, cellSize * 0.35, 0, Math.PI * 2); ctx.fill()
          }
        }
        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('NaCl(s)', cx, cy + cs / 2 + 16)

        // Libération continue d'ions
        nextRelease += dt
        if (nextRelease > 0.18) {
          nextRelease = 0
          const angle = Math.random() * Math.PI * 2
          const isNa = Math.random() < 0.5
          ions.push({
            x: cx + Math.cos(angle) * cs * 0.55,
            y: cy + Math.sin(angle) * cs * 0.55,
            vx: Math.cos(angle) * 40,
            vy: Math.sin(angle) * 40 - 5,
            type: isNa ? 'Na' : 'Cl',
            t: 0,
          })
        }

        // Mouvement des ions + dessin
        const keep: Ion[] = []
        for (const ion of ions) {
          ion.t += dt
          ion.vx += (Math.random() - 0.5) * 20 * dt
          ion.vy += (Math.random() - 0.5) * 20 * dt
          ion.vx *= 0.99
          ion.vy *= 0.99
          ion.x += ion.vx * dt
          ion.y += ion.vy * dt
          // Rebonds aux bords
          if (ion.x < 20) { ion.x = 20; ion.vx *= -0.6 }
          if (ion.x > w - 20) { ion.x = w - 20; ion.vx *= -0.6 }
          if (ion.y < 70) { ion.y = 70; ion.vy *= -0.6 }
          if (ion.y > h - 80) { ion.y = h - 80; ion.vy *= -0.6 }
          if (ion.t > 12) continue
          // Sphère d'hydratation (cercle bleu autour)
          ctx.fillStyle = 'rgba(100, 180, 240, 0.20)'
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 12, 0, Math.PI * 2); ctx.fill()
          // Ion
          ctx.fillStyle = ion.type === 'Na' ? '#ff8a8a' : '#7fffaa'
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 6, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#000'
          ctx.font = 'bold 7px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ion.type === 'Na' ? '+' : '-', ion.x, ion.y)
          keep.push(ion)
        }
        ions = keep

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('NaCl(s) + H₂O  →  Na⁺(aq) + Cl⁻(aq)', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '12px sans-serif'
        ctx.fillText('L\'eau dipolaire arrache et solvate les ions (sphère d\'hydratation)', w / 2, h - 25)
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
