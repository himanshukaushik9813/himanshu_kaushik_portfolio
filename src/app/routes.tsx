import { redirect, type RouteObject } from 'react-router'
import App from './App'
import HomePage from '@/pages/HomePage'

/** Routes per plan §11 (D1): "/" and "/projects" only. No /lab. Shared by the browser router and the prerenderer. */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', lazy: async () => ({ Component: (await import('@/pages/ProjectsPage')).default }) },
      { path: '*', loader: () => redirect('/') },
    ],
  },
]
