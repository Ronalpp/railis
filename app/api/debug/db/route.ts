import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Test database connection
    const result = await db.$queryRaw`SELECT 1 as connected`

    // Count users
    const userCount = await db.user.count()

    return NextResponse.json({
      status: "success",
      database: {
        connected: true,
        userCount,
      },
    })
  } catch (error) {
    console.error("Database connection error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

