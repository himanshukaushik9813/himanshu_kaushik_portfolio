import { useEffect, useLayoutEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Monogram } from '@/components/brand/Monogram'
import { BrandIcon, LinkedInGlyph } from '@/components/brand/BrandIcon'
import { useSectionLinkHandler } from '@/components/transitions/sectionNavContext'
import { SECTION_LINKS } from '@/content/navigation'
import { profile } from '@/content/profile'
import { elsewhere } from '@/content/socials'
import { RESUME_PATH, RESUME_PUBLIC } from '@/config/site'
import { lockScroll } from '@/motion/lenis'
import { prefersReducedMotion } from '@/motion/useReducedMotion'
import { createMenuAnimation } from './menu.anim'


const elsewhereIcon = (id: string) =>
  id === 'github' ? <BrandIcon slug="github" size={13} /> : id === 'linkedin' ? <LinkedInGlyph size={12} /> : <span aria-hidden="true" className="menu-aside__dot" />

/**
 * Full-screen menu (REFERENCE_ANALYSIS §6.5): dialog semantics, focus trap, Esc closes,
 * scroll locked while open, focus returns to the MENU button on close.
 */
export function MenuOverlay({ open, onClose, returnFocusTo }: { open: boolean; onClose: () => void; returnFocusTo: React.RefObject<HTMLButtonElement | null> }) {
  const panelRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<ReturnType<typeof createMenuAnimation> | null>(null)
  const wasOpen = useRef(false)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const compact = window.matchMedia('(max-width: 640px)').matches
    const anim = createMenuAnimation(panel, { compact, reduced: prefersReducedMotion() })
    animRef.current = anim
    return () => anim.revert()
  }, [])

  useEffect(() => {
    const anim = animRef.current
    if (!anim) return
    if (open) {
      wasOpen.current = true
      lockScroll(true)
      anim.open()
      requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('.menu__close')?.focus())
    } else if (wasOpen.current) {
      wasOpen.current = false
      anim.close(() => lockScroll(false))
      returnFocusTo.current?.focus()
    }
  }, [open, returnFocusTo])

  // Esc + focus trap
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')].filter((el) => el.checkVisibility())
      const first = items[0]
      const last = items.at(-1)
      if (!panelRef.current.contains(document.activeElement)) {
        e.preventDefault()
        first?.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const onSectionLink = useSectionLinkHandler({
    beforeJump: () => {
      animRef.current?.hideNow()
      wasOpen.current = false
      onClose()
    },
  })

  return (
    <div
      ref={panelRef}
      id="site-menu"
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      aria-hidden={!open}
      inert={!open}
    >
      <div className="menu__head">
        <a href="#hero" className="menu__brand" onClick={onSectionLink} aria-label={`${profile.name}, back to top`}>
          <Monogram className="menu__mark" />
          <strong>{profile.name}</strong>
        </a>
        <button type="button" className="menu__close" onClick={onClose} aria-label="Close navigation menu">
          <span>Close</span>
          <X strokeWidth={1.4} aria-hidden="true" />
        </button>
      </div>
      <div className="menu__body">
        <nav className="menu__list" aria-label="Sections">
          {SECTION_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="menu-link" onClick={onSectionLink}>
              <span className="menu-link__inner">
                <span className="menu-link__label">{l.label}</span>
              </span>
            </a>
          ))}
        </nav>
        <aside className="menu-aside">
          <div className="menu-aside__block" data-menu-reveal>
            <small>Start a conversation</small>
            <a href={`mailto:${profile.email}`} className="menu-aside__email">{profile.email}</a>
          </div>
          <div className="menu-aside__block" data-menu-reveal>
            <small>Elsewhere</small>
            <ul>
              {elsewhere.map((s) => (
                <li key={s.id}>
                  <a href={s.href} target="_blank" rel="noreferrer">
                    {elsewhereIcon(s.id)}
                    <span>{s.label}</span>
                  </a>
                </li>
              ))}
              {RESUME_PUBLIC ? (
                <li><a href={RESUME_PATH} target="_blank" rel="noreferrer"><span aria-hidden="true" className="menu-aside__dot" /><span>Résumé</span></a></li>
              ) : null}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
