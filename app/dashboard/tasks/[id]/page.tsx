import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import TaskActions from "@/components/task-actions"
import TaskEvidence from "@/components/task-evidence"
import TaskComments from "@/components/task-comments"

export default async function TaskDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  const taskId = params.id

  // Get task details
  const task = await db.task.findUnique({
    where: {
      id: taskId,
      OR: [{ leaderId: session?.user.id }, { workerId: session?.user.id }],
    },
    include: {
      leader: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      worker: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      evidence: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  })

  if (!task) {
    notFound()
  }

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

  const isOverdue = task.deadline < new Date() && task.status !== "completed"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
          <p className="text-muted-foreground">Detalles de la tarea</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(task.status)}
          {isOverdue && <Badge variant="destructive">Vencida</Badge>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Tarea</CardTitle>
            <CardDescription>Detalles y asignación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Descripción</h3>
              <p>{task.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Vencimiento</h3>
                <p>{format(new Date(task.deadline), "PPP", { locale: es })}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Fecha de Creación</h3>
                <p>{format(new Date(task.createdAt), "PPP", { locale: es })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Líder</h3>
                <p>{task.leader.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Trabajador</h3>
                <p>{task.worker.name}</p>
              </div>
            </div>

            <TaskActions task={task} userRole={session?.user.role || ""} userId={session?.user.id || ""} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <TaskEvidence
            evidence={task.evidence}
            taskId={task.id}
            taskStatus={task.status}
            userRole={session?.user.role || ""}
            userId={session?.user.id || ""}
            workerId={task.worker.id}
          />

          <TaskComments comments={task.comments} taskId={task.id} userId={session?.user.id || ""} />
        </div>
      </div>
    </div>
  )
}

