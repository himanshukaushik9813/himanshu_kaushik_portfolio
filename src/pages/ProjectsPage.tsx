import { Link } from 'react-router'
import { publishedProjects } from '@/content/projects'
import { microcopy } from '@/content/microcopy'
import { profile } from '@/content/profile'
import { Monogram } from '@/components/brand/Monogram'
import { Arrow } from '@/components/ui/Arrow'
import { Keycap } from '@/components/keycap/Keycap'
import { ProjectArtTile, ProjectDetailShape, ProjectInfo, ProjectShot } from '@/components/project/ProjectParts'
import './projects.css'

const pad = (n: number) => String(n).padStart(2, '0')

/** /projects: dark archive with full engineering write-ups (plan §11.2), reference archive anatomy. */
export default function ProjectsPage() {
  const m = microcopy.projects
  const total = pad(publishedProjects.length)
  return (
    <main className="archive" data-page="projects">
      <nav className="archive-nav" aria-label="Archive navigation">
        <Link to="/" className="archive-nav__back" aria-label="Back to home">
          <Arrow dir="left" size={16} />
          <Monogram className="archive-nav__mark" />
        </Link>
        <span className="archive-nav__center">{m.navCenter}</span>
        <span className="archive-nav__right">{m.navRight}</span>
      </nav>

      <header className="archive-hero">
        <div className="archive-hero__side">
          <span className="meta">{m.metaLeft}</span>
          <Keycap legend="backspace" caption={m.keycapCaption} to="/" theme="dark" className="archive-hero__keycap" />
          <span className="meta">(01—{total})</span>
        </div>
        <div className="archive-hero__main">
          <h1 className="archive-hero__title">
            <span className="sr-only">{profile.name}: project archive. </span>
            {m.heroPhrases.map((p) => (
              <span key={p.text} className={p.muted ? 'archive-hero__muted' : undefined}>{p.text} </span>
            ))}
          </h1>
          <p className="archive-hero__note">{m.heroNote}</p>
        </div>
      </header>

      <ol className="archive-list">
        {publishedProjects.map((p, i) => (
          <li key={p.id} className="archive-item" id={p.id}>
            <div className="archive-item__card">
              <div className="archive-item__info"><ProjectInfo project={p} index={i + 1} dark headingLevel={2} /></div>
              <ProjectArtTile project={p} index={i + 1} />
              <ProjectShot project={p} />
              <ProjectDetailShape project={p} index={i + 1} />
            </div>
            <div className="archive-item__write-up">
              <span className="meta">{m.engineering}</span>
              <div>
                <ul className="archive-item__bullets">
                  {p.work.map((w) => <li key={w}>{w}</li>)}
                  {p.extraFacts?.map((w) => <li key={w}>{w}</li>)}
                </ul>
                <p className="archive-item__links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" data-hover="lift">{l.label} <Arrow size={11} /></a>
                  ))}
                  {p.offline ? <span className="badge"><span className="badge__dot" />Demo offline</span> : null}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <footer className="archive-footer">
        <p className="meta">{m.footerEyebrow}</p>
        <a href={`mailto:${profile.email}`} className="archive-footer__cta" data-hover="lift">{m.footerCta} <Arrow dir="down-right" size={28} stroke={1.2} /></a>
        <p className="meta archive-footer__end">{m.footerEnd}</p>
      </footer>
    </main>
  )
}
