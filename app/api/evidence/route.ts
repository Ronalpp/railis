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
    const formData = await request.formData()
    const taskId = formData.get("taskId") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File

    if (!taskId || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify that the user has access to this task
    const task = await db.task.findUnique({
      where: {
        id: taskId,
        workerId: session.user.id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or no access" }, { status: 404 })
    }

    // Upload the file to a storage service (example with Vercel Blob)
    // In a real environment, you would implement the logic to upload to S3, Cloudinary, etc.
    // For now, we'll simulate a URL
    const fileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`

    // Create the evidence
    const evidence = await db.evidence.create({
      data: {
        taskId,
        fileUrl,
        description,
      },
    })

    // Update the task status to "completed"
    await db.task.update({
      where: { id: taskId },
      data: { status: "completed" },
    })

    // Create notification for the leader
    await db.notification.create({
      data: {
        userId: task.leaderId,
        message: `Se ha subido un comprobante para la tarea "${task.title}"`,
        type: "evidence_uploaded",
        relatedId: taskId,
      },
    })

    return NextResponse.json(evidence)
  } catch (error) {
    console.error("Error uploading evidence:", error)
    return NextResponse.json({ error: "Error uploading evidence" }, { status: 500 })
  }
}

