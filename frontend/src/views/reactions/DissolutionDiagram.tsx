import { useCanvas } from '../../hooks/useCanvas'

// Cristal de NaCl posé au fond d'un bécher. Les molécules d'eau attaquent les
// arêtes : les ions se détachent un par un et s'éloignent, entourés de leur
// sphère d'hydratation. Le cristal rétrécit visiblement.
export default function DissolutionDiagram() {
  const canvasRef = useCanvas(() => {
    type Lattice = { i: number; j: number; kind: '+' | '-'; released: boolean }
    type FreeIon = { x: number; y: number; vx: number; vy: number; kind: '+' | '-' }
    type WaterMol = { angle: number; r: number; speed: number; dipoleAngle: number }
    let lattice: Lattice[] = []
    let free: FreeIon[] = []
    let water: WaterMol[] = []
    let W = 0, H = 0
    let cx = 0, cy = 0
    const N = 7    // 7x7 réseau
    const cellSize = 14
    let nextRelease = 0
    let elapsed = 0

    function build(w: number, h: number) {
      W = w; H = h
      cx = w / 2
      cy = h / 2 - 20
      lattice = []
      free = []
      water = []
      elapsed = 0
      for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
          lattice.push({ i, j, kind: (i + j) % 2 === 0 ? '+' : '-', released: false })
        }
      }
      // Molécules d'eau qui orbitent autour du cristal
      for (let i = 0; i < 28; i++) {
        water.push({
          angle: Math.random() * Math.PI * 2,
          r: 70 + Math.random() * 80,
          speed: 0.5 + Math.random() * 0.8,
          dipoleAngle: 0,
        })
      }
    }

    function isOuterEdge(l: Lattice): boolean {
      // Ion en surface = au moins un voisin manquant (libéré ou hors-grille)
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      for (const [di, dj] of dirs) {
        const ni = l.i + di, nj = l.j + dj
        if (ni < 0 || ni >= N || nj < 0 || nj >= N) return true
        const neighbor = lattice.find(x => x.i === ni && x.j === nj)
        if (neighbor?.released) return true
      }
      return false
    }

    function latticeXY(l: Lattice): [number, number] {
      const totalW = N * cellSize
      return [
        cx - totalW / 2 + (l.i + 0.5) * cellSize,
        cy - totalW / 2 + (l.j + 0.5) * cellSize,
      ]
    }

    function releaseEdgeIon() {
      const edge = lattice.filter(l => !l.released && isOuterEdge(l))
      if (edge.length === 0) return
      const l = edge[Math.floor(Math.random() * edge.length)]
      l.released = true
      const [x, y] = latticeXY(l)
      // Direction de fuite vers l'extérieur du cristal
      const totalW = N * cellSize
      const centerX = cx, centerY = cy
      const dx = x - centerX, dy = y - centerY
      const d = Math.hypot(dx, dy) || 1
      free.push({
        x, y,
        vx: (dx / d) * 60 + (Math.random() - 0.5) * 20,
        vy: (dy / d) * 60 + (Math.random() - 0.5) * 20,
        kind: l.kind,
      })
    }

    return {
      onResize: build,
      draw: (ctx, w, h, dt) => {
        if (W !== w || H !== h) build(w, h)
        elapsed += dt

        // Eau en arrière-plan
        ctx.fillStyle = 'rgba(60, 140, 220, 0.08)'
        ctx.fillRect(0, 70, w, h - 150)

        // Molécules d'eau (petits dipôles bleus qui flottent)
        for (const wm of water) {
          wm.angle += wm.speed * dt * 0.4
          const wx = cx + Math.cos(wm.angle) * wm.r
          const wy = cy + Math.sin(wm.angle) * wm.r
          // Petit V représentant H2O (pôle O - vers le centre du cristal côté cation)
          ctx.fillStyle = 'rgba(102, 200, 255, 0.55)'
          ctx.beginPath(); ctx.arc(wx, wy, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = 'rgba(220, 240, 255, 0.6)'
          ctx.beginPath(); ctx.arc(wx - 4, wy + 4, 2, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(wx + 4, wy + 4, 2, 0, Math.PI * 2); ctx.fill()
        }

        // Libération périodique d'un ion de bord
        nextRelease += dt
        if (nextRelease > 0.4 && lattice.some(l => !l.released)) {
          nextRelease = 0
          releaseEdgeIon()
        }

        // Cristal restant
        for (const l of lattice) {
          if (l.released) continue
          const [x, y] = latticeXY(l)
          ctx.fillStyle = l.kind === '+' ? '#ff8a8a' : '#7fffaa'
          ctx.fillRect(x - cellSize * 0.4, y - cellSize * 0.4, cellSize * 0.8, cellSize * 0.8)
          ctx.strokeStyle = 'rgba(255,255,255,0.2)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x - cellSize * 0.4, y - cellSize * 0.4, cellSize * 0.8, cellSize * 0.8)
        }

        // Étiquette cristal
        const remaining = lattice.filter(l => !l.released).length
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (remaining > 0) {
          const totalW = N * cellSize
          ctx.fillText(`NaCl (${remaining})`, cx, cy + totalW / 2 + 14)
        }

        // Ions libres dérivent + sphère d'hydratation
        for (const ion of free) {
          ion.vx += (Math.random() - 0.5) * 30 * dt
          ion.vy += (Math.random() - 0.5) * 30 * dt
          ion.vx *= 0.97
          ion.vy *= 0.97
          ion.x += ion.vx * dt
          ion.y += ion.vy * dt
          if (ion.x < 30) { ion.x = 30; ion.vx *= -0.6 }
          if (ion.x > w - 30) { ion.x = w - 30; ion.vx *= -0.6 }
          if (ion.y < 75) { ion.y = 75; ion.vy *= -0.6 }
          if (ion.y > h - 80) { ion.y = h - 80; ion.vy *= -0.6 }

          // Sphère d'hydratation
          ctx.fillStyle = 'rgba(102, 180, 240, 0.18)'
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 12, 0, Math.PI * 2); ctx.fill()
          // 4 mini-H2O autour
          const t2 = elapsed * 2 + ion.x * 0.01
          for (let k = 0; k < 4; k++) {
            const a = t2 + (k * Math.PI / 2)
            const hx = ion.x + Math.cos(a) * 10
            const hy = ion.y + Math.sin(a) * 10
            ctx.fillStyle = 'rgba(180, 220, 255, 0.6)'
            ctx.beginPath(); ctx.arc(hx, hy, 2, 0, Math.PI * 2); ctx.fill()
          }
          // Ion central
          ctx.fillStyle = ion.kind === '+' ? '#ff6b6b' : '#7fffaa'
          ctx.beginPath(); ctx.arc(ion.x, ion.y, 5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#0a0e1a'
          ctx.font = 'bold 7px sans-serif'
          ctx.fillText(ion.kind === '+' ? 'Na⁺' : 'Cl⁻', ion.x, ion.y)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        // Légende
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('NaCl(s) + H₂O  ->  Na⁺(aq) + Cl⁻(aq)', w / 2, h - 50)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText('Les molécules d\'eau arrachent les ions de surface, un par un, et les entourent (solvatation)', w / 2, h - 28)
        ctx.textAlign = 'start'
      }
    }
  }, [])

  return <div className="stage"><canvas ref={canvasRef} /></div>
}
