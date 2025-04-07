import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error || "unknown"

  let errorMessage = "Ha ocurrido un error durante la autenticación."

  switch (error) {
    case "CredentialsSignin":
      errorMessage = "Las credenciales proporcionadas son incorrectas. Por favor, verifica tu email y contraseña."
      break
    case "SessionRequired":
      errorMessage = "Debes iniciar sesión para acceder a esta página."
      break
    case "AccessDenied":
      errorMessage = "No tienes permiso para acceder a esta página."
      break
    case "Verification":
      errorMessage = "El enlace de verificación ha expirado o es inválido."
      break
    case "OAuthAccountNotLinked":
      errorMessage = "Esta cuenta ya está vinculada a otro usuario."
      break
    default:
      errorMessage = "Ha ocurrido un error durante la autenticación. Por favor, intenta de nuevo."
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Error de Autenticación</CardTitle>
            <CardDescription className="text-center">
              Se ha producido un error durante el proceso de autenticación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{errorMessage}</p>
            <p className="text-sm text-gray-500 text-center">Código de error: {error}</p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/">Volver al Inicio</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

