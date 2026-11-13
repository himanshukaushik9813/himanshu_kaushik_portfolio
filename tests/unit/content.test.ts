import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { projects, publishedProjects, featuredProjects } from '@/content/projects'
import { buildWords } from '@/content/build'
import { contactRows } from '@/content/socials'
import { profile } from '@/content/profile'

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}
const sourceFiles = [...walk('src'), 'index.html'].filter((f) => /\.(tsx?|css|html|json)$/.test(f))

describe('content integrity (CONTENT.md is the source of truth)', () => {
  it('publishes exactly YieldMaze, ZeroPath, Aviation; TRACE stays hidden', () => {
    expect(publishedProjects.map((p) => p.id)).toEqual(['yieldmaze', 'zeropath', 'aviation'])
    expect(projects.find((p) => p.id === 'trace')?.published).toBe(false)
    expect(featuredProjects).toHaveLength(3)
  })

  it('every published project has a summary, stack, work bullets and a code link', () => {
    for (const p of publishedProjects) {
      expect(p.summary.length).toBeGreaterThan(20)
      expect(p.stack.length).toBeGreaterThan(0)
      expect(p.work.length).toBeGreaterThan(0)
      expect(p.links.some((l) => l.kind === 'code')).toBe(true)
      if (p.offline) expect(p.links.some((l) => l.kind === 'live')).toBe(false)
    }
  })

  it("let's-build finale word is ≤10 characters", () => {
    expect(buildWords.at(-1)!.length).toBeLessThanOrEqual(10)
  })

  it('contact list is GitHub, LinkedIn, Email (decision D9)', () => {
    expect(contactRows.map((r) => r.id)).toEqual(['github', 'linkedin', 'email'])
  })

  it('identity is Himanshu Kaushik', () => {
    expect(profile.name).toBe('Himanshu Kaushik')
    expect(profile.role).toBe('Full-Stack & Web3 Developer')
  })
})

describe('privacy & clean-room guards', () => {
  it('phone number never appears in any source file', () => {
    const phone = /(\+?91[\s-]?)?9813[\s-]?744[\s-]?048|98137\s?44048|tel:/
    for (const f of sourceFiles) expect(readFileSync(f, 'utf8'), f).not.toMatch(phone)
  })

  it("no reference-site identity or copy leaks into the source", () => {
    const banned = /angelo|almonte|aglcode|webcodedesign|No fluff|Just build and ship|Made to move|Built to prove|I had an idea/i
    for (const f of sourceFiles) expect(readFileSync(f, 'utf8'), f).not.toMatch(banned)
  })

  it('résumé PDF is not shipped while RESUME_PUBLIC is off', () => {
    if (process.env.VITE_RESUME_PUBLIC !== 'true') {
      expect(existsSync('public/resume/himanshu_resume.pdf')).toBe(false)
    }
  })

  it('font files are the unmodified Fontshare originals (ITF FFL forbids modification)', () => {
    const expected: Record<string, string> = {
      'Satoshi-Variable.woff2': 'e739aff9b4d02c264341d6d4872edcda28e79373aeda936f659566a1cd3eb47f',
      'ClashDisplay-Variable.woff2': 'dbe4b338d40d727ba0f342228d3c53d5429995264cf031fd975f6265a57da662',
      'Amulya-Variable.woff2': 'b38a2c67b7990e4721d8212d6a60948add4edb75bff64231f9d2d72ccf97a488',
    }
    for (const [file, hash] of Object.entries(expected)) {
      const p = join('public/fonts', file)
      if (!existsSync(p)) continue // fonts are git-ignored; CI without fonts skips
      expect(createHash('sha256').update(readFileSync(p)).digest('hex'), file).toBe(hash)
    }
  })
})

describe('skills mirror the résumé (decision 13 Nov)', () => {
  it('contains exactly the résumé items, nothing added', async () => {
    const { skills } = await import('@/content/skills')
    const resume = [
      'TypeScript', 'JavaScript', 'Python', 'Solidity', 'Rust', 'SQL', 'HTML/CSS',
      'EVM (Arbitrum, Sepolia)', 'Stellar Soroban', 'Aave V3', 'Radiant', 'Foundry', 'Hardhat', 'OpenZeppelin', 'Circom', 'snarkjs', 'Groth16',
      'XGBoost', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib', 'Surprise', 'OpenCV',
      'Next.js', 'React', 'Node.js', 'Express', 'FastAPI', 'Flask', 'REST APIs', 'Supabase (Postgres)', 'MongoDB', 'Tailwind CSS', 'Three.js', 'Vercel', 'Railway', 'Render', 'Git',
    ]
    const items = skills.flatMap((g) => g.subgroups.flatMap((s) => s.items))
    expect([...items].sort()).toEqual([...resume].sort())
    expect(skills.map((g) => g.title)).toEqual(['Languages', 'Backend & Cloud', 'Blockchain & ZK', 'AI & Data'])
  })
})
