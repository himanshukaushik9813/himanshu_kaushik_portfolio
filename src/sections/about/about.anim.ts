import { gsap, parallax, reduced } from '@/motion/reveal'

/** A8 + A9 (REFERENCE_ANALYSIS §6.6): one `top 78%` timeline + scrubbed portrait parallax. */
export function createAboutAnimation(root: HTMLElement) {
  if (reduced()) return
  gsap
    .timeline({ scrollTrigger: { trigger: root, start: 'top 78%', once: true } })
    .from(root.querySelectorAll('[data-reveal]'), { opacity: 0, y: 24, duration: 0.8, stagger: 0.12, ease: 'power3.out' })
    .from(root.querySelectorAll('[data-line]'), { yPercent: 110, duration: 1, stagger: 0.08, ease: 'power4.out' }, 0.08)
    .from(root.querySelector('[data-image]'), { clipPath: 'inset(0 0 100% 0)', y: 32, duration: 1.15, ease: 'power4.inOut' }, 0.12)
  const media = root.querySelector<HTMLElement>('[data-media]')
  if (media) parallax(media, root, { yPercent: -2 }, { yPercent: 2 }, 1)
}
