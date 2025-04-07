import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import LoginForm from "@/components/login-form"

export default async function Home({
  searchParams,
}: {
  searchParams: { registered?: string; error?: string }
}) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  const registrationSuccess = searchParams.registered === "true"
  const authError = searchParams.error

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Railis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Plataforma de gestión de tareas y colaboración</p>
        </div>

        {registrationSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
            Registro exitoso. Por favor, inicia sesión con tus credenciales.
          </div>
        )}

        {authError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            Error de autenticación. Por favor, verifica tus credenciales.
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  )
}

