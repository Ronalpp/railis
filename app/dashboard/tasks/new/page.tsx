import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import NewTaskForm from "@/components/new-task-form"

export default async function NewTaskPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "leader") {
    redirect("/dashboard")
  }

  // Get the list of workers to assign the task
  const workers = await db.user.findMany({
    where: {
      role: "worker",
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Tarea</h1>
        <p className="text-muted-foreground">Crea y asigna una nueva tarea a un trabajador</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalles de la Tarea</CardTitle>
          <CardDescription>Completa la información para crear una nueva tarea</CardDescription>
        </CardHeader>
        <CardContent>
          <NewTaskForm workers={workers} />
        </CardContent>
      </Card>
    </div>
  )
}

