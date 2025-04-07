"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface TaskCommentsProps {
  comments: any[]
  taskId: string
  userId: string
}

export default function TaskComments({ comments, taskId, userId }: TaskCommentsProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "El comentario no puede estar vacío.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error("Error sending comment")
      }

      toast({
        title: "Comentario enviado",
        description: "Tu comentario ha sido enviado correctamente.",
      })

      setContent("")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el comentario.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comentarios</CardTitle>
        <CardDescription>Discusión sobre la tarea</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay comentarios</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`flex ${comment.userId === userId ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    comment.userId === userId ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{comment.user.name}</span>
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={submitComment} className="flex gap-2">
          <Textarea
            placeholder="Escribe un comentario..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[80px]"
          />
          <Button type="submit" size="icon" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

