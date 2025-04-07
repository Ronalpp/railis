import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Check if NextAuth is properly configured
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      status: "success",
      nextAuthConfigured: true,
      session: session
        ? {
            exists: true,
            user: session.user
              ? {
                  name: session.user.name,
                  email: session.user.email,
                  role: session.user.role,
                }
              : null,
          }
        : {
            exists: false,
          },
      environment: {
        nextAuthSecret: process.env.NEXTAUTH_SECRET ? "Set" : "Not set",
        nextAuthUrl: process.env.NEXTAUTH_URL || "Not set",
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    console.error("NextAuth configuration error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: "NextAuth configuration error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

