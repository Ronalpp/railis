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

    let tasks

    if (isLeader) {
      // Si es líder, obtener tareas recientes que ha creado
      tasks = await db.task.findMany({
        where: {
          leaderId: userId,
        },
        include: {
          worker: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })
    } else {
      // Si es trabajador, obtener tareas recientes asignadas
      tasks = await db.task.findMany({
        where: {
          workerId: userId,
        },
        include: {
          leader: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      })
    }

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error al obtener tareas recientes:", error)
    return NextResponse.json({ error: "Error al obtener tareas recientes" }, { status: 500 })
  }
}

