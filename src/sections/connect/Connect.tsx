import { Mail } from 'lucide-react'
import { contactRows } from '@/content/socials'
import { microcopy } from '@/content/microcopy'
import { RESUME_PATH, RESUME_PUBLIC } from '@/config/site'
import { BrandIcon, LinkedInGlyph } from '@/components/brand/BrandIcon'
import { Arrow } from '@/components/ui/Arrow'
import { useEffect, useRef, type ReactNode } from 'react'
import { EmailDialog, type EmailDialogHandle } from '@/components/email/EmailDialog'
import { useGsap } from '@/motion/useGsap'
import { gsap, reduced } from '@/motion/reveal'
import './connect.css'

const icon = (id: string) =>
  id === 'github' ? <BrandIcon slug="github" size={22} /> : id === 'linkedin' ? <LinkedInGlyph size={20} /> : <Mail size={22} strokeWidth={1.4} />

/** Let's connect (REFERENCE_ANALYSIS §6.11). The Email row is a button that opens the copy / open-Gmail dialog. */
export function Connect() {
  const ref = useRef<HTMLElement>(null)
  const emailDialog = useRef<EmailDialogHandle>(null)
  const email = contactRows.find((s) => s.id === 'email')?.handle ?? ''
  // A17–A18 (REFERENCE_ANALYSIS §6.11): one `top 74%` reveal + the looping note (plays only while in view).
  useGsap(() => {
    if (reduced()) return
    const root = ref.current!
    gsap
      .timeline({ scrollTrigger: { trigger: root, start: 'top 74%', once: true } })
      .from(root.querySelectorAll('[data-reveal]'), { opacity: 0, y: 24, duration: 0.75, stagger: 0.12, ease: 'power3.out' })
      .from(root.querySelectorAll('[data-title-line]'), { yPercent: 110, rotate: 2, duration: 1.05, stagger: 0.08, ease: 'power4.out' }, 0.06)
      .from(root.querySelectorAll('[data-connect-link]'), { opacity: 0, y: 32, duration: 0.7, stagger: 0.08, ease: 'power3.out' }, 0.28)
  }, ref)

  // A18: the looping note. SplitText is loaded on demand (it's only used here, far below the fold).
  useEffect(() => {
    if (reduced()) return
    const root = ref.current!
    const note = root.querySelector<HTMLElement>('[data-note]')
    const text = root.querySelector<HTMLElement>('[data-note-text]')
    if (!note || !text) return
    let cancelled = false
    let split: { words: Element[]; revert(): void } | null = null
    let tl: gsap.core.Timeline | null = null
    void import('gsap/SplitText').then(({ SplitText }) => {
      if (cancelled) return
      gsap.registerPlugin(SplitText)
      split = SplitText.create(text, { type: 'words', wordsClass: 'connect__note-word', aria: 'none' }) // words stay real text
      tl = gsap
        .timeline({ repeat: -1, repeatDelay: 0.25, scrollTrigger: { trigger: note, start: 'top bottom', end: 'bottom top', toggleActions: 'play pause resume pause' } })
        .fromTo(split.words, { opacity: 0, yPercent: 65 }, { opacity: 1, yPercent: 0, duration: 0.55, stagger: 0.08, ease: 'power3.out' })
        .to(split.words, { opacity: 0, yPercent: -45, duration: 0.42, stagger: 0.055, ease: 'power2.in' }, '+=0.85')
    })
    return () => {
      cancelled = true
      tl?.scrollTrigger?.kill()
      tl?.kill()
      split?.revert()
    }
  }, [])
  return (
    <section ref={ref} id="connect" tabIndex={-1} className="connect" data-section="connect" aria-labelledby="connect-title">
      <div className="container">
        <div className="connect__top">
          <div className="connect__intro" data-reveal>
            <p className="connect__eyebrow">{microcopy.connect.eyebrow}</p>
            <p className="connect__copy">{microcopy.connect.copy}</p>
          </div>
          <h2 id="connect-title" className="connect__title" aria-label="Let's connect.">
            <span className="connect__title-line" aria-hidden="true"><span data-title-line>{microcopy.connect.titleLines[0]}</span></span>
            <span className="connect__title-line" aria-hidden="true"><span data-title-line>{microcopy.connect.titleLines[1]}<span className="connect__dot">.</span></span></span>
          </h2>
        </div>
        <nav className="connect__links" aria-label="Contact links">
          {contactRows.map((s, i) => {
            const inner: ReactNode = (
              <>
                <span className="connect-row__index">{String(i + 1).padStart(2, '0')}</span>
                <span className="connect-row__name">
                  <span className="icon-circle icon-circle--large">{icon(s.id)}</span>
                  <span className="connect-row__label">{s.label}</span>
                </span>
                <span className="connect-row__detail">
                  {s.handle.includes('@') && !s.handle.startsWith('@') ? <>{s.handle.split('@')[0]}@<wbr />{s.handle.split('@')[1]}</> : s.handle}
                </span>
                <span className="icon-circle icon-circle--large connect-row__arrow"><Arrow size={18} stroke={1.3} /></span>
              </>
            )
            return s.id === 'email' ? (
              <button key={s.id} type="button" className="connect-row" data-hover="row" data-connect-link aria-haspopup="dialog" onClick={() => emailDialog.current?.open()}>
                {inner}
              </button>
            ) : (
              <a key={s.id} href={s.href} className="connect-row" data-hover="row" data-connect-link target="_blank" rel="noreferrer">{inner}</a>
            )
          })}
        </nav>
        <div className="connect__bottom">
          {RESUME_PUBLIC ? (
            <a href={RESUME_PATH} target="_blank" rel="noreferrer" className="connect__resume meta" data-hover="lift">{microcopy.connect.resume} <Arrow size={12} /></a>
          ) : <span />}
          <p className="connect__note" data-note><span aria-hidden="true">↳</span> <span data-note-text>{microcopy.connect.note}</span></p>
        </div>
      </div>
      <EmailDialog ref={emailDialog} email={email} />
    </section>
  )
}
