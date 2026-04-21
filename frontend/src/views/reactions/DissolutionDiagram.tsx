import { useCanvas } from '../../hooks/useCanvas'
import { drawLegend, drawCycleCounter } from './_legend'

// Cristal de NaCl posé dans l'eau. Les molécules d'eau attaquent les arêtes :
// les ions se détachent un par un, entourés de leur sphère d'hydratation.
// Quand tout est dissout, pause puis on rebuild un nouveau cristal.
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
    const cellSize = 22
    let nextRelease = 0
    let elapsed = 0
    let cycle = 1
    let pauseAfterEmpty = 0

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
      // L'ion fuit dans une direction aléatoire (pas juste vers l'extérieur),
      // ce qui le pousse à s'éparpiller dans tout le bécher.
      const a = Math.random() * Math.PI * 2
      const sp = 110 + Math.random() * 80
      free.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
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

        // Libération périodique d'un ion de bord, jusqu'à épuisement
        const remaining = lattice.filter(l => !l.released).length
        if (remaining === 0) {
          pauseAfterEmpty += dt
          if (pauseAfterEmpty > 2.5) {
            build(w, h)
            cycle += 1
            pauseAfterEmpty = 0
          }
        } else {
          nextRelease += dt
          if (nextRelease > 0.4) {
            nextRelease = 0
            releaseEdgeIon()
          }
        }

        // Cristal restant (cellules plus grandes avec étiquette)
        for (const l of lattice) {
          if (l.released) continue
          const [x, y] = latticeXY(l)
          const s = cellSize * 0.42
          const color = l.kind === '+' ? '#ff8a8a' : '#7fffaa'
          const g = ctx.createLinearGradient(x - s, y - s, x + s, y + s)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(1, color)
          ctx.fillStyle = g
          ctx.fillRect(x - s, y - s, s * 2, s * 2)
          ctx.strokeStyle = 'rgba(0,0,0,0.25)'
          ctx.lineWidth = 0.6
          ctx.strokeRect(x - s, y - s, s * 2, s * 2)
          ctx.fillStyle = '#0a0e1a'
          ctx.font = 'bold 8px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(l.kind === '+' ? 'Na⁺' : 'Cl⁻', x, y)
        }
        ctx.textBaseline = 'alphabetic'

        // Étiquette cristal
        ctx.fillStyle = 'rgba(255,255,255,0.7)'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        if (remaining > 0) {
          const totalW = N * cellSize
          ctx.fillText(`NaCl (${remaining})`, cx, cy + totalW / 2 + 14)
        }

        // Ions libres dérivent + sphère d'hydratation (taille agrandie)
        const FREE_R = 11
        for (const ion of free) {
          ion.vx += (Math.random() - 0.5) * 90 * dt
          ion.vy += (Math.random() - 0.5) * 90 * dt
          ion.vx *= 0.96
          ion.vy *= 0.96
          ion.x += ion.vx * dt
          ion.y += ion.vy * dt
          if (ion.x < 30) { ion.x = 30; ion.vx *= -0.6 }
          if (ion.x > w - 30) { ion.x = w - 30; ion.vx *= -0.6 }
          if (ion.y < 75) { ion.y = 75; ion.vy *= -0.6 }
          if (ion.y > h - 80) { ion.y = h - 80; ion.vy *= -0.6 }

          // Sphère d'hydratation (plus large)
          ctx.fillStyle = 'rgba(102, 180, 240, 0.20)'
          ctx.beginPath(); ctx.arc(ion.x, ion.y, FREE_R + 9, 0, Math.PI * 2); ctx.fill()
          // 5 mini-H2O autour
          const t2 = elapsed * 2 + ion.x * 0.01
          for (let k = 0; k < 5; k++) {
            const a = t2 + (k * Math.PI * 2 / 5)
            const hx = ion.x + Math.cos(a) * (FREE_R + 7)
            const hy = ion.y + Math.sin(a) * (FREE_R + 7)
            ctx.fillStyle = 'rgba(180, 220, 255, 0.7)'
            ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill()
          }
          // Ion central (gros)
          const color = ion.kind === '+' ? '#ff6b6b' : '#7fffaa'
          const g = ctx.createRadialGradient(ion.x - 3, ion.y - 3, 0, ion.x, ion.y, FREE_R)
          g.addColorStop(0, '#ffffff')
          g.addColorStop(0.45, color)
          g.addColorStop(1, color)
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(ion.x, ion.y, FREE_R, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = '#0a0e1a'
          ctx.font = 'bold 9px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(ion.kind === '+' ? 'Na⁺' : 'Cl⁻', ion.x, ion.y)
        }
        ctx.textAlign = 'start'
        ctx.textBaseline = 'alphabetic'

        // Légende des éléments + compteur de cycle
        drawLegend(ctx, 10, 10, [
          { color: '#ff8a8a', label: 'Na⁺ dans le réseau', shape: 'square' },
          { color: '#7fffaa', label: 'Cl⁻ dans le réseau', shape: 'square' },
          { color: '#ff6b6b', label: 'Na⁺ solvaté' },
          { color: '#66c8ff', label: "Molécule H₂O" },
        ])
        drawCycleCounter(ctx, w - 10, h - 70, cycle, undefined, 'Dissolution nº')

        // Équation + texte
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
