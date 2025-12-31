import { createRoute } from '@tanstack/react-router'
import { Route as RootRoute } from './__root'
import { Dashboard } from '@/components/Dashboard'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: Dashboard,
})
