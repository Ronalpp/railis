import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { taskId, content } = body

    if (!taskId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify that the user has access to this task
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        OR: [{ leaderId: session.user.id }, { workerId: session.user.id }],
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or no access" }, { status: 404 })
    }

    // Create the comment
    const comment = await db.taskComment.create({
      data: {
        taskId,
        userId: session.user.id,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Determine who to notify (the other user involved in the task)
    const notifyUserId = session.user.id === task.leaderId ? task.workerId : task.leaderId

    // Create notification
    await db.notification.create({
      data: {
        userId: notifyUserId,
        message: `Nuevo comentario en la tarea "${task.title}"`,
        type: "comment_added",
        relatedId: taskId,
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Error creating comment" }, { status: 500 })
  }
}

