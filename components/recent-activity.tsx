"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface Activity {
  id: string
  title: string
  status: string
  updatedAt: string
  leader: {
    name: string
  }
  worker: {
    name: string
  }
}

interface RecentActivityProps {
  activities: Activity[]
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "pendiente"
      case "in_progress":
        return "en progreso"
      case "completed":
        return "completada"
      case "rejected":
        return "rechazada"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-500"
      case "in_progress":
        return "text-blue-500"
      case "completed":
        return "text-green-500"
      case "rejected":
        return "text-red-500"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>Últimas actualizaciones de tareas</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No hay actividad reciente</div>
        ) : (
          <div className="space-y-8">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <span className="text-sm font-medium">{activity.title.charAt(0)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    La tarea <span className="font-semibold">{activity.title}</span> fue marcada como{" "}
                    <span className={getStatusColor(activity.status)}>{getStatusText(activity.status)}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Asignada a {activity.worker.name} por {activity.leader.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(activity.updatedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

