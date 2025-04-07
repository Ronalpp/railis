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

    // Para simplificar, usaremos las notificaciones como actividades recientes
    // En una implementación real, podría haber una tabla separada para actividades

    let activities

    if (isLeader) {
      // Para líderes, mostrar actividades relacionadas con tareas que ha creado
      const tasks = await db.task.findMany({
        where: {
          leaderId: userId,
        },
        select: {
          id: true,
        },
      })

      const taskIds = tasks.map((task) => task.id)

      activities = await db.notification.findMany({
        where: {
          OR: [{ userId }, { relatedId: { in: taskIds } }],
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      })
    } else {
      // Para trabajadores, mostrar sus propias actividades
      activities = await db.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      })
    }

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error al obtener actividades recientes:", error)
    return NextResponse.json({ error: "Error al obtener actividades recientes" }, { status: 500 })
  }
}

