import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { contributionsUrl, parseContributions, toWeeks } from '@/lib/contributions'

const snapshot = JSON.parse(readFileSync('tests/fixtures/github-himanshukaushik9813-2026-11-13.json', 'utf8'))

describe('GitHub contributions (Phase 7)', () => {
  it('uses the live public API for the real account', () => {
    expect(contributionsUrl('himanshukaushik9813')).toBe('https://github-contributions-api.jogruber.de/v4/himanshukaushik9813?y=last')
  })
  it('parses the real snapshot: total matches the per-day sum', () => {
    const d = parseContributions(snapshot)
    expect(d.total).toBe(243)
    expect(d.days.reduce((s, x) => s + x.count, 0)).toBe(243)
    expect(d.days).toHaveLength(370)
  })
  it('rejects malformed payloads instead of showing something wrong', () => {
    expect(() => parseContributions({})).toThrow()
    expect(() => parseContributions({ contributions: [{ date: 'x', count: 1, level: 1 }] })).toThrow()
    expect(() => parseContributions({ contributions: [{ date: '2026-01-01', count: -1, level: 1 }] })).toThrow()
    expect(() => parseContributions({ contributions: [{ date: '2026-01-01', count: 1, level: 7 }] })).toThrow()
  })
  it('lays out weeks Sunday→Saturday with month labels, like GitHub', () => {
    const { weeks, months } = toWeeks(parseContributions(snapshot).days)
    expect(weeks.every((w) => w.days.length === 7)).toBe(true)
    // 2025-11-09 is a Sunday → no leading padding; 370 days → 53 columns
    expect(weeks[0]!.days[0]!.date).toBe('2025-11-09')
    expect(weeks).toHaveLength(53)
    expect(months[0]).toEqual({ week: 0, label: 'Nov' })
    expect(months.map((m) => m.label)).toContain('Jul')
    for (let i = 1; i < months.length; i++) expect(months[i]!.week - months[i - 1]!.week).toBeGreaterThanOrEqual(3)
  })
  it('pads a mid-week start with empty cells', () => {
    const { weeks } = toWeeks([{ date: '2026-11-11', count: 1, level: 1 }]) // Wednesday
    expect(weeks[0]!.days.slice(0, 3)).toEqual([null, null, null])
    expect(weeks[0]!.days[3]!.date).toBe('2026-11-11')
  })
})
