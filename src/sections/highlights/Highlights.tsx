import { highlights } from '@/content/highlights'
import { publishedProjects } from '@/content/projects'
import { microcopy } from '@/content/microcopy'
import { cn } from '@/lib/cn'
import { useEffect, useRef } from 'react'
import { useGsap } from '@/motion/useGsap'
import { gsap, parallax, reduced } from '@/motion/reveal'
import './highlights.css'

/**
 * Highlights board (REFERENCE_ANALYSIS §6.9 + §14). Videos only when a real recording exists;
 * otherwise a placeholder tile. No generated or fake media (CONTENT.md §12).
 */
export function Highlights() {
  const visible = highlights.filter((h) => publishedProjects.some((p) => p.id === h.projectId))
  // The big panel goes to a real recording when one exists; placeholders take the small slots.
  const featured = visible.find((h) => h.featured && h.src) ?? visible.find((h) => h.src) ?? visible.find((h) => h.featured) ?? visible[0]
  const side = visible.filter((h) => h !== featured)
  const projectOf = (id: string) => publishedProjects.find((p) => p.id === id)!
  const ref = useRef<HTMLElement>(null)
  // A14–A15 (REFERENCE_ANALYSIS §6.9): header at top 76%, board clip-reveal at top 82%, featured media parallax.
  useGsap(() => {
    if (reduced()) return
    const root = ref.current!
    gsap.from(root.querySelectorAll('[data-reveal]'), { opacity: 0, y: 48, duration: 1, stagger: 0.12, ease: 'power3.out', scrollTrigger: { trigger: root, start: 'top 76%', once: true } })
    const board = root.querySelector<HTMLElement>('[data-board]')!
    gsap
      .timeline({ scrollTrigger: { trigger: board, start: 'top 82%', once: true } })
      .from(board, { opacity: 0, y: 64, clipPath: 'inset(10% 0 0 0 round 40px)', duration: 1.15, ease: 'power4.out', clearProps: 'clipPath' })
      .from(board.querySelectorAll('[data-panel]'), { opacity: 0, scale: 0.965, duration: 0.9, stagger: 0.09, ease: 'power3.out' }, 0.2)
    const media = board.querySelector<HTMLElement>('.motion-study--featured [data-media]')
    if (media) parallax(media, board, { yPercent: -4, scale: 1.08 }, { yPercent: 4, scale: 1.02 }, 0.8)
  }, ref)
  return (
    <section ref={ref} id="mockups" tabIndex={-1} className="highlights" data-section="mockups" aria-labelledby="highlights-title">
      <div className="container">
        <header className="highlights__header">
          <h2 id="highlights-title" className="highlights__title" data-reveal>
            <span>{microcopy.highlights.titleLines[0]}</span>
            <span className="highlights__title-muted">{microcopy.highlights.titleLines[1]}</span>
          </h2>
          <div className="highlights__aside" data-reveal>
            <p className="highlights__intro">{microcopy.highlights.intro}</p>
            <div className="highlights__count">
              <span className="meta">{microcopy.highlights.onView}</span>
              <strong>{String(visible.length).padStart(2, '0')}</strong>
            </div>
          </div>
        </header>
        <div className="highlights__board" data-board>
          {featured ? (
            <figure className="motion-study motion-study--featured" data-panel>
              <StudyMedia src={featured.src} srcWebm={featured.srcWebm} poster={featured.poster} label={featured.label} />
              <figcaption className="motion-study__caption">
                <span className="motion-study__title">{projectOf(featured.projectId).title}</span>
                <span className="motion-study__note">{projectOf(featured.projectId).category}</span>
              </figcaption>
            </figure>
          ) : null}
          <div className="highlights__side">
            {side.map((h) => (
              <figure key={h.id} className={cn('motion-study', h.src && 'motion-study--has-video')} data-panel>
                <StudyMedia src={h.src} srcWebm={h.srcWebm} poster={h.poster} label={h.label} />
                <figcaption className="motion-study__tag meta">{projectOf(h.projectId).title}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="highlights__footer meta" data-reveal>
          <span>{microcopy.highlights.footer[0]}</span>
          <span>{microcopy.highlights.footer[1]}</span>
        </div>
      </div>
    </section>
  )
}

function StudyMedia({ src, srcWebm, poster, label }: { src?: string; srcWebm?: string; poster?: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // Plays only while on screen (and never with reduced motion: the poster stays), so off-screen
  // clips cost nothing.
  useEffect(() => {
    const video = videoRef.current
    if (!video || reduced()) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void video.play().catch(() => undefined)
      else video.pause()
    }, { threshold: 0.25 })
    io.observe(video)
    return () => io.disconnect()
  }, [src])
  if (src) {
    return (
      <div className="motion-study__media" data-media>
        <video ref={videoRef} className="motion-study__video" poster={poster} muted playsInline loop preload="none" aria-label={label}>
          {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
          <source src={src} type="video/mp4" />
        </video>
      </div>
    )
  }
  return (
    <div className={cn('motion-study__pending')} data-media>
      <span className="caption">{microcopy.highlights.pending}</span>
    </div>
  )
}
