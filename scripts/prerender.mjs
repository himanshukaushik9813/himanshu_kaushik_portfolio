/**
 * Build step 3/3: writes real HTML for every route into dist/ (plan §9 "prerender").
 * - renders each route with the SSR bundle (dist-ssr/entry-server.js), injects it into #root
 * - per-route <title>, description, Open Graph / Twitter tags, JSON-LD (home)
 * - modulepreload for the /projects chunk on that page
 * - 404.html for unknown addresses
 * - robots.txt (+ sitemap.xml when VITE_SITE_URL is set)
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'

const SITE = (process.env.VITE_SITE_URL || '').replace(/\/$/, '')
const { render, seo } = await import('../dist-ssr/entry-server.js')
const template = readFileSync('dist/index.html', 'utf8')
const assets = readdirSync('dist/assets')
const projectsChunk = assets.find((f) => /^ProjectsPage-.*\.js$/.test(f))
const projectsCss = assets.find((f) => /^ProjectsPage-.*\.css$/.test(f))
const sacramento = assets.find((f) => /^sacramento-latin-400-normal-.*\.woff2$/.test(f))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

for (const page of seo) {
  const app = await render(page.path)
  const url = SITE ? `${SITE}${page.path === '/' ? '/' : page.path}` : null
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}" />`,
    url && `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="${page.path === '/' ? 'profile' : 'website'}" />`,
    `<meta property="og:site_name" content="Himanshu Kaushik" />`,
    `<meta property="og:title" content="${esc(page.title)}" />`,
    `<meta property="og:description" content="${esc(page.description)}" />`,
    url && `<meta property="og:url" content="${url}" />`,
    SITE && `<meta property="og:image" content="${SITE}/og-image.png" />`,
    SITE && `<meta property="og:image:width" content="1200" />`,
    SITE && `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Himanshu Kaushik, Full-Stack &amp; Web3 Developer, Bengaluru" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(page.title)}" />`,
    `<meta name="twitter:description" content="${esc(page.description)}" />`,
    SITE && `<meta name="twitter:image" content="${SITE}/og-image.png" />`,
    // home: the first screen's largest text is the script greeting, so its font is the one worth preloading
    page.path === '/' && sacramento && `<link rel="preload" href="/assets/${sacramento}" as="font" type="font/woff2" crossorigin />`,
    page.jsonLd && `<script type="application/ld+json">${JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')}</script>`,
    page.path === '/projects' && projectsChunk && `<link rel="modulepreload" crossorigin href="/assets/${projectsChunk}" />`,
    page.path === '/projects' && projectsCss && `<link rel="stylesheet" crossorigin href="/assets/${projectsCss}" />`,
  ].filter(Boolean).join('\n    ')
  const html = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta name="description"[^>]*>\s*/, '')
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${app}</div>`)
  const out = page.path === '/' ? 'dist/index.html' : join('dist', page.path, 'index.html')
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, html)
  console.log(`prerendered ${page.path} → ${out} (${(html.length / 1024).toFixed(1)} KB)`)
}

// Unknown addresses: the host serves this with a 404 status; the app then renders and its catch-all route
// sends the visitor to the home page. Not indexed.
writeFileSync('dist/404.html', template.replace(/<title>[^<]*<\/title>/, '<title>Page not found — Himanshu Kaushik</title>\n    <meta name="robots" content="noindex" />'))
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\n${SITE ? `\nSitemap: ${SITE}/sitemap.xml\n` : ''}`)
if (SITE) {
  const urls = seo.map((p) => `  <url><loc>${SITE}${p.path}</loc></url>`).join('\n')
  writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
}
rmSync('dist-ssr', { recursive: true, force: true })
console.log(SITE ? `robots.txt + sitemap.xml for ${SITE}` : 'robots.txt written (set VITE_SITE_URL for canonical/og:url/og:image/sitemap)')
