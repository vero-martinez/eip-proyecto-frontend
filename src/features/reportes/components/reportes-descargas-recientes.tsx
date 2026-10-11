"use client"

import { Download, FileSpreadsheet, FileText, Sheet } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import type { FormatoReporte } from "../types"
import type { DescargaRegistrada } from "../hooks/use-descargas-recientes"

const CONFIG_FORMATO = {
  xlsx: {
    icon: FileSpreadsheet,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    iconClass: "text-emerald-600 dark:text-emerald-400",
  },
  csv: {
    icon: Sheet,
    badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    iconClass: "text-teal-600 dark:text-teal-400",
  },
  pdf: {
    icon: FileText,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    iconClass: "text-rose-600 dark:text-rose-400",
  },
} as const

/** "hoy · 14:05", "ayer · 18:32" o "08 sep · 16:00" */
function formatearMomento(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return ""

  const ahora = new Date()
  const inicioHoy = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  ).getTime()

  const hora = fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  if (fecha.getTime() >= inicioHoy) return `hoy · ${hora}`

  const inicioAyer = inicioHoy - 86_400_000
  if (fecha.getTime() >= inicioAyer) return `ayer · ${hora}`

  return `${fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  })} · ${hora}`
}

function extension(nombre: string): FormatoReporte {
  const limpio = nombre.split(".").pop()?.toLowerCase()
  return limpio === "csv" || limpio === "pdf" ? limpio : "xlsx"
}

/** "ventas-por-canal_2026-01-01_2026-01-31.xlsx" → "Ventas por canal" */
function tituloDesdeNombre(nombre: string): string {
  return nombre
    .replace(/\.(xlsx|csv|pdf)$/i, "")
    .replace(/_\d{4}-\d{2}-\d{2}(_\d{4}-\d{2}-\d{2})?$/, "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letra) => letra.toUpperCase())
}

interface ReportesDescargasRecientesProps {
  descargas: DescargaRegistrada[]
}

export function ReportesDescargasRecientes({
  descargas,
}: ReportesDescargasRecientesProps) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3 pt-5 px-6">
        <CardTitle className="text-base font-semibold tracking-tight">
          Descargas recientes
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-1">
        {descargas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
              <Download className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {"Todav\u00EDa no descargaste ning\u00FAn reporte"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
              {"Tus archivos generados aparecer\u00E1n aqu\u00ED"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {descargas.map((descarga, indice) => {
              const formato = extension(descarga.nombre)
              const config = CONFIG_FORMATO[formato]
              const Icono = config.icon

              return (
                <li
                  key={`${descarga.fecha}-${indice}`}
                  className="group flex items-center gap-3 rounded-lg py-2.5 px-2 transition-colors hover:bg-muted/50"
                >
                  {/* Icono del formato en contenedor */}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 transition-colors group-hover:bg-background"
                    )}
                  >
                    <Icono
                      className={cn("h-4 w-4", config.iconClass)}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Detalle del archivo */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {tituloDesdeNombre(descarga.nombre)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatearMomento(descarga.fecha)}
                    </p>
                  </div>

                  {/* Badge con formato */}
                  <span
                    className={cn(
                      "shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider",
                      config.badgeClass
                    )}
                  >
                    {formato}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
