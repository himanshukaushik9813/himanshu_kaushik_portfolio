# Himanshu Kaushik — Portfolio

Personal portfolio of **Himanshu Kaushik**, Full-Stack & Web3 Developer based in Bengaluru, India.

## Stack
- **Vite + React 19 + TypeScript** (strict)
- **React Router 7**
- **Tailwind CSS v4**
- **GSAP** (ScrollTrigger) + **Lenis** smooth scrolling
- **Vitest** unit tests · **Playwright** end-to-end tests

## Highlights
- Pinned, scroll-scrubbed scenes: intro iris reveal, kinetic "Let's build" track with self-drawing SVG waves, and a snapping project gallery
- CSS-only hover system and opacity-only scroll reveals (keyboard-reachable at every stage)
- Full `prefers-reduced-motion` fallbacks (no pins, content shown directly)
- All personal content lives in typed files under `src/content/`

## Getting started
```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # typecheck + lint + unit tests + production build
npm run test:e2e   # Playwright (uses a local Chrome; set CHROME_PATH if needed)
```

### Fonts
The display fonts (Satoshi, Clash Display, Amulya — Indian Type Foundry) are **not included** in this repository: their licence (ITF Free Font License) does not allow redistribution through public repositories.
Download them free from [fontshare.com](https://www.fontshare.com) and place the variable `woff2` files in `public/fonts/`:

```
public/fonts/Satoshi-Variable.woff2
public/fonts/ClashDisplay-Variable.woff2
public/fonts/Amulya-Variable.woff2
```

Without them the site falls back to system fonts, and the font checksum unit test will fail.

## Deploy

The site is published to Vercel from this Mac by double-clicking `deploy-to-vercel.command` (one folder up). It builds with the font files present, uploads the static output, and rebuilds once if Vercel's address differs from the one the pages were built for, so canonical links, link previews and the sitemap always point at the live site. Deploys don't go through GitHub because the font licence keeps the fonts out of the public repo.

- `VITE_SITE_URL`: the live address, set by the deploy script.
- `VITE_RESUME_PUBLIC`: turned on automatically when `public/resume/himanshu_resume.pdf` exists. Keep the PDF free of the phone number.

## Project structure
```
src/
  app/          routes + layout shell
  components/   nav, project parts, keycap, UI primitives
  content/      all site copy and data (profile, projects, skills, …)
  motion/       GSAP/Lenis setup, reveal recipes, scroll helpers
  sections/     one folder per home-page section
  styles/       design tokens, base, hover system
tests/          unit (Vitest) + e2e (Playwright)
```

## Contact
- GitHub: [himanshukaushik9813](https://github.com/himanshukaushik9813)
- Email: himanshukaushik981374@gmail.com
