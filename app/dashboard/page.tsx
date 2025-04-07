import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import TaskSummary from "@/components/task-summary"
import RecentActivity from "@/components/recent-activity"
import TaskStats from "@/components/task-stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  // Get user-specific data
  const userId = session?.user.id
  const isLeader = session?.user.role === "leader"

  // Get task counts
  let pendingCount = 0
  let inProgressCount = 0
  let completedCount = 0

  if (isLeader) {
    // For leaders, count tasks they've created
    pendingCount = await db.task.count({
      where: {
        leaderId: userId,
        status: "pending",
      },
    })

    inProgressCount = await db.task.count({
      where: {
        leaderId: userId,
        status: "in_progress",
      },
    })

    completedCount = await db.task.count({
      where: {
        leaderId: userId,
        status: "completed",
      },
    })
  } else {
    // For workers, count tasks assigned to them
    pendingCount = await db.task.count({
      where: {
        workerId: userId,
        status: "pending",
      },
    })

    inProgressCount = await db.task.count({
      where: {
        workerId: userId,
        status: "in_progress",
      },
    })

    completedCount = await db.task.count({
      where: {
        workerId: userId,
        status: "completed",
      },
    })
  }

  // Get recent activities
  const recentActivities = await db.task.findMany({
    where: {
      OR: [{ leaderId: userId }, { workerId: userId }],
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 5,
    include: {
      leader: {
        select: {
          name: true,
        },
      },
      worker: {
        select: {
          name: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {session?.user.name}. Aquí tienes un resumen de tus tareas y actividades.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TaskSummary title="Tareas Pendientes" count={pendingCount} status="pending" />
        <TaskSummary title="Tareas en Progreso" count={inProgressCount} status="in_progress" />
        <TaskSummary title="Tareas Completadas" count={completedCount} status="completed" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TaskStats />
        <RecentActivity activities={recentActivities} />
      </div>
    </div>
  )
}

