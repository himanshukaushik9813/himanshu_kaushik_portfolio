/**
 * GitHub contribution data (Phase 7, REFERENCE_ANALYSIS §6.10). Real data only: it comes live from the public
 * github-contributions-api (the same source react-github-calendar uses), cached per tab for the day.
 * Nothing is invented or estimated; on any failure the caller hides the block.
 */
export type Level = 0 | 1 | 2 | 3 | 4
export interface Contribution { date: string; count: number; level: Level }
export interface ContributionYear { total: number; days: Contribution[] }

export const contributionsUrl = (user: string) => `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=last`
const cacheKey = (user: string) => `gh-contrib:${user}:${new Date().toISOString().slice(0, 10)}`

export function parseContributions(json: unknown): ContributionYear {
  const j = json as { total?: Record<string, unknown>; contributions?: unknown }
  if (!j || typeof j !== 'object' || !Array.isArray(j.contributions)) throw new Error('bad payload')
  const days: Contribution[] = []
  for (const c of j.contributions as Record<string, unknown>[]) {
    if (typeof c?.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(c.date)) throw new Error('bad day')
    const count = Number(c.count)
    const level = Number(c.level)
    if (!Number.isFinite(count) || count < 0 || ![0, 1, 2, 3, 4].includes(level)) throw new Error('bad day')
    days.push({ date: c.date, count, level: level as Level })
  }
  days.sort((a, b) => a.date.localeCompare(b.date))
  const reported = Number(j.total?.lastYear)
  const total = Number.isFinite(reported) ? reported : days.reduce((s, d) => s + d.count, 0)
  return { total, days }
}

export async function fetchContributions(user: string, timeoutMs = 9000): Promise<ContributionYear> {
  try {
    const cached = sessionStorage.getItem(cacheKey(user))
    if (cached) return parseContributions(JSON.parse(cached))
  } catch { /* storage unavailable */ }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(contributionsUrl(user), { signal: ctrl.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json: unknown = await res.json()
    const data = parseContributions(json)
    try { sessionStorage.setItem(cacheKey(user), JSON.stringify(json)) } catch { /* quota */ }
    return data
  } finally {
    clearTimeout(timer)
  }
}

export interface Week { days: (Contribution | null)[] }
export interface MonthLabel { week: number; label: string }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dayOfWeek = (iso: string) => new Date(`${iso}T00:00:00Z`).getUTCDay() // 0 = Sunday

/** GitHub layout: one column per week (Sunday → Saturday), month label above the first week a month starts in. */
export function toWeeks(days: Contribution[]): { weeks: Week[]; months: MonthLabel[] } {
  const weeks: Week[] = []
  let current: (Contribution | null)[] = []
  if (days.length) for (let i = 0; i < dayOfWeek(days[0]!.date); i++) current.push(null)
  for (const d of days) {
    current.push(d)
    if (current.length === 7) { weeks.push({ days: current }); current = [] }
  }
  if (current.length) { while (current.length < 7) current.push(null); weeks.push({ days: current }) }
  const months: MonthLabel[] = []
  let last = -1
  weeks.forEach((w, i) => {
    const first = w.days.find((d) => d !== null)
    if (!first) return
    const m = Number(first.date.slice(5, 7)) - 1
    if (m !== last) {
      // skip a label that would collide with the previous one (needs ≥3 columns of room)
      if (!months.length || i - months[months.length - 1]!.week >= 3) months.push({ week: i, label: MONTHS[m]! })
      last = m
    }
  })
  return { weeks, months }
}
