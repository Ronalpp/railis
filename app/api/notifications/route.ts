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
    const read = searchParams.get("read")

    const notifications = await db.notification.findMany({
      where: {
        userId: session.user.id,
        ...(read !== null ? { read: read === "true" } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error getting notifications:", error)
    return NextResponse.json({ error: "Error getting notifications" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, read } = body

    if (!id || read === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify that the notification belongs to the user
    const notification = await db.notification.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found or no access" }, { status: 404 })
    }

    // Update the notification
    const updatedNotification = await db.notification.update({
      where: { id },
      data: { read },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Error updating notification" }, { status: 500 })
  }
}

