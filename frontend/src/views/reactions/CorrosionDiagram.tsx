import { useCanvas } from '../../hooks/useCanvas'

// Plaque de fer avec gouttes d'eau qui tombent : la rouille s'étend depuis
// chaque goutte sous forme de tache irrégulière qui croît avec le temps.
// Boucle complète : début propre → progression → état rouillé → réinitialisation.
export default function CorrosionDiagram() {
  const canvasRef = useCanvas(() => {
    type Drop = { x: number; y: number; vy: number; landed: boolean; landX: number; landY: number; landTime: number }
    type RustBlob = { x: number; y: number; age: number; maxRadius: number; speckles: { dx: number; dy: number; r: number }[] }
    let drops: Drop[] = []
    let blobs: RustBlob[] = []
    let nextDrop = 0
    let cycleTime = 0
    const CYCLE = 14  // s, durée d'un cycle complet
    let W = 0, H = 0
    let plateY = 0, plateH = 0, plateLeft = 0, plateRight = 0

    function build(w: number, h: number) {
      W = w; H = h
      plateY = h * 0.50
      plateH = 70
      plateLeft = w * 0.20
      plateRight = w * 0.80
    }

    function reset() {
      drops = []
      blobs = []
      cycleTime = 0
      nextDrop = 0
    }

    function spawnBlob(x: number, y: number) {
      const speckles: { dx: number; dy: number; r: number }[] = []
      const count = 14 + Math.floor(Math.random() * 8)
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random()  // sera multiplié par maxRadius
        speckles.push({
          dx: Math.cos(a) * r,
          dy: Math.sin(a) * r * 0.6,  // aplatissement sur la plaque
          r: 1 + Math.random() * 2.5,
        })
      }
      blobs.push({ x, y, age: 0, maxRadius: 22 + Math.random() * 8, speckles })
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) build(w, h)
        cycleTime += dt
        if (cycleTime > CYCLE) reset()

        // Étiquettes O2 et H2O dans l'air
        ctx.fillStyle = 'rgba(255, 107, 119, 0.4)'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('O₂', plateLeft + 30, plateY - 60)
        ctx.fillText('O₂', plateRight - 30, plateY - 80)
        ctx.fillStyle = 'rgba(102, 200, 255, 0.5)'
        ctx.fillText('H₂O', (plateLeft + plateRight) / 2, plateY - 100)

        // Plaque de fer
        const ironGrad = ctx.createLinearGradient(0, plateY, 0, plateY + plateH)
        ironGrad.addColorStop(0, '#8e95a3')
        ironGrad.addColorStop(0.5, '#737a8a')
        ironGrad.addColorStop(1, '#5d6373')
        ctx.fillStyle = ironGrad
        ctx.fillRect(plateLeft, plateY, plateRight - plateLeft, plateH)
        // Trait de séparation
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(plateLeft, plateY, plateRight - plateLeft, plateH)
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = 'bold 12px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText('Fe (plaque)', plateLeft + 8, plateY - 6)

        // Spawn de gouttes d'eau
        nextDrop += dt
        if (nextDrop > 2.0 && cycleTime < CYCLE * 0.7) {
          nextDrop = 0
          drops.push({
            x: plateLeft + 30 + Math.random() * (plateRight - plateLeft - 60),
            y: 30,
            vy: 0,
            landed: false,
            landX: 0,
            landY: 0,
            landTime: 0,
          })
        }

        // Animation des gouttes
        for (const d of drops) {
          if (!d.landed) {
            d.vy += 200 * dt
            d.y += d.vy * dt
            if (d.y >= plateY - 4) {
              d.y = plateY - 4
              d.landed = true
              d.landX = d.x
              d.landY = d.y
              d.landTime = cycleTime
              spawnBlob(d.x, plateY + 8)
            }
            // Dessin de la goutte
            ctx.fillStyle = 'rgba(102, 200, 255, 0.9)'
            ctx.beginPath()
            ctx.ellipse(d.x, d.y, 4, 7, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.fillStyle = 'rgba(255,255,255,0.6)'
            ctx.beginPath(); ctx.arc(d.x - 1, d.y - 2, 1.2, 0, Math.PI * 2); ctx.fill()
          } else {
            // Goutte étalée sur la plaque (sera absorbée)
            const ageAfter = cycleTime - d.landTime
            const alpha = Math.max(0, 1 - ageAfter / 3)
            if (alpha > 0) {
              ctx.fillStyle = `rgba(102, 200, 255, ${alpha * 0.6})`
              ctx.beginPath()
              ctx.ellipse(d.landX, d.landY, 8, 3, 0, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }

        // Animation des taches de rouille (croissent depuis chaque point)
        for (const b of blobs) {
          b.age += dt
          const k = Math.min(1, b.age / 4)  // croit pendant 4 s
          // Halo principal (couche d'oxyde)
          const radius = b.maxRadius * k
          const haloGrad = ctx.createRadialGradient(b.x, b.y, 2, b.x, b.y, radius)
          haloGrad.addColorStop(0, 'rgba(180, 80, 30, 0.85)')
          haloGrad.addColorStop(0.6, 'rgba(140, 60, 20, 0.55)')
          haloGrad.addColorStop(1, 'rgba(100, 40, 10, 0)')
          ctx.fillStyle = haloGrad
          ctx.beginPath()
          ctx.ellipse(b.x, b.y, radius, radius * 0.6, 0, 0, Math.PI * 2)
          ctx.fill()
          // Speckles texture
          for (const s of b.speckles) {
            const sx = b.x + s.dx * radius
            const sy = b.y + s.dy * radius
            ctx.fillStyle = `rgba(${200 + Math.floor(Math.random() * 30)}, ${100 + Math.floor(Math.random() * 30)}, 40, ${0.7 * k})`
            ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI * 2); ctx.fill()
          }
          // Petit éclat de rouille foncé au centre
          ctx.fillStyle = `rgba(80, 30, 10, ${0.6 * k})`
          ctx.beginPath(); ctx.arc(b.x, b.y, 3 * k, 0, Math.PI * 2); ctx.fill()
        }

        // Compteur cycle (barre de progression discrète)
        const barW = 200
        const bx = w / 2 - barW / 2
        const by = h * 0.10
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(bx, by, barW, 4)
        ctx.fillStyle = '#a04a20'
        ctx.fillRect(bx, by, barW * (cycleTime / CYCLE), 4)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`Corrosion en cours · ${Math.floor(cycleTime / CYCLE * 100)}%`, w / 2, by - 6)

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText('4 Fe + 3 O₂ + x H₂O  ->  2 Fe₂O₃·x H₂O  (rouille)', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText('Chaque goutte d\'eau initie une tache de rouille qui s\'étend - volume 6× le fer initial', w / 2, h - 28)
        ctx.textAlign = 'start'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
