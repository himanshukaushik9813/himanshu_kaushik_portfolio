import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Monogram } from '@/components/brand/Monogram'
import { useSectionLinkHandler } from '@/components/transitions/sectionNavContext'
import { profile } from '@/content/profile'
import { gsap } from '@/motion/gsap'
import { useIntroExited } from '@/motion/introState'
import { prefersReducedMotion } from '@/motion/useReducedMotion'
import { MenuOverlay } from './MenuOverlay'
import './nav.css'

const SCROLL_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '])

/**
 * Navbar (A6, REFERENCE_ANALYSIS §6.5 + §14):
 * - hidden for the whole intro; shown once the user has *actually* scrolled (wheel/touch/key/pointer + movement)
 *   and the intro has been left. Direct entries (hash link / restored scroll) show it immediately.
 * - mount: y −24 → 0, opacity 0 → 1, .5 s cubic-bezier(.22,1,.36,1).
 */
export function SiteNav() {
  const introExited = useIntroExited()
  const [userScrolled, setUserScrolled] = useState(false)
  const [forceVisible] = useState(() => typeof window !== 'undefined' && (!!window.location.hash || window.scrollY > 0))
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const visible = menuOpen || forceVisible || (userScrolled && introExited)
  const onSectionLink = useSectionLinkHandler()

  // Detect a genuine user scroll (programmatic scrolls don't count), as in the reference.
  useEffect(() => {
    if (userScrolled) return
    let intent = false
    let lastY = window.scrollY
    const markIntent = () => { intent = true }
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
      if (!e.altKey && !e.ctrlKey && !e.metaKey && SCROLL_KEYS.has(e.key)) intent = true
    }
    const onScroll = () => {
      const y = window.scrollY
      if (intent && Math.abs(y - lastY) > 0.5) setUserScrolled(true)
      lastY = y
    }
    window.addEventListener('wheel', markIntent, { passive: true })
    window.addEventListener('touchmove', markIntent, { passive: true })
    window.addEventListener('pointerdown', markIntent, { passive: true })
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('wheel', markIntent)
      window.removeEventListener('touchmove', markIntent)
      window.removeEventListener('pointerdown', markIntent)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScroll)
    }
  }, [userScrolled])

  // Mount / unmount motion.
  useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const reduced = prefersReducedMotion()
    gsap.killTweensOf(nav)
    if (visible) {
      gsap.to(nav, { autoAlpha: 1, y: 0, duration: reduced ? 0 : 0.5, ease: 'cubic-bezier(.22,1,.36,1)' })
    } else {
      gsap.to(nav, { autoAlpha: 0, y: reduced ? 0 : -24, duration: reduced ? 0 : 0.35, ease: 'power2.in' })
    }
  }, [visible])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <div className="site-nav-layer">
      <nav ref={navRef} className="site-nav" aria-label="Primary navigation" data-visible={visible || undefined} inert={!visible} style={{ visibility: 'hidden', opacity: 0 }}>
        <div className="site-nav__bar">
          <a href="#hero" className="site-nav__brand" aria-label={`${profile.name}, back to top`} onClick={onSectionLink}>
            <Monogram className="site-nav__mark" />
            <strong className="site-nav__name">{profile.name}</strong>
          </a>
          <button
            ref={buttonRef}
            type="button"
            className="site-nav__menu-button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label="Open navigation menu"
            onClick={() => setMenuOpen(true)}
          >
            <span>Menu</span>
            <span className="site-nav__glyph" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </nav>
      <MenuOverlay open={menuOpen} onClose={closeMenu} returnFocusTo={buttonRef} />
    </div>
  )
}
