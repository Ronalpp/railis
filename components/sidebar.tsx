"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, CheckSquare, Users, BarChart, Bell, MessageSquare, Settings, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isLeader = session?.user.role === "leader"

  const routes = [
    {
      href: "/dashboard",
      title: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/tasks",
      title: "Tareas",
      icon: CheckSquare,
      active: pathname === "/dashboard/tasks" || pathname.startsWith("/dashboard/tasks/"),
    },
    {
      href: "/dashboard/messages",
      title: "Mensajes",
      icon: MessageSquare,
      active: pathname === "/dashboard/messages",
    },
    {
      href: "/dashboard/notifications",
      title: "Notificaciones",
      icon: Bell,
      active: pathname === "/dashboard/notifications",
    },
    ...(isLeader
      ? [
          {
            href: "/dashboard/users",
            title: "Usuarios",
            icon: Users,
            active: pathname === "/dashboard/users",
          },
          {
            href: "/dashboard/reports",
            title: "Informes",
            icon: BarChart,
            active: pathname === "/dashboard/reports",
          },
        ]
      : []),
    {
      href: "/dashboard/settings",
      title: "Configuración",
      icon: Settings,
      active: pathname === "/dashboard/settings",
    },
  ]

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Railis</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {routes.map((route, index) => {
          const Icon = route.icon
          return (
            <Link
              key={index}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                route.active
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-50"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
              )}
            >
              <Icon className="h-5 w-5" />
              {route.title}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="outline" className="w-full justify-start" onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}

