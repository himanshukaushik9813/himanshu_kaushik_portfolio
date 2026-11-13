import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router'
import { routes } from '@/app/routes'

/** Build-time renderer used by scripts/prerender.mjs (never shipped to the browser). */
export async function render(url: string): Promise<string> {
  const handler = createStaticHandler(routes)
  const context = await handler.query(new Request(new URL(url, 'http://prerender.local')))
  if (context instanceof Response) throw new Error(`route ${url} redirected`)
  const router = createStaticRouter(handler.dataRoutes, context)
  return renderToString(
    <StrictMode>
      <StaticRouterProvider router={router} context={context} hydrate={false} />
    </StrictMode>,
  )
}
export { seo } from '@/content/seo'
