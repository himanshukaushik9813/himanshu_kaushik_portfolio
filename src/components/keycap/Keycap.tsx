import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router'
import { gsap } from '@/motion/gsap'
import { prefersReducedMotion } from '@/motion/useReducedMotion'
import { useRouteTransition, type HomeRestore, type WipeKind } from '@/components/transitions/routeTransitionContext'
import { cn } from '@/lib/cn'
import { KeycapFallback } from './KeycapFallback'
import { shouldUseWebGL } from './keycapSupport'
import type { KeycapSceneHandle } from './keycapScene'
import './keycap.css'

type Legend = 'enter' | 'backspace'
const SHORTCUT: Record<Legend, string> = { enter: 'Enter', backspace: 'Backspace' }
const INTERACTIVE = 'a[href], button, input, textarea, select, summary, [contenteditable=""], [contenteditable="true"], [role="button"], [role="link"]'

/**
 * Keycap CTA (REFERENCE_ANALYSIS §6.3–6.4, A20).
 * - A real link (works without JS). The DOM key shows at once; the Three.js scene is lazy-loaded when the
 *   browser is idle and fades in once its first frame is drawn. No WebGL / Lite mode → the DOM key stays.
 * - Hover / focus shows the key part-pressed; click or the physical key plays the full press (cap travel,
 *   small rock, accent glow) and starts the route wipe.
 * - Physical shortcut (Enter / Backspace) only when the key is ≥60% in view and actually visible, no field
 *   or other control has focus, and no modal is open.
 */
export function Keycap({ legend, caption, to, theme = 'light', className, wipe = 'bands', restore }: {
  legend: Legend; caption: string; to: string; theme?: 'light' | 'dark'; className?: string; wipe?: WipeKind; restore?: HomeRestore
}) {
  const rootRef = useRef<HTMLAnchorElement>(null)
  const glRef = useRef<HTMLSpanElement>(null)
  const sceneRef = useRef<KeycapSceneHandle | null>(null)
  const press = useRef({ p: 0, glow: 0 })
  const ratio = useRef(0)
  const [glReady, setGlReady] = useState(false)
  const transition = useRouteTransition()

  const apply = useCallback(() => {
    const { p, glow } = press.current
    sceneRef.current?.setPress(p, glow)
    rootRef.current?.style.setProperty('--press', p.toFixed(3))
  }, [])
  const tweenTo = useCallback((p: number, glow: number, duration: number, ease: string) => {
    return gsap.to(press.current, { p, glow, duration, ease, overwrite: true, onUpdate: apply })
  }, [apply])

  // Lazy WebGL scene
  useEffect(() => {
    if (!shouldUseWebGL()) return
    let cancelled = false
    let handle: KeycapSceneHandle | null = null
    let retry = 0
    const start = () => {
      // Never build the scene (shader compile, env map) while a route wipe is animating: wait for idle.
      if (transition.isBusy()) {
        retry = window.setTimeout(start, 250)
        return
      }
      void import('./keycapScene').then(({ createKeycapScene }) => {
        if (cancelled || !glRef.current) return
        handle = createKeycapScene(glRef.current, legend, () => setGlReady(true), () => setGlReady(false))
        sceneRef.current = handle
        apply()
      }).catch(() => setGlReady(false))
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void }
    const id = w.requestIdleCallback ? w.requestIdleCallback(start, { timeout: 2500 }) : window.setTimeout(start, 600)
    return () => {
      cancelled = true
      window.clearTimeout(retry)
      if (w.cancelIdleCallback) w.cancelIdleCallback(id)
      else window.clearTimeout(id)
      handle?.dispose()
      sceneRef.current = null
      setGlReady(false)
    }
  }, [legend, apply, transition])

  const activate = useCallback(() => {
    if (transition.isBusy()) return
    if (prefersReducedMotion()) {
      transition.go(to, wipe, { restore })
      return
    }
    tweenTo(1, 1, 0.12, 'power2.in').then(() => {
      transition.go(to, wipe, { restore })
      gsap.to(press.current, { p: 0, duration: 0.65, ease: 'back.out(2.4)', overwrite: true, onUpdate: apply })
      gsap.to(press.current, { glow: 0, duration: 1.1, ease: 'power2.out', onUpdate: apply })
    })
  }, [transition, to, wipe, restore, tweenTo, apply])

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return // new tab etc.
    e.preventDefault()
    activate()
  }
  const hoverOn = () => { if (!transition.isBusy()) tweenTo(0.5, 0.25, 0.35, 'power2.out') }
  const hoverOff = () => { if (!transition.isBusy()) tweenTo(0, 0, 0.45, 'power2.out') }

  // Physical key shortcut
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { ratio.current = e?.intersectionRatio ?? 0 }, { threshold: [0, 0.3, 0.6, 0.8, 1] })
    io.observe(el)
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== SHORTCUT[legend] || e.repeat || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      if (t && t !== document.body && t.closest(INTERACTIVE)) return
      if (ratio.current < 0.6) return
      if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return
      const modal = document.querySelector<HTMLElement>('[aria-modal="true"]')
      if (modal && modal.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return
      e.preventDefault()
      activate()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      io.disconnect()
      window.removeEventListener('keydown', onKey)
    }
  }, [legend, activate])

  return (
    <Link
      ref={rootRef}
      to={to}
      className={cn('keycap', `keycap--${theme}`, className)}
      aria-label={caption}
      aria-keyshortcuts={SHORTCUT[legend]}
      data-gl-ready={glReady || undefined}
      data-keycap={legend}
      onClick={onClick}
      onPointerEnter={(e) => { if (e.pointerType === 'mouse') hoverOn() }}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse') hoverOff() }}
      onFocus={hoverOn}
      onBlur={hoverOff}
    >
      <span className="keycap__stage">
        <KeycapFallback legend={legend} />
        <span className="keycap__gl" ref={glRef} />
      </span>
      <span className="keycap__caption caption">{caption}</span>
    </Link>
  )
}
