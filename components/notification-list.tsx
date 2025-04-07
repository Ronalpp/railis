"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Bell, CheckCircle, MessageSquare, FileText } from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  message: string
  read: boolean
  type: string
  relatedId: string | null
  createdAt: string
}

interface NotificationListProps {
  notifications: Notification[]
}

export default function NotificationList({ notifications }: NotificationListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const router = useRouter()

  const markAsRead = async (id: string, read: boolean) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          read,
        }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating notification:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "task_completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "message_received":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "evidence_uploaded":
        return <FileText className="h-5 w-5 text-orange-500" />
      case "comment_added":
        return <MessageSquare className="h-5 w-5 text-teal-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "task_assigned":
      case "task_completed":
      case "evidence_uploaded":
      case "comment_added":
        return notification.relatedId ? `/dashboard/tasks/${notification.relatedId}` : "/dashboard/tasks"
      case "message_received":
        return "/dashboard/messages"
      default:
        return "#"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    if (activeTab === "read") return notification.read
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tus Notificaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">Todas ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread">No leídas ({notifications.filter((n) => !n.read).length})</TabsTrigger>
            <TabsTrigger value="read">Leídas ({notifications.filter((n) => n.read).length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay notificaciones</div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${!notification.read ? "bg-gray-50 dark:bg-gray-800" : ""}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id, !notification.read)}>
                        {notification.read ? "Marcar como no leída" : "Marcar como leída"}
                      </Button>
                      <Link href={getNotificationLink(notification)}>
                        <Button size="sm">Ver</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

