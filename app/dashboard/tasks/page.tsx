import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"
import TaskList from "@/components/task-list"

export default async function TasksPage() {
  const session = await getServerSession(authOptions)

  // Get tasks based on user role
  let pendingTasks = []
  let inProgressTasks = []
  let completedTasks = []

  if (session?.user.role === "leader") {
    // Tasks for leaders (created tasks)
    pendingTasks = await db.task.findMany({
      where: {
        leaderId: session.user.id,
        status: "pending",
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    })

    inProgressTasks = await db.task.findMany({
      where: {
        leaderId: session.user.id,
        status: "in_progress",
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    })

    completedTasks = await db.task.findMany({
      where: {
        leaderId: session.user.id,
        status: "completed",
      },
      include: {
        worker: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
  } else {
    // Tasks for workers (assigned tasks)
    pendingTasks = await db.task.findMany({
      where: {
        workerId: session.user.id,
        status: "pending",
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    })

    inProgressTasks = await db.task.findMany({
      where: {
        workerId: session.user.id,
        status: "in_progress",
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    })

    completedTasks = await db.task.findMany({
      where: {
        workerId: session.user.id,
        status: "completed",
      },
      include: {
        leader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
          <p className="text-muted-foreground">Gestiona y realiza seguimiento de tus tareas</p>
        </div>
        {session?.user.role === "leader" && (
          <Link href="/dashboard/tasks/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="in-progress">En Progreso ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({completedTasks.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <TaskList tasks={pendingTasks} userRole={session?.user.role} />
        </TabsContent>
        <TabsContent value="in-progress" className="space-y-4">
          <TaskList tasks={inProgressTasks} userRole={session?.user.role} />
        </TabsContent>
        <TabsContent value="completed" className="space-y-4">
          <TaskList tasks={completedTasks} userRole={session?.user.role} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

