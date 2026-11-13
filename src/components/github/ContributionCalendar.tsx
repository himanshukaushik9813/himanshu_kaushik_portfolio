import { useEffect, useMemo, useRef, useState } from 'react'
import { fetchContributions, toWeeks, type ContributionYear } from '@/lib/contributions'
import './calendar.css'

type State = { status: 'idle' | 'loading' } | { status: 'ready'; data: ContributionYear } | { status: 'error' }

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const plural = (n: number) => `${n.toLocaleString('en-US')} contribution${n === 1 ? '' : 's'}`

/**
 * GitHub contribution heatmap (REFERENCE_ANALYSIS §6.10 [V]): stone greyscale, rounded square cells,
 * month labels on top, Mon/Wed/Fri on the left, "N contributions in the last year" + Less/More legend.
 * Own lightweight component instead of react-github-calendar (same data source, no extra dependency).
 * Loads only when the block is near the viewport; shows a neutral skeleton while loading; on failure the
 * whole block is hidden (onUnavailable) so nothing fake or broken is ever shown.
 */
export function ContributionCalendar({ user, onUnavailable }: { user: string; onUnavailable: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<State>({ status: 'idle' })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      io.disconnect()
      setState({ status: 'loading' })
      fetchContributions(user)
        .then((data) => { if (!cancelled) setState({ status: 'ready', data }) })
        .catch(() => { if (!cancelled) { setState({ status: 'error' }); onUnavailable() } })
    }, { rootMargin: '1200px 0px' })
    io.observe(el)
    return () => { cancelled = true; io.disconnect() }
  }, [user, onUnavailable])

  const layout = useMemo(() => (state.status === 'ready' ? toWeeks(state.data.days) : null), [state])

  // On narrow screens the grid scrolls sideways: start at the most recent weeks, like GitHub.
  useEffect(() => {
    const s = scrollRef.current
    if (s && layout) s.scrollLeft = s.scrollWidth
  }, [layout])

  const ready = state.status === 'ready'
  const weeksCount = layout?.weeks.length ?? 53
  return (
    <div ref={ref} className="gh-cal" data-state={state.status} aria-busy={!ready}>
      <div className="gh-cal__title-row">
        <h3 className="gh-cal__title" aria-live="polite">
          {ready ? `${plural(state.data.total)} in the last year` : <span className="gh-cal__title-skeleton">Loading contributions…</span>}
        </h3>
        <span className="gh-cal__legend" aria-hidden="true">
          Less {[0, 1, 2, 3, 4].map((l) => <i key={l} data-level={l} />)} More
        </span>
      </div>
      <div className="gh-cal__scroll" ref={scrollRef} tabIndex={0} role="region" aria-label="GitHub contribution calendar (scrolls sideways on small screens)">
        <div className="gh-cal__body" style={{ ['--weeks' as string]: weeksCount }}>
          <div className="gh-cal__months" aria-hidden="true">
            {layout?.months.map((m) => (
              <span key={`${m.week}-${m.label}`} style={{ gridColumn: `${m.week + 1} / span 3` }}>{m.label}</span>
            ))}
          </div>
          <div className="gh-cal__days" aria-hidden="true">
            {DAY_LABELS.map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div
            className="gh-cal__grid"
            role="img"
            aria-label={ready ? `GitHub contribution calendar for ${user}: ${plural(state.data.total)} in the last year.` : 'GitHub contribution calendar loading'}
          >
            {layout
              ? layout.weeks.map((w, wi) => w.days.map((d, di) => (
                  d
                    ? <span key={`${wi}-${di}`} data-level={d.level} title={`${plural(d.count)} on ${fmt.format(new Date(`${d.date}T00:00:00Z`))}`} />
                    : <span key={`${wi}-${di}`} data-empty />
                )))
              : Array.from({ length: 53 * 7 }, (_, i) => <span key={i} data-skeleton />)}
          </div>
        </div>
      </div>
    </div>
  )
}
