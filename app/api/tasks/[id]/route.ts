import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const taskId = params.id
    const userId = session.user.id
    const isLeader = session.user.role === "leader"

    // Verify that the user has access to this task
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        OR: [{ leaderId: userId }, { workerId: userId }],
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
      return NextResponse.json({ error: "Task not found or no access" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error getting task:", error)
    return NextResponse.json({ error: "Error getting task" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const taskId = params.id
    const userId = session.user.id
    const isLeader = session.user.role === "leader"
    const body = await request.json()

    // Verify that the user has access to this task
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        OR: [{ leaderId: userId }, { workerId: userId }],
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or no access" }, { status: 404 })
    }

    // Validate permissions based on role
    if (isLeader) {
      // Leaders can update any field
      const { title, description, deadline, status, workerId } = body

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(deadline && { deadline: new Date(deadline) }),
          ...(status && { status }),
          ...(workerId && { workerId }),
        },
      })

      // If status changed to "completed", notify the worker
      if (status === "completed" && task.status !== "completed") {
        await db.notification.create({
          data: {
            userId: task.workerId,
            message: `Tu tarea "${task.title}" ha sido marcada como completada`,
            type: "task_completed",
            relatedId: taskId,
          },
        })
      }

      return NextResponse.json(updatedTask)
    } else {
      // Workers can only update the status
      const { status } = body

      if (!status) {
        return NextResponse.json({ error: "Status not provided" }, { status: 400 })
      }

      // Workers can only change to "in_progress" or "completed"
      if (status !== "in_progress" && status !== "completed") {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }

      const updatedTask = await db.task.update({
        where: { id: taskId },
        data: { status },
      })

      // If status changed to "completed", notify the leader
      if (status === "completed" && task.status !== "completed") {
        await db.notification.create({
          data: {
            userId: task.leaderId,
            message: `La tarea "${task.title}" ha sido marcada como completada`,
            type: "task_completed",
            relatedId: taskId,
          },
        })
      }

      return NextResponse.json(updatedTask)
    }
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Error updating task" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (session.user.role !== "leader") {
    return NextResponse.json({ error: "Only leaders can delete tasks" }, { status: 403 })
  }

  try {
    const taskId = params.id
    const userId = session.user.id

    // Verify that the leader is the creator of the task
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        leaderId: userId,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or no access" }, { status: 404 })
    }

    // Delete the task and all its relations (cascade)
    await db.task.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Error deleting task" }, { status: 500 })
  }
}

