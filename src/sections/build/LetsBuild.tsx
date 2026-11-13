import { useRef } from 'react'
import { gsap, ScrollTrigger } from '@/motion/gsap'
import { useGsap } from '@/motion/useGsap'
import { prefersReducedMotion } from '@/motion/useReducedMotion'
import { buildWords } from '@/content/build'
import { buildWavePaths, centreOffset, type SlideBox } from './waveBuilder'
import './build.css'

/**
 * Let's build (A10–A11, REFERENCE_ANALYSIS §6.7). Pinned and scrubbed:
 * the track slides so each word lands centred while a coral connector draws itself between words;
 * then the earlier words clear, PRODUCTS fills coral left→right, its letters spread and fade from the centre.
 * Geometry (centring offsets + wave paths) is re-measured on every ScrollTrigger refresh.
 * Reduced motion: no pin, words stacked with PRODUCTS in coral (CSS).
 */
export function LetsBuild() {
  const rootRef = useRef<HTMLElement>(null)
  const last = buildWords.length - 1

  useGsap(() => {
    if (prefersReducedMotion()) return
    const root = rootRef.current!
    const q = gsap.utils.selector(root)
    const track = q('[data-build-track]')[0] as HTMLElement
    const svg = q('[data-build-wave]')[0] as unknown as SVGSVGElement
    const slides = q('[data-build-slide]') as HTMLElement[]
    const paths = q('[data-build-wave-segment]') as unknown as SVGPathElement[]
    const text = q('[data-build-product-text]')
    const fill = q('[data-build-product-fill]')
    const chars = q('[data-build-char]') as HTMLElement[]
    const n = slides.length

    let offsets: number[] = []
    let lengths: number[] = []
    const measure = () => {
      const boxes: SlideBox[] = slides.map((s) => ({ left: s.offsetLeft, width: s.offsetWidth }))
      offsets = boxes.map((b) => centreOffset(b, window.innerWidth))
      const fontSize = parseFloat(getComputedStyle(slides[0]!).fontSize)
      const first = slides[0]!
      const centerY = first.offsetTop + first.offsetHeight * 0.5
      svg.setAttribute('width', String(track.scrollWidth))
      svg.setAttribute('height', String(track.offsetHeight))
      const d = buildWavePaths(boxes, centerY, fontSize)
      lengths = paths.map((p, i) => {
        p.setAttribute('d', d[i] ?? '')
        const len = Math.ceil(p.getTotalLength()) + 2
        p.style.strokeDasharray = `${len}`
        return len
      })
    }
    measure()

    const spread = () => Math.min(window.innerWidth * 0.07, 100)
    const mid = (chars.length - 1) / 2
    const F = n - 1
    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.set(track, { x: () => offsets[0]! }, 0)
    paths.forEach((p, i) => tl.fromTo(p, { strokeDashoffset: () => lengths[i]!, opacity: 1 }, { strokeDashoffset: 0, duration: 0.85 }, i))
    for (let i = 0; i < F; i++) tl.to(track, { x: () => offsets[i + 1]!, duration: 1 }, i)
    // Finale (order confirmed in the recording): clear → fill → spread → centre-out fade.
    tl.to(slides.slice(0, F), { opacity: 0, duration: 0.4 }, F)
      .to(paths.slice(0, -1), { opacity: 0, duration: 0.4 }, F)
      .to(paths.slice(-1), { opacity: 0.3, duration: 0.4 }, F)
      .fromTo(fill, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75 }, F + 0.3)
      .to(paths.slice(-1), { opacity: 0, duration: 0.45 }, F + 0.6)
      .set(text, { opacity: 0 }, F + 1.05)
      .set(fill, { clipPath: 'none' }, F + 1.05)
      .to(chars, { x: (i: number) => (i - mid) * spread(), duration: 1, ease: 'power1.inOut' }, F + 1.05)
      .to(chars, { opacity: 0, duration: 0.45, stagger: { each: 0.07, from: 'center' } }, F + 1.4)
      .to({}, { duration: 0.15 })

    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: () => `+=${Math.round(Math.max(track.scrollWidth - window.innerWidth, window.innerHeight * F) + window.innerHeight * 2.05)}`,
      pin: true,
      scrub: ScrollTrigger.isTouch ? true : 0.8,
      fastScrollEnd: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onRefreshInit: measure,
      animation: tl,
    })
  }, rootRef)

  return (
    <section id="cta" ref={rootRef} className="lets-build" data-section="lets-build" aria-labelledby="lets-build-title">
      <h2 id="lets-build-title" className="sr-only">Let’s build APIs, systems and products</h2>
      <div className="lets-build__window" aria-hidden="true">
        <div className="lets-build__track" data-build-track>
          <svg className="lets-build__wave" data-build-wave>
            {buildWords.slice(1).map((w) => <path key={w} className="lets-build__wave-path" data-build-wave-segment />)}
          </svg>
          {buildWords.map((w, i) => (
            <span key={w} className="lets-build__slide" data-build-slide>
              {i === last ? (
                <>
                  <span className="lets-build__product-text" data-build-product-text>{w}</span>
                  <span className="lets-build__product-fill" data-build-product-fill>
                    {w.split('').map((ch, j) => <span key={j} className="lets-build__char" data-build-char>{ch}</span>)}
                  </span>
                </>
              ) : w}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
