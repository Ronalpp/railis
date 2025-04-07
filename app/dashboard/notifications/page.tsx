import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import NotificationList from "@/components/notification-list"

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions)

  // Get user notifications
  const notifications = await db.notification.findMany({
    where: {
      userId: session?.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground">Mantente al día con las actualizaciones de tus tareas</p>
      </div>

      <NotificationList notifications={notifications} />
    </div>
  )
}

