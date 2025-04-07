"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TaskStats() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user.id) {
        try {
          const response = await fetch("/api/tasks/stats")
          const data = await response.json()
          setStats(data)
        } catch (error) {
          console.error("Error fetching stats:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchStats()
  }, [session?.user.id])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Tareas</CardTitle>
          <CardDescription>Análisis de rendimiento y eficiencia</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Tareas</CardTitle>
          <CardDescription>Análisis de rendimiento y eficiencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">No hay datos disponibles</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de Tareas</CardTitle>
        <CardDescription>Análisis de rendimiento y eficiencia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Tiempo Promedio de Completación
            </h3>
            <p className="text-2xl font-bold">{stats.avgCompletionTime} días</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tasa de Completación</h3>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tareas Este Mes</h3>
            <p className="text-2xl font-bold">{stats.tasksThisMonth}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tareas Completadas a Tiempo</h3>
            <p className="text-2xl font-bold">{stats.completedOnTime}%</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tareas Pendientes</h3>
            <p className="text-2xl font-bold">{stats.pendingTasks}</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Eficiencia General</h3>
            <p className="text-2xl font-bold">{stats.overallEfficiency}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

