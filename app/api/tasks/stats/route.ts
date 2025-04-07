import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const userId = session.user.id
    const isLeader = session.user.role === "leader"

    // Get all tasks based on role
    const tasks = await db.task.findMany({
      where: {
        ...(isLeader ? { leaderId: userId } : { workerId: userId }),
      },
      include: {
        evidence: true,
      },
    })

    // Calculate statistics
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Completed tasks
    const completedTasks = tasks.filter((task) => task.status === "completed")

    // Pending tasks
    const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "in_progress")

    // Tasks this month
    const tasksThisMonth = tasks.filter((task) => new Date(task.createdAt) >= firstDayOfMonth)

    // Completion rate
    const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0

    // Average completion time (in days)
    let avgCompletionTime = 0
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const created = new Date(task.createdAt)
        const updated = new Date(task.updatedAt)
        const diffTime = Math.abs(updated.getTime() - created.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return sum + diffDays
      }, 0)
      avgCompletionTime = Math.round(totalDays / completedTasks.length)
    }

    // Tasks completed on time
    const completedOnTime =
      completedTasks.length > 0
        ? Math.round(
            (completedTasks.filter((task) => new Date(task.updatedAt) <= new Date(task.deadline)).length /
              completedTasks.length) *
              100,
          )
        : 0

    // Overall efficiency (combination of completion rate and on-time completion)
    const overallEfficiency = Math.round((completionRate + completedOnTime) / 2)

    const stats = {
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      tasksThisMonth: tasksThisMonth.length,
      completionRate,
      avgCompletionTime,
      completedOnTime,
      overallEfficiency,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error getting statistics:", error)
    return NextResponse.json({ error: "Error getting statistics" }, { status: 500 })
  }
}

