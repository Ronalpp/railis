import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import MessageInterface from "@/components/message-interface"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: { userId?: string }
}) {
  const session = await getServerSession(authOptions)

  // Get all users except the current user
  const users = await db.user.findMany({
    where: {
      id: {
        not: session?.user.id,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
        <p className="text-muted-foreground">Comunícate con otros usuarios</p>
      </div>

      <MessageInterface users={users} selectedUserId={searchParams.userId} currentUserId={session?.user.id || ""} />
    </div>
  )
}

