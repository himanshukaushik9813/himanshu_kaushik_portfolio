import { siGithub, siGmail, siNextdotjs, siTypescript, siSolidity, siSupabase, siTelegram, siRust, siStellar, siFastapi, siPython, siThreedotjs, siPandas, siScikitlearn, siX, siLeetcode } from 'simple-icons'

/** Tree-shaken brand marks (simple-icons, CC0). Missing marks render a neutral dot, never a fake logo. */
const icons: Record<string, { path: string; hex: string }> = {
  github: siGithub, gmail: siGmail, nextdotjs: siNextdotjs, typescript: siTypescript, solidity: siSolidity,
  supabase: siSupabase, telegram: siTelegram, rust: siRust, stellar: siStellar, fastapi: siFastapi,
  python: siPython, threedotjs: siThreedotjs, pandas: siPandas, scikitlearn: siScikitlearn, x: siX, leetcode: siLeetcode,
}

export function BrandIcon({ slug, size = 14, colored = false }: { slug?: string; size?: number; colored?: boolean }) {
  const icon = slug ? icons[slug] : undefined
  if (!icon) {
    return <span aria-hidden="true" style={{ width: size * 0.45, height: size * 0.45, borderRadius: '50%', background: 'currentColor', opacity: 0.45, display: 'inline-block' }} />
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={{ fill: colored ? `#${icon.hex}` : 'currentColor', flex: 'none' }}>
      <path d={icon.path} />
    </svg>
  )
}

/** LinkedIn is not in simple-icons; the reference also renders it as a set "in" glyph. */
export function LinkedInGlyph({ size = 14 }: { size?: number }) {
  return (
    <span aria-hidden="true" style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: size * 0.95, lineHeight: 1, letterSpacing: '-0.02em' }}>
      in
    </span>
  )
}
