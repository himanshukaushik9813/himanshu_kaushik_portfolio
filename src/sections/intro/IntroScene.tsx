import { useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/motion/gsap'
import { useGsap } from '@/motion/useGsap'
import { setIntroExited } from '@/motion/introState'
import { staticScenes } from '@/motion/useReducedMotion'
import { scrollToTarget } from '@/motion/scroll'
import { intro } from '@/motion/tokens'
import { Hand } from 'lucide-react'
import { greetings } from '@/content/greetings'
import { profile } from '@/content/profile'
import { microcopy } from '@/content/microcopy'
import { Arrow } from '@/components/ui/Arrow'
import './intro.css'

const FONT_TIMEOUT = 6000

/**
 * Intro → Hero (A1–A5, REFERENCE_ANALYSIS §6.1–6.2, §14.7).
 * The light hero is mounted underneath; the dark intro panel sits on top and only its mask animates,
 * so the monogram is already there when the iris opens. One pinned, scrubbed timeline drives:
 * cue fade → iris → monogram sweep + hairline → hairline fade → name rise → subtitle → keycap/socials.
 * Reduced motion: no pin, the intro panel is hidden by CSS and the hero shows directly.
 */
export function IntroScene({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)

  useGsap(() => {
    const root = rootRef.current!
    const q = gsap.utils.selector(root)
    if (staticScenes()) {
      setIntroExited(true)
      return () => setIntroExited(false)
    }

    const panel = q('[data-intro-panel]')[0] as HTMLElement
    const greetingEls = q('[data-intro-greeting]') as HTMLElement[]
    const hand = q('[data-intro-hand]')
    const handLines = q('[data-intro-hand-lines]')
    const cue = q('[data-intro-cue]')
    const mark = q('[data-hero-mark]')[0] as HTMLElement
    const line = q('[data-hero-line]')
    const title = q('[data-hero-title]')
    const chars = q('[data-hero-char]')
    const subtitle = q('[data-hero-subtitle]')
    const actions = q('[data-hero-action]')

    // A1: greeting blur cross-fade loop (starts once fonts are ready, max 6 s wait).
    // The first greeting is painted visible straight away (it's the page's largest text, so this is the LCP);
    // the loop then starts at the moment that word is fully in.
    gsap.set(greetingEls.slice(1), { autoAlpha: 0, filter: `blur(${intro.greetingBlur}px)` })
    const loop = gsap.timeline({ repeat: -1, paused: true })
    const step = intro.greetingCycle
    const fade = intro.greetingFade
    greetingEls.forEach((el, i) => {
      loop.to(el, { autoAlpha: 1, filter: 'blur(0px)', duration: fade, ease: 'sine.inOut' }, i * step)
      loop.to(el, { autoAlpha: 0, filter: `blur(${intro.greetingBlur}px)`, duration: fade, ease: 'sine.inOut' }, i * step + step - fade)
    })
    // A2: waving hand + pulsing motion lines.
    const wave = gsap.timeline({ repeat: -1, paused: true })
    wave
      .fromTo(hand, { rotation: -intro.waveAngle }, { rotation: intro.waveAngle, duration: intro.waveBeat, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)
      .fromTo(handLines, { opacity: 0.6, scale: 0.9 }, { opacity: 1, scale: 1.08, duration: intro.waveBeat, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 0)

    let loopsRunning = false
    const playLoops = (on: boolean) => {
      if (on === loopsRunning) return
      loopsRunning = on
      if (on) {
        if (loop.totalTime() === 0) loop.play(fade)
        else loop.play()
        wave.play()
      } else { loop.pause(); wave.pause() }
    }
    let started = false
    const start = () => {
      if (started) return
      started = true
      if (!st || st.progress <= 0.001) playLoops(true)
    }
    const timer = window.setTimeout(start, FONT_TIMEOUT)
    void document.fonts?.ready.then(start)

    // A3–A5: the pinned timeline.
    gsap.set(title, { opacity: 0, scale: 0.8 })
    gsap.set(chars, { yPercent: 118, rotate: 3 })
    gsap.set([subtitle, actions], { opacity: 0 })
    gsap.set(mark, { xPercent: -50, yPercent: -50, x: 0, y: 0 })
    gsap.set(line, { scaleX: 0, '--line-fade': 0 })

    const radius = () => `${Math.ceil(Math.hypot(window.innerWidth, window.innerHeight) / 2) + 4}px`
    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.to(cue, { autoAlpha: 0, duration: 0.04 }, 0)
      .fromTo(panel, { '--reveal-radius': '0px' }, { '--reveal-radius': radius, duration: 0.64 }, 0.04)
      .set(panel, { autoAlpha: 0 }, 0.69)
      .to(mark, { x: () => -(window.innerWidth / 2 + mark.offsetWidth / 2 + 4), duration: 0.78, ease: 'sine.inOut' }, 0.7)
      .to(line, { scaleX: 1, duration: 0.55, ease: 'sine.inOut' }, 0.7)
      .to(line, { '--line-fade': 1, duration: 0.2 }, 1.48)
      .to(title, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.inOut' }, 1.68)
      .to(chars, { yPercent: 0, rotate: 0, duration: 0.28, stagger: 0.016, ease: 'power3.out' }, 1.75)
      .fromTo(subtitle, { y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, 2.01)
      .fromTo(actions, { y: 12 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.025, ease: 'power3.out' }, 2.05)
      .to({}, { duration: 0.5 }) // hold on the finished hero before the pin releases

    const st: ScrollTrigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(root.offsetHeight * intro.pinLength)}`,
      pin: true,
      pinSpacer: spacerRef.current, // our own wrapper: pinning never moves the intro in the DOM (keeps the LCP stable)
      scrub: intro.scrub,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: tl,
      onUpdate: (self) => {
        if (started) playLoops(self.progress <= 0.001)
        setIntroExited(self.progress >= 0.92)
      },
      onRefresh: (self) => setIntroExited(self.progress >= 0.92),
    })

    // Keyboard users: focusing a hero control before the reveal jumps to the finished hero.
    const onFocus = (e: FocusEvent) => {
      if (st.progress < 1 && (e.target as HTMLElement).closest('[data-section="hero"]')) {
        scrollToTarget(st.end, { immediate: true })
        tl.progress(1)
      }
    }
    root.addEventListener('focusin', onFocus)

    return () => {
      window.clearTimeout(timer)
      root.removeEventListener('focusin', onFocus)
      loop.kill()
      wave.kill()
      setIntroExited(false)
    }
  }, rootRef)

  return (
    <div ref={spacerRef}>
    <div id="hero" ref={rootRef} className="intro-scene" data-section="intro" tabIndex={-1}>
      <section className="intro" aria-label="Portfolio introduction" data-intro-panel>
        <p className="intro__title">
          <span className="sr-only">{microcopy.intro.heading} Welcome to {profile.name}'s portfolio.</span>
          <span className="intro__heading" aria-hidden="true">
            {microcopy.intro.heading}
            <span className="intro__wave-sign">
              <svg className="intro__wave-lines intro__wave-lines--left" data-intro-hand-lines viewBox="0 0 12 24" fill="none"><path d="M10 2C5 5 2 11 3 17" /></svg>
              <span className="intro__wave-hand" data-intro-hand><Hand className="intro__wave" strokeWidth={1.75} /></span>
              <svg className="intro__wave-lines intro__wave-lines--right" data-intro-hand-lines viewBox="0 0 22 32" fill="none"><path d="M2 6c7 3 11 8 11 15" /><path d="M7 2c10 4 14 12 14 22" /></svg>
            </span>
          </span>
          <span className="intro__greetings" aria-hidden="true">
            {greetings.map((g, i) => (
              <span key={g.lang} className={`intro__greeting intro__greeting--${g.script}`} data-intro-greeting data-active={i === 0 || undefined}>
                <span className="intro__word" lang={g.lang} dir={g.dir}>{g.word}</span>
                <span className="intro__language" lang={g.lang} dir={g.dir}>{g.language}</span>
              </span>
            ))}
          </span>
        </p>
        <p className="intro__cue" data-intro-cue>
          <span>{profile.introCue}</span>
          <Arrow dir="down" size={13} />
        </p>
      </section>
      {children}
    </div>
    </div>
  )
}
