"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface WorkerStats {
  id: string
  name: string
  email: string
  totalTasks: number
  completedTasks: number
  completionRate: number
  onTimeRate: number
  avgCompletionTime: number
}

interface WorkerPerformanceProps {
  workers: WorkerStats[]
}

export default function WorkerPerformance({ workers }: WorkerPerformanceProps) {
  // Sort workers by completion rate (highest first)
  const sortedWorkers = [...workers].sort((a, b) => b.completionRate - a.completionRate)

  if (workers.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay datos de trabajadores disponibles</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Trabajador</TableHead>
            <TableHead className="text-right">Tareas</TableHead>
            <TableHead className="text-right">Completadas</TableHead>
            <TableHead className="text-right">Tasa de Completación</TableHead>
            <TableHead className="text-right">A Tiempo</TableHead>
            <TableHead className="text-right">Tiempo Promedio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedWorkers.map((worker) => (
            <TableRow key={worker.id}>
              <TableCell className="font-medium">{worker.name}</TableCell>
              <TableCell className="text-right">{worker.totalTasks}</TableCell>
              <TableCell className="text-right">{worker.completedTasks}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Progress value={worker.completionRate} className="w-16 h-2" />
                  <span>{worker.completionRate}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Progress value={worker.onTimeRate} className="w-16 h-2" />
                  <span>{worker.onTimeRate}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">{worker.avgCompletionTime} días</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

