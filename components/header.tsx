"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Bell, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function Header() {
  const { data: session } = useSession()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const pathname = usePathname()

  const isLeader = session?.user.role === "leader"

  const routes = [
    {
      href: "/dashboard",
      title: "Dashboard",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/tasks",
      title: "Tareas",
      active: pathname === "/dashboard/tasks",
    },
    {
      href: "/dashboard/messages",
      title: "Mensajes",
      active: pathname === "/dashboard/messages",
    },
    {
      href: "/dashboard/notifications",
      title: "Notificaciones",
      active: pathname === "/dashboard/notifications",
    },
    ...(isLeader
      ? [
          {
            href: "/dashboard/users",
            title: "Usuarios",
            active: pathname === "/dashboard/users",
          },
          {
            href: "/dashboard/reports",
            title: "Informes",
            active: pathname === "/dashboard/reports",
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      title: "Configuración",
      active: pathname === "/dashboard/settings",
    },
  ]

  useEffect(() => {
    // Function to fetch unread notification count
    const fetchNotificationCount = async () => {
      if (session?.user.id) {
        try {
          const response = await fetch("/api/notifications/count")
          const data = await response.json()
          setNotificationCount(data.count)
        } catch (error) {
          console.error("Error fetching notification count:", error)
        }
      }
    }

    fetchNotificationCount()

    // Set up an interval to update the count every minute
    const interval = setInterval(fetchNotificationCount, 60000)

    return () => clearInterval(interval)
  }, [session?.user.id])

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-white dark:bg-gray-800 px-4 sm:gap-8">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 md:hidden">
          <div className="fixed left-0 top-0 h-full w-3/4 max-w-xs bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Railis</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="grid gap-2">
              {routes.map((route, index) => (
                <Link
                  key={index}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all",
                    route.active
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                      : "text-gray-500 dark:text-gray-400",
                  )}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {route.title}
                </Link>
              ))}
              <Button
                variant="outline"
                className="w-full justify-start mt-4"
                onClick={() => {
                  setIsSidebarOpen(false)
                  signOut({ callbackUrl: "/" })
                }}
              >
                Cerrar Sesión
              </Button>
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1"></div>

      <Link href="/dashboard/notifications" className="relative">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {notificationCount}
            </Badge>
          )}
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{session?.user.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/dashboard/profile" className="w-full">
              Perfil
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/dashboard/settings" className="w-full">
              Configuración
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Cerrar Sesión</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

