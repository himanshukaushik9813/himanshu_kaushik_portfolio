import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      // `vite preview` only: serve each prerendered route's own HTML (production hosts do this via clean URLs).
      name: 'prerendered-routes',
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && /^\/projects\/?(\?.*)?$/.test(req.url)) req.url = req.url.replace(/^\/projects\/?/, '/projects/index.html')
          next()
        })
      },
    },
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap/SplitText') || id.includes('node_modules/gsap/dist/SplitText')) return undefined // lazy, own chunk
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
