import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const userId = session.user.id
    const isLeader = session.user.role === "leader"

    let tasks

    if (isLeader) {
      // If leader, get tasks they've created
      tasks = await db.task.findMany({
        where: {
          leaderId: userId,
          ...(status ? { status } : {}),
        },
        include: {
          worker: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else {
      // If worker, get assigned tasks
      tasks = await db.task.findMany({
        where: {
          workerId: userId,
          ...(status ? { status } : {}),
        },
        include: {
          leader: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    }

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error getting tasks:", error)
    return NextResponse.json({ error: "Error getting tasks" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  if (session.user.role !== "leader") {
    return NextResponse.json({ error: "Only leaders can create tasks" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { title, description, deadline, workerId } = body

    if (!title || !description || !deadline || !workerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create the task
    const task = await db.task.create({
      data: {
        title,
        description,
        deadline: new Date(deadline),
        status: "pending",
        leaderId: session.user.id,
        workerId,
      },
    })

    // Create notification for the worker
    await db.notification.create({
      data: {
        userId: workerId,
        message: `Se te ha asignado una nueva tarea: ${title}`,
        type: "task_assigned",
        relatedId: task.id,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Error creating task" }, { status: 500 })
  }
}

