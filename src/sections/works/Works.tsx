import { useRef } from 'react'
import { Link } from 'react-router'
import { featuredProjects } from '@/content/projects'
import { microcopy } from '@/content/microcopy'
import { MetaRow } from '@/components/ui/MetaRow'
import { Arrow } from '@/components/ui/Arrow'
import { ProjectArtTile, ProjectDetailShape, ProjectInfo, ProjectShot } from '@/components/project/ProjectParts'
import { gsap, ScrollTrigger } from '@/motion/gsap'
import { useGsap } from '@/motion/useGsap'
import { staticScenes } from '@/motion/useReducedMotion'
import { scrollToTarget } from '@/motion/scroll'
import { useRouteTransition } from '@/components/transitions/routeTransitionContext'
import './works.css'

const pad = (n: number) => String(n).padStart(2, '0')
const HOLD = 0.35 // timeline units each project rests (snap target sits in the middle)

/**
 * Works (A12–A13 + A24, REFERENCE_ANALYSIS §6.8 / §14.7).
 * The dark turnover card scrolls in from below like any section, then — inside the pin — is scrubbed up and off,
 * uncovering the already-pinned Featured gallery. The art strip (all projects in one column) moves up one frame
 * per project; the info card and counter cross-fade on index change; the footer line tracks progress; snap
 * rests on each project. Reduced motion: no pin, the card sits above an unpinned list of every project (CSS).
 */
export function Works() {
  const rootRef = useRef<HTMLElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const total = pad(featuredProjects.length)
  const transition = useRouteTransition()

  useGsap(() => {
    if (staticScenes()) return
    const root = rootRef.current!
    const q = gsap.utils.selector(root)
    const card = q('[data-works-turnover]')
    const strip = q('[data-works-track]')
    const infos = q('[data-works-info]') as HTMLElement[]
    const counter = q('[data-works-count]')[0] as HTMLElement
    const bar = q('[data-works-bar]')
    const n = infos.length
    const total = 1 + (n - 1) * (1 + HOLD) + HOLD
    const stopTime = (k: number) => (k === n - 1 ? total : 1 + k * (1 + HOLD) + HOLD / 2)
    const stops = [0, ...infos.map((_, k) => stopTime(k) / total)]

    gsap.set(infos, { opacity: 0, yPercent: 0 })
    gsap.set(infos[0]!, { opacity: 1 })
    const setActiveAttr = (idx: number) => infos.forEach((el, k) => el.toggleAttribute('data-active', k === idx))
    setActiveAttr(0)

    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.fromTo(card, { yPercent: 0 }, { yPercent: -100, duration: 1 }, 0)
    for (let k = 1; k < n; k++) tl.to(strip, { yPercent: -100 * k, duration: 1, ease: 'power1.inOut' }, 1 + HOLD + (k - 1) * (1 + HOLD))
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: total }, 0)

    let active = 0
    const show = (next: number) => {
      if (next === active) return
      const dir = next > active ? 1 : -1
      const prev = infos[active]!
      const incoming = infos[next]!
      gsap.killTweensOf([prev, incoming])
      gsap.to(prev, { opacity: 0, yPercent: -18 * dir, duration: 0.34, ease: 'power2.in' })
      gsap.fromTo(incoming, { opacity: 0, yPercent: 18 * dir }, { opacity: 1, yPercent: 0, duration: 0.42, ease: 'power3.out', delay: 0.12 })
      setActiveAttr(next)
      counter.textContent = pad(next + 1)
      active = next
    }

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(Math.max(window.innerHeight * (n + 1), 3200))}`,
      pin: true,
      pinSpacer: spacerRef.current, // own wrapper: no DOM move when pinning
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      snap: { snapTo: stops, duration: { min: 0.18, max: 0.45 }, ease: 'power2.inOut', delay: 0.08 },
      onUpdate: (self) => {
        const t = self.progress * total
        show(Math.max(0, Math.min(n - 1, t < 1 + HOLD + 0.5 ? 0 : Math.floor((t - 1 - HOLD - 0.5) / (1 + HOLD)) + 1)))
      },
    })

    // Keyboard: every project's links stay in the Tab order. Focusing one scrolls the pin to that project
    // (which also clears the turnover card), so focus never lands on something invisible.
    const onFocus = (e: FocusEvent) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('[data-works-info]')
      const inGallery = (e.target as HTMLElement).closest('[data-works-pin]')
      if (!inGallery) return
      const k = item ? infos.indexOf(item) : 0
      const want = stops[k + 1]!
      if (item ? active !== k || st.progress < stops[1]! - 0.01 : st.progress < stops[1]! - 0.01) {
        scrollToTarget(st.start + (st.end - st.start) * want, { immediate: true })
      }
    }
    root.addEventListener('focusin', onFocus)
    return () => {
      root.removeEventListener('focusin', onFocus)
      infos.forEach((el) => el.removeAttribute('data-active'))
    }
  }, rootRef)

  return (
    <div ref={spacerRef}>
    <section id="works" ref={rootRef} tabIndex={-1} className="works" data-section="works" aria-labelledby="works-title">
      <div className="works-turnover" data-section="works-turnover" data-works-turnover aria-hidden="true">
        <MetaRow left={microcopy.works.turnoverMeta} right={`(01—${total})`} />
        <p className="works-turnover__title">
          Selected <span className="works-turnover__muted">works</span>
          <span className="works-turnover__dot">.</span>
        </p>
        <div className="works-turnover__foot meta">
          <span>{microcopy.works.turnoverCue}</span>
          <Arrow size={26} stroke={1} />
        </div>
      </div>

      <div className="works-gallery container" data-works-pin>
        <MetaRow left={microcopy.works.headerLeft} center={microcopy.works.headerCenter} right={`(01—${total})`} className="works-gallery__meta" />
        <header className="works-header">
          <h2 id="works-title" className="works-header__title h-xl">{microcopy.works.title}</h2>
          <Link
            to="/projects"
            className="works-header__more"
            data-hover="underline"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
              e.preventDefault()
              transition.go('/projects', 'columns')
            }}
          >
            <span>{microcopy.works.viewMore}</span>
            <Arrow size={12} stroke={2} />
          </Link>
          <span className="works-header__count" aria-hidden="true" data-works-count>{pad(1)}</span>
        </header>
        <div className="works-body">
          <div className="works-body__info">
            {featuredProjects.map((p, i) => (
              <div key={p.id} className="works-body__info-item" data-works-info>
                <ProjectInfo project={p} index={i + 1} />
              </div>
            ))}
          </div>
          <div className="works-body__frame" data-works-gallery aria-hidden="true">
            <ol className="works-body__strip" data-works-track>
              {featuredProjects.map((p, i) => (
                <li key={p.id} className="works-card" data-work-card>
                  <ProjectArtTile project={p} index={i + 1} />
                  <ProjectShot project={p} />
                  <ProjectDetailShape project={p} index={i + 1} />
                </li>
              ))}
            </ol>
          </div>
        </div>
        <footer className="works-footer meta">
          <span>{microcopy.works.footerLeft}</span>
          <span className="works-footer__progress"><span className="works-footer__bar" data-works-bar /></span>
          <span className="works-footer__right">{microcopy.works.footerRight} <Arrow dir="down-right" size={11} /></span>
        </footer>
      </div>
    </section>
    </div>
  )
}
