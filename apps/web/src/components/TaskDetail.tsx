import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'
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
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, Trash2, Edit } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate: string
  createdAt: string
}

interface Comment {
  id: string
  text: string
  authorId: string
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

export function TaskDetail() {
  const navigate = useNavigate()
  const { taskId } = useParams({ from: '/tasks/$taskId' })
  const { } = useAuth()
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    fetchTask()
    fetchComments()
  }, [taskId])

  const fetchTask = async () => {
    try {
      const response = await api.get(`/api/tasks/${taskId}`)
      setTask(response.data)
    } catch (error: any) {
      toast.error('Erro ao carregar tarefa')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/tasks/${taskId}/comments`)
      setComments(response.data.data || [])
    } catch (error: any) {
      console.error('Erro ao carregar comentários:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      setIsSubmittingComment(true)
      await api.post(`/api/tasks/${taskId}/comments`, {
        text: newComment,
      })
      setNewComment('')
      toast.success('Comentário adicionado!')
      fetchComments()
    } catch (error: any) {
      toast.error('Erro ao adicionar comentário')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return

    try {
      await api.delete(`/api/tasks/${taskId}`)
      toast.success('Tarefa deletada com sucesso!')
      navigate({ to: '/' })
    } catch (error: any) {
      toast.error('Erro ao deletar tarefa')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Tarefa não encontrada</p>
          <Button onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{task.title}</CardTitle>
                <CardDescription className="flex gap-2">
                  <Badge className={statusColors[task.status]}>{task.status}</Badge>
                  <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" title="Editar">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={handleDeleteTask}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-gray-700">{task.description}</p>
            </div>
            {task.dueDate && (
              <div>
                <h3 className="font-semibold mb-2">Data de Vencimento</h3>
                <p className="text-gray-700">
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
            <div>
              <h3 className="font-semibold mb-2">Criado em</h3>
              <p className="text-gray-700">
                {new Date(task.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comentários ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Adicione um comentário..."
                value={newComment}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewComment(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
              <Button
                onClick={handleAddComment}
                disabled={isSubmittingComment || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">{comment.text}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(comment.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
