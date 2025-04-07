"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, CheckCircle, XCircle, Play, Trash } from "lucide-react"

interface TaskActionsProps {
  task: any
  userRole: string
  userId: string
}

export default function TaskActions({ task, userRole, userId }: TaskActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newStatus, setNewStatus] = useState(task.status)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const updateTaskStatus = async () => {
    if (newStatus === task.status) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Error updating task status")
      }

      toast({
        title: "Estado actualizado",
        description: "El estado de la tarea ha sido actualizado correctamente.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteTask = async () => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error deleting task")
      }

      toast({
        title: "Tarea eliminada",
        description: "La tarea ha sido eliminada correctamente.",
      })

      router.push("/dashboard/tasks")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  // Determine what actions the user can perform based on their role
  const canChangeStatus =
    userRole === "leader" || (userRole === "worker" && userId === task.worker.id && task.status !== "completed")

  const canDelete = userRole === "leader" && userId === task.leader.id

  // Status options based on role
  const statusOptions =
    userRole === "leader"
      ? [
          { value: "pending", label: "Pendiente" },
          { value: "in_progress", label: "En Progreso" },
          { value: "completed", label: "Completada" },
          { value: "rejected", label: "Rechazada" },
        ]
      : [
          { value: "pending", label: "Pendiente" },
          { value: "in_progress", label: "En Progreso" },
          { value: "completed", label: "Completada" },
        ]

  return (
    <div className="space-y-4 pt-4 border-t">
      <h3 className="text-sm font-medium">Acciones</h3>

      <div className="flex flex-col gap-4">
        {canChangeStatus && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="status">Cambiar Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={updateTaskStatus} disabled={isUpdating || newStatus === task.status} className="w-full">
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    {newStatus === "completed" ? (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    ) : newStatus === "rejected" ? (
                      <XCircle className="mr-2 h-4 w-4" />
                    ) : newStatus === "in_progress" ? (
                      <Play className="mr-2 h-4 w-4" />
                    ) : null}
                    Actualizar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {canDelete && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Eliminar Tarea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar esta tarea?</DialogTitle>
                <DialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente la tarea y todos sus datos asociados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={deleteTask} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

