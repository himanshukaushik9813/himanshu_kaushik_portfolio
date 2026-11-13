import type { Project } from '@/types/content'
import { BrandIcon } from '@/components/brand/BrandIcon'
import { Arrow } from '@/components/ui/Arrow'
import { microcopy } from '@/content/microcopy'
import { cn } from '@/lib/cn'
import './project.css'

const pad = (n: number) => String(n).padStart(2, '0')

export function TechChips({ project }: { project: Project }) {
  return (
    <ul className="tech-chips" aria-label="Tech stack">
      {project.stack.map((t, i) => (
        <li key={t.name} className="tech-chips__item">
          <BrandIcon slug={t.icon} size={13} colored />
          <span>{t.name}</span>
          {i < project.stack.length - 1 ? <span aria-hidden="true" className="tech-chips__sep">/</span> : null}
        </li>
      ))}
    </ul>
  )
}

export function ProjectLinksRow({ project }: { project: Project }) {
  const live = project.links.find((l) => l.kind === 'live')
  const code = project.links.find((l) => l.kind === 'code')
  return (
    <div className="project-links" data-hover="fill-x">
      {live ? (
        <a href={live.href} target="_blank" rel="noreferrer" className="project-links__main">View live project</a>
      ) : (
        <span className="project-links__main project-links__main--muted">
          {code ? <a href={code.href} target="_blank" rel="noreferrer">View code</a> : 'View code'}
        </span>
      )}
      <span className="project-links__end">
        {project.offline ? (
          <span className="badge"><span className="badge__dot" />Demo offline</span>
        ) : null}
        {code && live ? <a href={code.href} target="_blank" rel="noreferrer">Code</a> : null}
        <Arrow size={12} />
      </span>
    </div>
  )
}

export function ProjectInfo({ project, index, dark = false, headingLevel = 3 }: { project: Project; index: number; dark?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className={cn('project-info', dark && 'project-info--dark')} data-work-copy>
      <div className="project-info__head">
        <span className="project-info__index">{pad(index)}</span>
        <div>
          <Heading className="project-info__title">{project.title}</Heading>
          {project.badge ? <p className="project-info__badge"><span className="badge__dot badge__dot--filled" />{project.badge}</p> : null}
          <TechChips project={project} />
        </div>
      </div>
      <p className="project-info__summary">{project.summary}</p>
      <ProjectLinksRow project={project} />
    </div>
  )
}

export function ProjectArtTile({ project, index }: { project: Project; index: number }) {
  return (
    <div className="project-art" style={{ background: `var(--p${project.accentSlot}-accent)`, color: `var(--p${project.accentSlot}-ink)` }}>
      <span className="project-art__kicker">Selected / {pad(index)}</span>
      <span className="project-art__mark">{pad(index)}</span>
    </div>
  )
}

export function ProjectShot({ project }: { project: Project }) {
  if (project.screenshot) {
    return <img className="project-shot" src={project.screenshot} alt={`${project.title} screenshot`} width={1080} height={1350} loading="lazy" decoding="async" />
  }
  return (
    <div className="project-shot project-shot--pending" style={{ background: `var(--p${project.accentSlot}-soft)`, color: `var(--p${project.accentSlot}-ink)` }}>
      <span className="caption">{microcopy.works.screenshotPending}</span>
    </div>
  )
}

export function ProjectDetailShape({ project, index }: { project: Project; index: number }) {
  const accent = `var(--p${project.accentSlot}-accent)`
  const soft = `var(--p${project.accentSlot}-soft)`
  return (
    <div className="project-detail">
      <span className="project-detail__index">{pad(index)}</span>
      <svg className="project-detail__shape" viewBox="0 0 200 200" aria-hidden="true">
        {project.detailShape === 'ring' ? (
          <>
            <circle cx="100" cy="100" r="88" fill={accent} />
            <circle cx="100" cy="100" r="70" fill={soft} stroke="var(--stone-950)" strokeOpacity=".25" strokeWidth="1" />
          </>
        ) : project.detailShape === 'crescent' ? (
          <>
            <circle cx="100" cy="100" r="80" fill="none" stroke={accent} strokeWidth="14" />
            <circle cx="112" cy="90" r="80" fill="var(--detail-bg, var(--stone-100))" />
            <circle cx="100" cy="100" r="66" fill="none" stroke="var(--stone-400)" strokeOpacity=".5" strokeWidth="1" />
          </>
        ) : (
          <g transform="rotate(-14 100 100)" fill="none" stroke={accent} strokeWidth="1.6">
            <rect x="38" y="38" width="124" height="124" />
            <path d="M79 38V162M121 38V162M38 79H162M38 121H162" />
          </g>
        )}
      </svg>
      <span className="project-detail__footer">{project.category}</span>
    </div>
  )
}
