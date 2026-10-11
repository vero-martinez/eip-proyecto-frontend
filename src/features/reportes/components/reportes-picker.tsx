"use client"

import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { REPORTE_ITEMS } from "../constants"
import type { ReporteId } from "../types"

interface ReportesPickerProps {
  value: ReporteId
  onChange: (value: ReporteId) => void
}

export function ReportesPicker({ value, onChange }: ReportesPickerProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-base font-semibold tracking-tight">
          Reportes disponibles
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {REPORTE_ITEMS.map((item) => {
            const activo = item.value === value
            const Icon = item.icon

            return (
              <button
                key={item.value}
                type="button"
                aria-pressed={activo}
                onClick={() => onChange(item.value)}
                className={cn(
                  "relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  activo
                    ? "border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/20"
                    : "border-border bg-card hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm"
                )}
              >
                {/* Indicador de check para ítem activo */}
                {activo && (
                  <div className="absolute top-3.5 right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}

                <div>
                  {/* Icono envuelto en un contenedor sobrio */}
                  <div
                    className={cn(
                      "mb-3.5 flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                      activo
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>

                  {/* Título y Descripción */}
                  <p
                    className={cn(
                      "text-sm font-semibold tracking-tight transition-colors",
                      activo ? "text-foreground" : "text-foreground/90"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {item.descripcion}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
