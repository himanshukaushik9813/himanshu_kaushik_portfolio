import { Monogram } from '@/components/brand/Monogram'
import { profile } from '@/content/profile'
import { microcopy } from '@/content/microcopy'
import { Arrow } from '@/components/ui/Arrow'
import { useSectionLinkHandler } from '@/components/transitions/sectionNavContext'
import { SECTION_LINKS } from '@/content/navigation'
import { scrollToTarget } from '@/motion/scroll'
import { useRef } from 'react'
import { useGsap } from '@/motion/useGsap'
import { gsap, reduced } from '@/motion/reveal'
import './footer.css'

const links = SECTION_LINKS.filter((l) => l.href !== '#hero')

/** Footer (REFERENCE_ANALYSIS §6.12 + §14): giant first name fitted to the container, 12% ink, cropped at the bottom. */
export function SiteFooter() {
  const onSectionLink = useSectionLinkHandler()
  const ref = useRef<HTMLElement>(null)
  // A19: footer items rise 28px, stagger .1, at top 76%.
  useGsap(() => {
    if (reduced()) return
    gsap.from(ref.current!.querySelectorAll('[data-footer-reveal]'), { opacity: 0, y: 28, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: ref.current, start: 'top 76%', once: true } })
  }, ref)
  const toTop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    scrollToTarget('#hero')
  }
  return (
    <footer ref={ref} id="footer" className="site-footer" data-section="footer">
      <div className="container">
        <div className="site-footer__row">
          <a href="#hero" aria-label={`${profile.name}, back to top`} onClick={toTop} data-footer-reveal><Monogram className="site-footer__logo" /></a>
          <nav className="site-footer__nav" aria-label="Footer navigation" data-footer-reveal>
            {links.map((l) => <a key={l.href} href={l.href} onClick={onSectionLink} data-hover="lift">{l.label}</a>)}
          </nav>
          <a href="#hero" className="site-footer__top" onClick={toTop} data-hover="lift" data-footer-reveal>{microcopy.footer.backToTop} <Arrow size={10} /></a>
        </div>
        <p className="site-footer__name" aria-hidden="true" data-footer-reveal>
          <span className="site-footer__name-line">{profile.heroWords[0]}</span>
        </p>
      </div>
    </footer>
  )
}
