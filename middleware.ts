import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Log authentication errors
  if (request.nextUrl.pathname === "/api/auth/error" || request.nextUrl.pathname === "/auth-error") {
    const error = request.nextUrl.searchParams.get("error")
    console.error(`Authentication error: ${error}`)

    // You could also log to an external service here
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/auth/error", "/auth-error"],
}

