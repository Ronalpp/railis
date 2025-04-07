"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Send, UserIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface UserType {
  id: string
  name: string
  email: string
  role: string
}

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
  sender: {
    id: string
    name: string
  }
  receiver: {
    id: string
    name: string
  }
}

interface MessageInterfaceProps {
  users: UserType[]
  selectedUserId?: string
  currentUserId: string
}

export default function MessageInterface({ users, selectedUserId, currentUserId }: MessageInterfaceProps) {
  const [activeUserId, setActiveUserId] = useState<string | undefined>(selectedUserId)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Update active user when it changes in the URL
  useEffect(() => {
    const userId = searchParams.get("userId")
    if (userId) {
      setActiveUserId(userId)
    }
  }, [searchParams])

  // Load messages when a user is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeUserId) return

      setIsLoading(true)

      try {
        const response = await fetch(`/api/messages?userId=${activeUserId}`)
        if (!response.ok) {
          throw new Error("Error loading messages")
        }

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()

    // Set up an interval to update messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000)

    return () => clearInterval(interval)
  }, [activeUserId, toast])

  // Scroll to the last message when messages are loaded or sent
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleUserSelect = (userId: string) => {
    setActiveUserId(userId)
    router.push(`/dashboard/messages?userId=${userId}`)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!activeUserId || !newMessage.trim()) return

    setIsSending(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: activeUserId,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error("Error sending message")
      }

      const sentMessage = await response.json()
      setMessages([...messages, sentMessage])
      setNewMessage("")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  // Find the active user
  const activeUser = users.find((user) => user.id === activeUserId)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-220px)]">
      <Card className="md:col-span-1 overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-medium">Contactos</h3>
        </div>
        <ScrollArea className="h-[calc(100%-57px)]">
          <div className="p-2">
            {users.map((user) => (
              <Button
                key={user.id}
                variant="ghost"
                className={`w-full justify-start mb-1 ${
                  user.id === activeUserId ? "bg-gray-100 dark:bg-gray-800" : ""
                }`}
                onClick={() => handleUserSelect(user.id)}
              >
                <div className="flex items-center gap-3 w-full overflow-hidden">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.role === "leader" ? "Líder" : "Trabajador"}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="md:col-span-3 flex flex-col overflow-hidden">
        {activeUser ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <UserIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium">{activeUser.name}</h3>
                  <p className="text-xs text-gray-500">{activeUser.role === "leader" ? "Líder" : "Trabajador"}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  No hay mensajes. Envía el primero.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUserId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.senderId === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
              <Input
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            Selecciona un usuario para comenzar a chatear
          </div>
        )}
      </Card>
    </div>
  )
}

