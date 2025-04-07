import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import WorkerPerformance from "@/components/worker-performance"
import TaskCompletionChart from "@/components/task-completion-chart"

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)

  // Only leaders can access reports
  if (!session || session.user.role !== "leader") {
    redirect("/dashboard")
  }

  // Get workers and their task statistics
  const workers = await db.user.findMany({
    where: {
      role: "worker",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  const workerStats = await Promise.all(
    workers.map(async (worker) => {
      const totalTasks = await db.task.count({
        where: {
          workerId: worker.id,
          leaderId: session.user.id,
        },
      })

      const completedTasks = await db.task.count({
        where: {
          workerId: worker.id,
          leaderId: session.user.id,
          status: "completed",
        },
      })

      const completedOnTime = await db.task.count({
        where: {
          workerId: worker.id,
          leaderId: session.user.id,
          status: "completed",
          updatedAt: {
            lte: new Date(),
          },
          deadline: {
            gte: new Date(),
          },
        },
      })

      // Calculate average completion time in days
      const tasks = await db.task.findMany({
        where: {
          workerId: worker.id,
          leaderId: session.user.id,
          status: "completed",
        },
        select: {
          createdAt: true,
          updatedAt: true,
        },
      })

      let avgCompletionTime = 0
      if (tasks.length > 0) {
        const totalDays = tasks.reduce((sum, task) => {
          const created = new Date(task.createdAt)
          const updated = new Date(task.updatedAt)
          const diffTime = Math.abs(updated.getTime() - created.getTime())
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          return sum + diffDays
        }, 0)
        avgCompletionTime = Math.round(totalDays / tasks.length)
      }

      return {
        ...worker,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        onTimeRate: completedTasks > 0 ? Math.round((completedOnTime / completedTasks) * 100) : 0,
        avgCompletionTime,
      }
    }),
  )

  // Get task completion data for the chart (last 6 months)
  const today = new Date()
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1)

  const months = []
  for (let i = 0; i < 6; i++) {
    const month = new Date(today.getFullYear(), today.getMonth() - i, 1)
    months.unshift(month)
  }

  const taskCompletionData = await Promise.all(
    months.map(async (month) => {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1)
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0)

      const completed = await db.task.count({
        where: {
          leaderId: session.user.id,
          status: "completed",
          updatedAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      const total = await db.task.count({
        where: {
          leaderId: session.user.id,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      })

      return {
        month: startOfMonth.toLocaleString("default", { month: "short" }),
        completed,
        total,
      }
    }),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
        <p className="text-muted-foreground">Análisis de rendimiento y estadísticas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento de Trabajadores</CardTitle>
            <CardDescription>Análisis de eficiencia y completación de tareas</CardDescription>
          </CardHeader>
          <CardContent>
            <WorkerPerformance workers={workerStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completación de Tareas</CardTitle>
            <CardDescription>Tareas completadas vs. creadas en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <TaskCompletionChart data={taskCompletionData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

