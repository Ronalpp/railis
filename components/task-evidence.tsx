"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, FileText, ExternalLink } from "lucide-react"

interface TaskEvidenceProps {
  evidence: any[]
  taskId: string
  taskStatus: string
  userRole: string
  userId: string
  workerId: string
}

export default function TaskEvidence({ evidence, taskId, taskStatus, userRole, userId, workerId }: TaskEvidenceProps) {
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const uploadEvidence = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un archivo.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("taskId", taskId)
      formData.append("file", file)
      formData.append("description", description)

      const response = await fetch("/api/evidence", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Error uploading evidence")
      }

      toast({
        title: "Comprobante subido",
        description: "El comprobante ha sido subido correctamente.",
      })

      setFile(null)
      setDescription("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir el comprobante.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Determine if the user can upload evidence
  const canUploadEvidence =
    userRole === "worker" && userId === workerId && (taskStatus === "pending" || taskStatus === "in_progress")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprobantes</CardTitle>
        <CardDescription>Evidencias de finalización de la tarea</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {evidence.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No hay comprobantes subidos</div>
        ) : (
          <div className="space-y-4">
            {evidence.map((item) => (
              <div key={item.id} className="border rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                    <FileText className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">Comprobante</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.description || "Sin descripción"}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {canUploadEvidence && (
          <form onSubmit={uploadEvidence} className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="file">Archivo</Label>
              <Input id="file" type="file" onChange={handleFileChange} disabled={isUploading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente el comprobante"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              />
            </div>
            <Button type="submit" disabled={isUploading || !file}>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Comprobante
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

