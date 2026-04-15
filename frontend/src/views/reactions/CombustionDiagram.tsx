import { useCanvas } from '../../hooks/useCanvas'

// Brûleur de gaz : flamme vive avec particules CH4/O2 qui entrent par le bas,
// flammes qui montent, particules CO2/H2O qui s'échappent par le haut.
// Thermomètre à droite qui chauffe en temps réel.
export default function CombustionDiagram() {
  const canvasRef = useCanvas(() => {
    type Particle = { x: number; y: number; vx: number; vy: number; age: number; life: number; kind: 'reactant' | 'product' | 'flame' | 'spark'; label?: string; color?: string; size: number }
    let parts: Particle[] = []
    let nextReactant = 0
    let nextFlame = 0
    let temperature = 22  // °C, monte avec le temps
    let W = 0, H = 0

    return {
      onResize: (w, h) => { W = w; H = h },
      draw: (ctx, w, h, dt, t) => {
        if (W !== w || H !== h) { W = w; H = h }
        const cx = w / 2
        const burnerY = h * 0.78
        const burnerW = 120

        // Fond noir-rougeoyant
        const bg = ctx.createRadialGradient(cx, burnerY - 60, 30, cx, burnerY - 60, 250)
        bg.addColorStop(0, 'rgba(255, 120, 50, 0.10)')
        bg.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = bg
        ctx.fillRect(0, 0, w, h)

        // Brûleur (rectangle métallique)
        ctx.fillStyle = '#4a5060'
        ctx.fillRect(cx - burnerW / 2, burnerY, burnerW, 14)
        ctx.fillStyle = '#2c3142'
        ctx.fillRect(cx - burnerW / 2, burnerY + 14, burnerW, 6)
        // Tube qui descend
        ctx.fillRect(cx - 10, burnerY + 20, 20, 30)

        // Entrée de gaz/oxygène (label en bas)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('CH₄ + O₂ ↑', cx, burnerY + 64)

        // Spawn de réactifs qui montent dans le tube
        nextReactant += dt
        if (nextReactant > 0.15) {
          nextReactant = 0
          const isCH4 = Math.random() < 0.33
          parts.push({
            x: cx + (Math.random() - 0.5) * 14,
            y: burnerY + 48,
            vx: 0,
            vy: -50 - Math.random() * 30,
            age: 0, life: 1.0,
            kind: 'reactant',
            label: isCH4 ? 'CH₄' : 'O₂',
            color: isCH4 ? '#2a2f3a' : '#ff6677',
            size: 7,
          })
        }

        // Spawn de flammes (particules orange/rouge qui montent)
        nextFlame += dt
        if (nextFlame > 0.04) {
          nextFlame = 0
          const px = cx + (Math.random() - 0.5) * burnerW * 0.85
          parts.push({
            x: px,
            y: burnerY - 2,
            vx: (cx - px) * 0.3 + (Math.random() - 0.5) * 20,
            vy: -100 - Math.random() * 80,
            age: 0,
            life: 0.7 + Math.random() * 0.6,
            kind: 'flame',
            size: 8 + Math.random() * 8,
          })
        }

        // Mise à jour
        const alive: Particle[] = []
        for (const p of parts) {
          p.age += dt
          if (p.age >= p.life) {
            // Réactif qui atteint la flamme → transformé en produit
            if (p.kind === 'reactant' && p.y < burnerY - 5) {
              const isCO2 = Math.random() < 0.33
              alive.push({
                x: p.x, y: p.y,
                vx: (Math.random() - 0.5) * 40,
                vy: -120 - Math.random() * 40,
                age: 0, life: 1.6,
                kind: 'product',
                label: isCO2 ? 'CO₂' : 'H₂O',
                color: isCO2 ? '#ff7788' : '#66c8ff',
                size: 8,
              })
              // Étincelle de conversion
              for (let i = 0; i < 3; i++) {
                alive.push({
                  x: p.x, y: p.y,
                  vx: (Math.random() - 0.5) * 120,
                  vy: -50 + (Math.random() - 0.5) * 50,
                  age: 0, life: 0.25,
                  kind: 'spark',
                  size: 3,
                })
              }
            }
            continue
          }
          p.x += p.vx * dt
          if (p.kind === 'flame') {
            // Flamme : monte et tremble
            p.vx += (Math.random() - 0.5) * 60 * dt
            p.vx *= 0.95
            p.vy -= 80 * dt
            p.vy *= 0.97
          } else if (p.kind === 'product') {
            // Produits : montent rapidement et s'échappent
            p.vy -= 30 * dt
            p.vy *= 0.99
            p.vx *= 0.98
          } else if (p.kind === 'reactant') {
            // Réactifs : montent vers la flamme
            p.vy *= 0.99
          } else if (p.kind === 'spark') {
            p.vy += 200 * dt
          }
          p.y += p.vy * dt
          if (p.y < -20 || p.y > h + 20) continue
          alive.push(p)
        }
        parts = alive

        // Dessiner flammes (composite lighter)
        ctx.globalCompositeOperation = 'lighter'
        for (const p of parts) {
          if (p.kind !== 'flame') continue
          const k = 1 - p.age / p.life
          const r = p.size * (0.6 + (1 - k) * 1.3)
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r)
          g.addColorStop(0, `rgba(255, 240, 120, ${0.95 * k})`)
          g.addColorStop(0.4, `rgba(255, 140, 40, ${0.7 * k})`)
          g.addColorStop(1, `rgba(180, 30, 0, 0)`)
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill()
        }
        // Sparks
        for (const p of parts) {
          if (p.kind !== 'spark') continue
          const k = 1 - p.age / p.life
          ctx.fillStyle = `rgba(255, 255, 200, ${k})`
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'

        // Dessiner réactifs et produits
        for (const p of parts) {
          if (p.kind !== 'reactant' && p.kind !== 'product') continue
          const opacity = p.kind === 'reactant' ? Math.min(1, p.age * 3) : 1 - p.age / p.life
          ctx.globalAlpha = opacity
          const g = ctx.createRadialGradient(p.x - 2, p.y - 2, 0, p.x, p.y, p.size + 4)
          g.addColorStop(0, '#fff')
          g.addColorStop(0.4, p.color || '#888')
          g.addColorStop(1, '#1a1f2e')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size + 4, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#0a0e1a'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(p.label || '', p.x, p.y)
          ctx.globalAlpha = 1
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        // Thermomètre à droite qui monte
        temperature += dt * 80
        if (temperature > 1200) temperature = 1200
        const thX = w - 60
        const thTop = h * 0.20, thBot = h * 0.72
        const thH = thBot - thTop
        ctx.fillStyle = 'rgba(255,255,255,0.08)'
        ctx.fillRect(thX - 8, thTop, 16, thH)
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.lineWidth = 1
        ctx.strokeRect(thX - 8, thTop, 16, thH)
        // Bulbe
        ctx.fillStyle = '#ff5566'
        ctx.beginPath(); ctx.arc(thX, thBot + 12, 14, 0, Math.PI * 2); ctx.fill()
        // Niveau de mercure (température)
        const tFraction = Math.min(1, (temperature - 22) / 1200)
        const merculrH = thH * tFraction
        const colT = ctx.createLinearGradient(0, thBot, 0, thTop)
        colT.addColorStop(0, '#ff3344')
        colT.addColorStop(0.5, '#ffcc44')
        colT.addColorStop(1, '#ff8855')
        ctx.fillStyle = colT
        ctx.fillRect(thX - 6, thBot - merculrH, 12, merculrH)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`${Math.round(temperature)} °C`, thX, thTop - 12)

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText('CH₄ + 2 O₂  ->  CO₂ + 2 H₂O  +  énergie', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText('Exothermique : 890 kJ/mol libérés sous forme de chaleur et lumière (flamme)', w / 2, h - 28)
        ctx.textAlign = 'start'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
