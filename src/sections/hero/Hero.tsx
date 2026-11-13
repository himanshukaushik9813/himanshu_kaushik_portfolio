import { FolderOpen, Mail } from 'lucide-react'
import { profile } from '@/content/profile'
import { socials } from '@/content/socials'
import { microcopy } from '@/content/microcopy'
import { RESUME_PATH, RESUME_PUBLIC } from '@/config/site'
import { Keycap } from '@/components/keycap/Keycap'
import { BrandIcon, LinkedInGlyph } from '@/components/brand/BrandIcon'
import { Monogram } from '@/components/brand/Monogram'
import './hero.css'

const iconFor = (id: string) =>
  id === 'github' ? <BrandIcon slug="github" size={15} /> : id === 'linkedin' ? <LinkedInGlyph size={14} /> : <Mail size={15} strokeWidth={1.6} />

/**
 * Hero (REFERENCE_ANALYSIS §6.3). Mounted under the intro panel; IntroScene's pinned timeline reveals it:
 * centred monogram + hairline sweep (A4), then the per-character name rise (A5), subtitle, keycap and socials.
 */
export function Hero() {
  return (
    <section className="hero" data-section="hero">
      <div className="hero__mark" data-hero-mark aria-hidden="true">
        <Monogram className="hero__mark-logo" />
        <span className="hero__mark-line" data-hero-line />
      </div>
      <div className="hero__stage">
        <div className="hero__identity">
          <h1 className="hero-title h-hero" aria-label={profile.name} data-hero-title>
            {profile.heroWords.map((word) => (
              <span key={word} className="hero-title__word" aria-hidden="true">
                {word.split('').map((ch, i) => (
                  <span key={i} className="hero-title__char" data-hero-char>{ch}</span>
                ))}
              </span>
            ))}
          </h1>
          <p className="hero__subtitle" data-hero-subtitle>
            {profile.subtitleLines[0]}
            <br />
            {profile.subtitleLines[1]}
          </p>
          <div data-hero-action><Keycap legend="enter" caption={microcopy.hero.keycapCaption} to="/projects" className="hero__keycap" /></div>
        </div>
      </div>
      <footer className="hero__footer">
        <ul className="hero__socials" aria-label="Profile links">
          {socials.map((s) => (
            <li key={s.id} data-hero-action>
              <a href={s.href} target={s.id === 'email' ? undefined : '_blank'} rel={s.id === 'email' ? undefined : 'noreferrer'} data-label={s.label} className="icon-circle" data-hover="fill-y">
                {iconFor(s.id)}
                <span className="sr-only">{s.label}</span>
              </a>
            </li>
          ))}
          {RESUME_PUBLIC ? (
            <li data-hero-action>
              <a href={RESUME_PATH} target="_blank" rel="noreferrer" data-label="Résumé" className="icon-circle" data-hover="fill-y">
                <FolderOpen size={15} strokeWidth={1.6} aria-hidden="true" />
                <span className="sr-only">View résumé</span>
              </a>
            </li>
          ) : null}
        </ul>
      </footer>
    </section>
  )
}
