import { useCallback, useMemo, useRef, type ReactNode } from 'react'
import { gsap } from '@/motion/gsap'
import { lockScroll } from '@/motion/lenis'
import { scrollToTarget } from '@/motion/scroll'
import { prefersReducedMotion } from '@/motion/useReducedMotion'
import { SectionNavContext, type SectionNavigate } from './sectionNavContext'
import './fade-cover.css'

/**
 * Menu/footer → section transition (A23, REFERENCE_ANALYSIS §14.2):
 * cover fades in to paper → jump instantly under it → cover fades out while the
 * target section's content rises in. Timings ≈ .4 s + .5 s [A].
 */
export function SectionNavProvider({ children }: { children: ReactNode }) {
  const coverRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)

  const navigate = useCallback<SectionNavigate>((hash, opts) => {
    const target = hash === '#hero' || hash === '#top' ? document.querySelector<HTMLElement>('#hero') : document.querySelector<HTMLElement>(hash)
    const cover = coverRef.current
    if (!target || !cover || busy.current) return
    const jump = () => {
      opts?.beforeJump?.()
      lockScroll(false)
      scrollToTarget(target, { immediate: true })
      history.replaceState(null, '', hash === '#hero' ? location.pathname : hash)
    }
    if (prefersReducedMotion()) {
      jump()
      target.focus({ preventScroll: true })
      return
    }
    busy.current = true
    const content = target.querySelector<HTMLElement>(':scope > .container, :scope > *') ?? target
    gsap
      .timeline({
        onComplete: () => {
          busy.current = false
          target.focus({ preventScroll: true })
        },
      })
      .set(cover, { autoAlpha: 0, display: 'block' })
      .to(cover, { autoAlpha: 1, duration: 0.4, ease: 'power2.inOut' })
      .add(jump)
      .fromTo(content, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out', clearProps: 'transform,opacity,visibility' }, '+=0.05')
      .to(cover, { autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, '<')
      .set(cover, { display: 'none' })
  }, [])

  const value = useMemo(() => navigate, [navigate])
  return (
    <SectionNavContext.Provider value={value}>
      {children}
      <div ref={coverRef} className="fade-cover" aria-hidden="true" />
    </SectionNavContext.Provider>
  )
}
