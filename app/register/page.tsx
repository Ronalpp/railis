import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import RegisterForm from "@/components/register-form"
import Link from "next/link"

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Railis</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Crea una cuenta para comenzar</p>
        </div>

        <RegisterForm />

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

