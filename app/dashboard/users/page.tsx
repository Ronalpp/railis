import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import UserList from "@/components/user-list"
import NewUserDialog from "@/components/new-user-dialog"

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "leader") {
    redirect("/dashboard")
  }

  // Obtener la lista de usuarios
  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <NewUserDialog />
      </div>

      <UserList users={users} />
    </div>
  )
}

