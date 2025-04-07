import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Create test users
    const leaderPassword = await hash("leader123", 10)
    const workerPassword = await hash("worker123", 10)

    // Create leader
    const leader = await db.user.upsert({
      where: { email: "admin@railis.com" },
      update: {},
      create: {
        name: "Admin",
        email: "admin@railis.com",
        password: leaderPassword,
        role: "leader",
      },
    })

    // Create worker
    const worker = await db.user.upsert({
      where: { email: "juan@railis.com" },
      update: {},
      create: {
        name: "Juan Pérez",
        email: "juan@railis.com",
        password: workerPassword,
        role: "worker",
      },
    })

    // Create sample tasks
    const task1 = await db.task.create({
      data: {
        title: "Diseñar logo para cliente",
        description:
          "Crear un logo moderno para la empresa XYZ. Debe incluir los colores corporativos y reflejar los valores de la empresa.",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "pending",
        leaderId: leader.id,
        workerId: worker.id,
      },
    })

    const task2 = await db.task.create({
      data: {
        title: "Desarrollar landing page",
        description: "Crear una landing page responsive para la campaña de marketing de primavera.",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "in_progress",
        leaderId: leader.id,
        workerId: worker.id,
      },
    })

    const task3 = await db.task.create({
      data: {
        title: "Redactar contenido para blog",
        description: "Escribir 3 artículos de blog sobre tendencias de diseño para el sitio web del cliente.",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: "completed",
        leaderId: leader.id,
        workerId: worker.id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Created 5 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Completed 2 days ago
      },
    })

    // Create sample notifications
    await db.notification.create({
      data: {
        userId: worker.id,
        message: "Se te ha asignado una nueva tarea: Diseñar logo para cliente",
        type: "task_assigned",
        relatedId: task1.id,
      },
    })

    await db.notification.create({
      data: {
        userId: leader.id,
        message: 'La tarea "Redactar contenido para blog" ha sido marcada como completada',
        type: "task_completed",
        relatedId: task3.id,
      },
    })

    // Create sample messages
    await db.message.create({
      data: {
        senderId: leader.id,
        receiverId: worker.id,
        content: "¡Hola Juan! ¿Cómo va el diseño del logo?",
        read: true,
      },
    })

    await db.message.create({
      data: {
        senderId: worker.id,
        receiverId: leader.id,
        content: "Estoy trabajando en ello. Te enviaré un borrador mañana.",
        read: false,
      },
    })

    // Create sample comments
    await db.taskComment.create({
      data: {
        taskId: task1.id,
        userId: leader.id,
        content: "Recuerda incluir la versión en blanco y negro también.",
      },
    })

    await db.taskComment.create({
      data: {
        taskId: task1.id,
        userId: worker.id,
        content: "Entendido, lo tendré en cuenta.",
      },
    })

    return NextResponse.json({
      message: "Database seeded successfully",
      users: { leader, worker },
      tasks: { task1, task2, task3 },
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Error seeding database" }, { status: 500 })
  }
}

