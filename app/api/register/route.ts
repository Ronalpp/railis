import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hash } from "bcrypt"
import { z } from "zod"

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input data
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ error: "Datos de registro inválidos", errors }, { status: 400 })
    }

    const { name, email, password } = result.data

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user (default role is worker)
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "worker", // Default role for new registrations
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Error registering user:", error)

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint failed")) {
        return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 400 })
      }

      if (error.message.includes("connect ECONNREFUSED")) {
        return NextResponse.json(
          { error: "Error de conexión a la base de datos. Por favor, intente más tarde." },
          { status: 503 },
        )
      }
    }

    return NextResponse.json({ error: "Error al registrar el usuario. Por favor, intente más tarde." }, { status: 500 })
  }
}

