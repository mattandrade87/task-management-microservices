import { createRoute } from '@tanstack/react-router'
import { Route as RootRoute } from './__root'
import { TaskDetail } from '@/components/TaskDetail'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/tasks/$taskId',
  component: TaskDetail,
})
