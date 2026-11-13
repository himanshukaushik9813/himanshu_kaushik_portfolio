import { SiteNav } from '@/components/nav/SiteNav'
import { SectionNavProvider } from '@/components/transitions/SectionNav'
import { IntroScene } from '@/sections/intro/IntroScene'
import { Hero } from '@/sections/hero/Hero'
import { About } from '@/sections/about/About'
import { Experience } from '@/sections/experience/Experience'
import { LetsBuild } from '@/sections/build/LetsBuild'
import { Works } from '@/sections/works/Works'
import { Highlights } from '@/sections/highlights/Highlights'
import { Skills } from '@/sections/skills/Skills'
import { Connect } from '@/sections/connect/Connect'
import { SiteFooter } from '@/sections/footer/SiteFooter'

/** Section order: IMPLEMENTATION_PLAN.md §3.1 + §11 (Experience after About). */
export default function HomePage() {
  return (
    <SectionNavProvider>
      <SiteNav />
      <main id="main" tabIndex={-1}>
        <IntroScene>
          <Hero />
        </IntroScene>
        <About />
        <Experience />
        <LetsBuild />
        <Works />
        <Highlights />
        <Skills />
        <Connect />
      </main>
      <SiteFooter />
    </SectionNavProvider>
  )
}
