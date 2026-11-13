import { skills } from '@/content/skills'
import { microcopy } from '@/content/microcopy'
import { socials } from '@/content/socials'
import { MetaRow } from '@/components/ui/MetaRow'
import { Arrow } from '@/components/ui/Arrow'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGsap } from '@/motion/useGsap'
import { gsap, reduced, revealRows, ScrollTrigger } from '@/motion/reveal'
import { ContributionCalendar } from '@/components/github/ContributionCalendar'
import { SkillsAccordion } from './SkillsAccordion'
import './skills.css'

/**
 * Skills (REFERENCE_ANALYSIS §6.10). Phase 4: animated accordion rows (SkillsAccordion) + row reveals.
 * Code activity (Phase 7): live GitHub heatmap for the real account; hidden entirely if the data can't load.
 */
export function Skills() {
  const github = socials.find((s) => s.id === 'github')!
  const GITHUB_USER = new URL(github.href).pathname.replace(/\//g, '')
  const ref = useRef<HTMLElement>(null)
  const [activityAvailable, setActivityAvailable] = useState(true)
  const hideActivity = useCallback(() => setActivityAvailable(false), [])
  // Removing the block changes the page height: re-measure every ScrollTrigger below it.
  useEffect(() => { if (!activityAvailable) ScrollTrigger.refresh() }, [activityAvailable])
  // A16 (REFERENCE_ANALYSIS §6.10): intro at top 92%, each row at top 88%, activity block at top 88%.
  useGsap(() => {
    if (reduced()) return
    const root = ref.current!
    gsap.from(root.querySelector('[data-reveal]'), { opacity: 0, y: 24, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 92%', once: true } })
    revealRows(gsap.utils.toArray<HTMLElement>('[data-row]', root))
    const activity = root.querySelector<HTMLElement>('[data-activity]')
    if (activity) gsap.from(activity, { opacity: 0, y: 34, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: activity, start: 'top 88%', once: true } })
  }, ref)
  return (
    <section ref={ref} id="skills" tabIndex={-1} className="skills" data-section="skills" aria-labelledby="skills-title">
      <div className="container">
        <h2 id="skills-title" className="sr-only">Skills and tools</h2>
        <MetaRow left={microcopy.skills.left} right={microcopy.skills.right} className="skills__meta" data-reveal />
        <div className="skills__list">
          {skills.map((g) => <SkillsAccordion key={g.title} group={g} />)}
        </div>
        {activityAvailable && <div className="code-activity" data-activity>
          <div className="code-activity__head">
            <span className="meta">{microcopy.skills.activity}</span>
            <a href={github.href} target="_blank" rel="noreferrer" className="code-activity__link" data-hover="lift">
              {microcopy.skills.viewGithub} <Arrow size={11} />
            </a>
          </div>
          <ContributionCalendar user={GITHUB_USER} onUnavailable={hideActivity} />
        </div>}
      </div>
    </section>
  )
}
