import { createRouter, RouterProvider } from '@tanstack/react-router'
import { Route as RootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as TaskDetailRoute } from './routes/tasks.$taskId'

const routeTree = RootRoute.addChildren([IndexRoute, TaskDetailRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export { router, RouterProvider }
