import { experience } from '@/content/experience'
import { microcopy } from '@/content/microcopy'
import { MetaRow } from '@/components/ui/MetaRow'
import { Arrow } from '@/components/ui/Arrow'
import { cn } from '@/lib/cn'
import { useRef } from 'react'
import { useGsap } from '@/motion/useGsap'
import { gsap, reduced, revealRows } from '@/motion/reveal'
import './experience.css'

const kindLabel = { role: 'Experience', leadership: 'Leadership', achievement: 'Recognition', education: 'Education' } as const

/**
 * Experience & Recognition (plan §11.1): built only from reference row patterns (Connect-row grid, Skills rules).
 * Rows with bullets show them inline (no accordion) so recruiters and crawlers always see responsibilities.
 */
export function Experience() {
  const ref = useRef<HTMLElement>(null)
  useGsap(() => {
    if (reduced()) return
    const root = ref.current!
    gsap.from(root.querySelector('[data-reveal]'), { opacity: 0, y: 24, duration: 0.75, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 88%', once: true } })
    revealRows(gsap.utils.toArray<HTMLElement>('[data-row]', root))
  }, ref)
  return (
    <section ref={ref} id="experience" tabIndex={-1} className="experience" data-section="experience" aria-labelledby="experience-title">
      <div className="container">
        <MetaRow left={microcopy.experience.left} right={microcopy.experience.right} className="experience__meta" data-reveal />
        <h2 id="experience-title" className="sr-only">Experience, leadership and recognition</h2>
        <ol className="experience__list">
          {experience.map((row, i) => {
            const Tag = row.href ? 'a' : 'div'
            return (
              <li key={row.id} className={cn('experience-row', row.emphasis === 'secondary' && 'experience-row--secondary')} data-row>
                <Tag className="experience-row__grid" data-row-content {...(row.href ? { href: row.href, target: '_blank', rel: 'noreferrer', 'data-hover': 'row' } : {})}>
                  <span className="experience-row__index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="experience-row__main">
                    <span className="experience-row__kind">{kindLabel[row.kind]}</span>
                    <span className="experience-row__title">{row.title}</span>
                  </span>
                  <span className="experience-row__detail">
                    {row.detail}
                    {row.bullets ? (
                      <ul className="experience-row__bullets">
                        {row.bullets.map((b) => <li key={b}>{b}</li>)}
                      </ul>
                    ) : null}
                  </span>
                  <span className="experience-row__end">{row.href ? <span className="icon-circle icon-circle--large"><Arrow size={16} /></span> : null}</span>
                </Tag>
                <span className="row-rule" data-rule aria-hidden="true" />
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
