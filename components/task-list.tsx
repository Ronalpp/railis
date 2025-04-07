"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Eye, Clock, User } from "lucide-react"
import Link from "next/link"

type Task = {
  id: string
  title: string
  description: string
  status: string
  deadline: string
  leader?: {
    id: string
    name: string
  }
  worker?: {
    id: string
    name: string
  }
}

interface TaskListProps {
  tasks: Task[]
  userRole: string
}

export default function TaskList({ tasks, userRole }: TaskListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendiente
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            En Progreso
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Completada
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            Rechazada
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date() && status !== "completed"
  }

  if (tasks.length === 0) {
    return <div className="text-center py-10 text-gray-500">No hay tareas en esta categoría</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <Card key={task.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                {getStatusBadge(task.status)}
                {isOverdue(task.deadline) && <Badge variant="destructive">Vencida</Badge>}
              </div>
              <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">{task.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>
                    Vence{" "}
                    {formatDistanceToNow(new Date(task.deadline), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                <div className="flex items-center text-gray-500">
                  <User className="h-4 w-4 mr-2" />
                  <span>
                    {userRole === "leader" ? `Asignada a: ${task.worker?.name}` : `Asignada por: ${task.leader?.name}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t p-4 bg-gray-50 dark:bg-gray-800">
              <Link href={`/dashboard/tasks/${task.id}`}>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

