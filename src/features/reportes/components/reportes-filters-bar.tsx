"use client"

import { CalendarRange, Download, Info, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  FORMATO_ITEMS,
  FORMATO_POR_DEFECTO,
  GRANULARIDAD_ITEMS,
  PRESET_RANGO_ITEMS,
  PRESET_RANGO_POR_DEFECTO,
} from "../constants"
import type {
  FormatoReporte,
  Granularidad,
  PresetRango,
} from "../types"

// Colores asignados a cada FormatoReporte ("xlsx" | "csv" | "pdf")
const FORMATO_ICON_COLORS: Record<FormatoReporte, string> = {
  xlsx: "text-emerald-600 dark:text-emerald-400",
  csv: "text-blue-600 dark:text-blue-400",
  pdf: "text-rose-600 dark:text-rose-400",
}

// Ancho y alto estandarizados para los 3 controles principales
const fixedControlWrapperClass = "w-full sm:w-40 h-9"

const controlClass =
  "h-9 min-h-9 text-xs bg-background border-input hover:bg-accent hover:text-accent-foreground focus-visible:ring-1 focus-visible:ring-ring text-foreground shadow-xs transition-colors rounded-lg"

interface ReportesFiltersBarProps {
  snapshot: boolean
  granularidadVisible: boolean
  preset: PresetRango
  onPresetChange: (value: PresetRango) => void
  desde: string
  onDesdeChange: (value: string) => void
  hasta: string
  onHastaChange: (value: string) => void
  rangoPersonalizado: boolean
  granularidad: Granularidad
  onGranularidadChange: (value: Granularidad) => void
  formato: FormatoReporte
  onFormatoChange: (value: FormatoReporte) => void
  onExportar: () => void
  isExporting: boolean
  tieneDatos: boolean
}

export function ReportesFiltersBar({
  snapshot,
  granularidadVisible,
  preset,
  onPresetChange,
  desde,
  onDesdeChange,
  hasta,
  onHastaChange,
  rangoPersonalizado,
  granularidad,
  onGranularidadChange,
  formato,
  onFormatoChange,
  onExportar,
  isExporting,
  tieneDatos,
}: ReportesFiltersBarProps) {
  const selectedFormatoItem = FORMATO_ITEMS.find((item) => item.value === formato)
  const FormatoIcon = selectedFormatoItem?.icon ?? Download
  const formatoIconColor = FORMATO_ICON_COLORS[formato] ?? "text-muted-foreground"

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border/80 bg-muted/30 p-2 sm:p-2.5">
      {/* Sección Izquierda: Filtros y Rangos */}
      <div className="flex flex-wrap items-center gap-2">
        {snapshot ? (
          <Badge
            variant="outline"
            className="h-9 gap-2 rounded-lg border-amber-500/30 bg-amber-500/10 px-3 text-xs font-medium text-amber-700 dark:text-amber-400"
          >
            <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            Snapshot actual del inventario (sin histórico)
          </Badge>
        ) : (
          <>
            {/* 1. Selector de Rango/Preset */}
            <div className={fixedControlWrapperClass}>
              <Select
                value={preset}
                onValueChange={(valor) =>
                  onPresetChange(
                    (valor ?? PRESET_RANGO_POR_DEFECTO) as PresetRango
                  )
                }
                items={PRESET_RANGO_ITEMS}
              >
                <SelectTrigger
                  aria-label="Elegir rango de fechas del reporte"
                  className={cn(controlClass, "h-full w-full justify-start gap-2 px-3")}
                >
                  <CalendarRange
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <SelectValue />
                </SelectTrigger>

                <SelectContent align="start">
                  {PRESET_RANGO_ITEMS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Granularidad */}
            {granularidadVisible && (
              <div className="h-9 w-full sm:w-28">
                <Select
                  value={granularidad}
                  onValueChange={(valor) =>
                    onGranularidadChange((valor ?? "dia") as Granularidad)
                  }
                  items={GRANULARIDAD_ITEMS}
                >
                  <SelectTrigger
                    aria-label="Agrupar ventas por periodo"
                    className={cn(controlClass, "h-full w-full justify-between gap-2 px-3")}
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent align="start">
                    {GRANULARIDAD_ITEMS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Inputs de Fechas Personalizadas */}
            {rangoPersonalizado && (
              <div className="flex h-9 w-full items-center gap-1.5 sm:w-auto">
                <Input
                  type="date"
                  value={desde}
                  onChange={(evento) => onDesdeChange(evento.target.value)}
                  aria-label="Reporte desde la fecha"
                  className={cn(controlClass, "h-full w-32")}
                />
                <span className="text-xs text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={hasta}
                  onChange={(evento) => onHastaChange(evento.target.value)}
                  aria-label="Reporte hasta la fecha"
                  className={cn(controlClass, "h-full w-32")}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sección Derecha: Formato y Botón de Exportar */}
      <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
        {/* 2. Selector de Formato */}
        <div className={fixedControlWrapperClass}>
          <Select
            value={formato}
            onValueChange={(valor) =>
              onFormatoChange(
                (valor ?? FORMATO_POR_DEFECTO) as FormatoReporte
              )
            }
            items={FORMATO_ITEMS}
          >
            <SelectTrigger
              aria-label="Elegir formato de descarga"
              className={cn(controlClass, "h-full w-full justify-start gap-2 px-3")}
            >
              <FormatoIcon
                className={cn("h-3.5 w-3.5 shrink-0 transition-colors", formatoIconColor)}
                aria-hidden="true"
              />
              <SelectValue />
            </SelectTrigger>

            <SelectContent align="end">
              {FORMATO_ITEMS.map((option) => {
                const ItemIcon = option.icon
                const itemColor = FORMATO_ICON_COLORS[option.value]

                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <ItemIcon className={cn("h-3.5 w-3.5 shrink-0", itemColor)} aria-hidden="true" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* 3. Botón de Descargar */}
        <div className={fixedControlWrapperClass}>
          <Button
            type="button"
            onClick={onExportar}
            disabled={isExporting || !tieneDatos}
            aria-busy={isExporting}
            className="h-full w-full justify-center gap-2 rounded-lg px-3 text-xs font-semibold shadow-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isExporting ? "Generando..." : "Descargar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
