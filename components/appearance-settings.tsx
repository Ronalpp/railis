"use client"

import { useTheme } from "next-themes"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tema</Label>
        <RadioGroup defaultValue={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
          <div>
            <RadioGroupItem value="light" id="light" className="sr-only peer" />
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Sun className="mb-3 h-6 w-6" />
              Claro
            </Label>
          </div>

          <div>
            <RadioGroupItem value="dark" id="dark" className="sr-only peer" />
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Moon className="mb-3 h-6 w-6" />
              Oscuro
            </Label>
          </div>

          <div>
            <RadioGroupItem value="system" id="system" className="sr-only peer" />
            <Label
              htmlFor="system"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <Monitor className="mb-3 h-6 w-6" />
              Sistema
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Vista Previa</Label>
        <div className="rounded-md border p-6 bg-background">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Título de Ejemplo</h3>
              <p className="text-sm text-muted-foreground">
                Este es un texto de ejemplo para mostrar cómo se ve el tema seleccionado.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="default">Botón Primario</Button>
              <Button variant="outline">Botón Secundario</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

