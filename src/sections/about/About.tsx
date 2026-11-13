import { profile } from '@/content/profile'
import { RESUME_PATH, RESUME_PUBLIC } from '@/config/site'
import { microcopy } from '@/content/microcopy'
import { MetaRow } from '@/components/ui/MetaRow'
import { Arrow } from '@/components/ui/Arrow'
import { useRef } from 'react'
import { useGsap } from '@/motion/useGsap'
import { createAboutAnimation } from './about.anim'
import './about.css'

const sizes = '(max-width: 1023px) 92vw, 48vw'
const srcset = (ext: string) => [640, 1024, 1600, 2400].map((w) => `/img/portrait/himanshu-${w}.${ext} ${w}w`).join(', ')

/** About (REFERENCE_ANALYSIS §6.6 + §14: near-square photo at ≥1800 container, darker left-24% echo strip). */
export function About() {
  const { about } = profile
  const ref = useRef<HTMLElement>(null)
  useGsap(() => createAboutAnimation(ref.current!), ref)
  return (
    <section ref={ref} id="what-i-do" tabIndex={-1} className="about" data-section="what-i-do" aria-labelledby="about-title">
      <div className="container about__layout">
        <div className="about__copy">
          <MetaRow left={about.kicker[0]} right={about.kicker[1]} className="about__kicker" data-reveal />
          <h2 id="about-title" className="about__title h-l" aria-label={about.titleLines.join(' ')}>
            <span className="about__line" aria-hidden="true"><span className="about__muted" data-line>{about.titleLines[0]}</span></span>
            <span className="about__line" aria-hidden="true"><span data-line>{about.titleLines[1]}</span></span>
          </h2>
          <p className="about__intro" data-reveal>
            {about.paragraph.map((seg, i) => (seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>))}
          </p>
          {RESUME_PUBLIC ? (
            <a href={RESUME_PATH} target="_blank" rel="noreferrer" className="about__resume meta" data-hover="lift">
              {microcopy.connect.resume} <Arrow size={12} />
            </a>
          ) : null}
        </div>
        <figure className="about__portrait" data-image>
          <div className="about__media" data-media>
          <picture>
            <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
            <source type="image/webp" srcSet={srcset('webp')} sizes={sizes} />
            <img className="about__image" src="/img/portrait/himanshu-1600.jpg" alt={profile.name} width={3024} height={4032} loading="lazy" decoding="async" />
          </picture>
          <picture aria-hidden="true">
            <source type="image/avif" srcSet={srcset('avif')} sizes={sizes} />
            <img className="about__image about__image--echo" src="/img/portrait/himanshu-1024.webp" alt="" width={3024} height={4032} loading="lazy" decoding="async" />
          </picture>
          </div>
        </figure>
      </div>
    </section>
  )
}
