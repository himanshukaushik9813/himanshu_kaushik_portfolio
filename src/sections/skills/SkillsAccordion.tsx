import { useId, useRef, useState } from 'react'
import type { SkillGroup } from '@/types/content'
import { Arrow } from '@/components/ui/Arrow'
import { gsap } from '@/motion/gsap'
import { prefersReducedMotion } from '@/motion/useReducedMotion'

/**
 * One skills row (REFERENCE_ANALYSIS §6.10): giant trigger + rule; panel = sub-header left, items right.
 * Real button semantics (aria-expanded/controls). Panel content stays in the DOM (prerender-friendly).
 */
export function SkillsAccordion({ group }: { group: SkillGroup }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const toggle = () => {
    const panel = panelRef.current
    const next = !open
    setOpen(next)
    if (!panel) return
    if (prefersReducedMotion()) {
      panel.hidden = !next
      return
    }
    gsap.killTweensOf(panel)
    if (next) {
      panel.hidden = false
      gsap.fromTo(panel, { height: 0, autoAlpha: 0 }, { height: 'auto', autoAlpha: 1, duration: 0.75, ease: 'power3.inOut', clearProps: 'height' })
      gsap.from(panel.querySelectorAll('[data-skill-line]'), { y: 18, autoAlpha: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out', delay: 0.15 })
    } else {
      gsap.to(panel, { height: 0, autoAlpha: 0, duration: 0.55, ease: 'power3.inOut', onComplete: () => { panel.hidden = true; gsap.set(panel, { clearProps: 'height,opacity,visibility' }) } })
    }
  }

  return (
    <div className="skills-row" data-row>
      <div data-row-content>
        <h3 className="skills-row__heading">
          <button type="button" className="skills-row__trigger" aria-expanded={open} aria-controls={`${id}-panel`} onClick={toggle}>
            <span className="skills-row__title h-m">{group.title}</span>
            <span className="skills-row__arrow" data-open={open || undefined}><Arrow size={36} stroke={1.6} /></span>
          </button>
        </h3>
        <div ref={panelRef} id={`${id}-panel`} className="skills-row__panel" role="region" aria-label={group.title} hidden>
          {group.subgroups.map((sg) => (
            <div key={sg.title} className="skills-row__group" data-skill-line>
              <h4 className="skills-row__subheader">{sg.title}</h4>
              <ul className="skills-row__items">
                {sg.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <span className="row-rule" data-rule aria-hidden="true" />
    </div>
  )
}
