import { useEffect, useRef } from 'react'

export interface CanvasController {
  onResize?: (w: number, h: number) => void
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, dt: number, t: number) => void
  dispose?: () => void
}

/**
 * Hook canvas avec DPR scaling + boucle requestAnimationFrame.
 * Le setup est ré-exécuté à chaque changement des dépendances.
 */
export function useCanvas(setup: () => CanvasController, deps: React.DependencyList = []) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const state = setup()
    let raf = 0
    let lastT = 0

    const resize = () => {
      const rect = c.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      c.width = Math.max(1, Math.floor(rect.width * dpr))
      c.height = Math.max(1, Math.floor(rect.height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      state.onResize?.(rect.width, rect.height)
    }

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - lastT) / 1000 || 0.016)
      lastT = t
      const w = c.clientWidth
      const h = c.clientHeight
      ctx.clearRect(0, 0, w, h)
      state.draw(ctx, w, h, dt, t / 1000)
      raf = requestAnimationFrame(loop)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(c)
    raf = requestAnimationFrame((t) => { lastT = t; loop(t) })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      state.dispose?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return canvasRef
}
