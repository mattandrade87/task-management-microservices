import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
import { useWebSocket } from '@/hooks/useWebSocket'
import { AuthDialog } from '@/components/AuthDialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, LogOut, User, Bell } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { CreateTaskDialog } from '@/components/CreateTaskDialog'

interface Task {
  id: string
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string
  createdAt: string
}

const statusColors = {
  TODO: 'bg-gray-200 text-gray-800',
  IN_PROGRESS: 'bg-blue-200 text-blue-800',
  REVIEW: 'bg-yellow-200 text-yellow-800',
  DONE: 'bg-green-200 text-green-800',
}

const priorityColors = {
  LOW: 'bg-slate-200 text-slate-800',
  MEDIUM: 'bg-orange-200 text-orange-800',
  HIGH: 'bg-red-200 text-red-800',
  URGENT: 'bg-purple-200 text-purple-800',
}

export function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // WebSocket connection for real-time notifications
  const token = localStorage.getItem('access_token')
  const { isConnected } = useWebSocket(token, {
    onNotification: (data) => {
      console.log('Notification received:', data)
      toast.info(data.message, {
        description: data.type,
        action: {
          label: 'Ver',
          onClick: () => {
            if (data.taskId) {
              navigate({ to: '/tasks/$taskId', params: { taskId: data.taskId } })
            }
          },
        },
      })
      // Refresh tasks list when a task-related notification arrives
      if (data.type?.includes('TASK')) {
        fetchTasks()
      }
    },
    onConnect: () => {
      console.log('Connected to notification server')
    },
    onDisconnect: () => {
      console.log('Disconnected from notification server')
    },
  })

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthDialogOpen(true)
      setIsLoading(false)
    } else {
      fetchTasks()
    }
  }, [isAuthenticated])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/api/tasks')
      setTasks(response.data.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar tarefas')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setAuthDialogOpen(true)
    setTasks([])
  }

  const handleTaskClick = (taskId: string) => {
    navigate({ to: '/tasks/$taskId', params: { taskId } })
  }

  const handleTaskCreated = () => {
    fetchTasks()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Task Management System</h1>
          <p className="text-gray-600 mb-4">Faça login para acessar suas tarefas</p>
          <Button onClick={() => setAuthDialogOpen(true)}>Fazer Login</Button>
        </div>
        <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
            {isConnected && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Bell className="mr-1 h-3 w-3" />
                Conectado
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setCreateTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  {user?.username}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Nenhuma tarefa encontrada</p>
            <Button onClick={() => setCreateTaskOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar sua primeira tarefa
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleTaskClick(task.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                  </div>
                  <CardDescription>
                    <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                  {task.dueDate && (
                    <p className="text-xs text-gray-500 mt-2">
                      Vencimento: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  )
}
