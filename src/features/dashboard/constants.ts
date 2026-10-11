/**
 * Constantes del módulo Dashboard: opciones de periodo y catálogo de
 * estados de alerta con su presentación.
 */

import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"

import type { EstadoAlerta, PeriodoDashboard } from "./types"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

/** Periodos seleccionables en el dashboard. */
export const PERIODO_ITEMS: { value: PeriodoDashboard; label: string }[] = [
    { value: "dia", label: "Día" },
    { value: "semana", label: "Semana" },
    { value: "mes", label: "Mes" },
]

/**
 * Presentación de cada estado de alerta de stock.
 * El color viaja en `className` para poder matizar el variant por estado.
 */
export const ALERTA_ESTADO_ITEMS: {
    value: EstadoAlerta
    label: string
    variant: BadgeVariant
    className: string
}[] = [
    {
        value: "agotado",
        label: "Agotado",
        variant: "destructive",
        className: "",
    },
    {
        value: "bajo",
        label: "Stock bajo",
        variant: "default",
        className:
            "border-warning/40 bg-warning/15 text-warning hover:bg-warning/15",
    },
    {
        value: "inactivo",
        label: "Inactivo",
        variant: "secondary",
        className: "",
    },
]

/** Orden de aparición de los contadores de alertas. */
export const ALERTA_CONTADOR_ITEMS: {
    key: "agotados" | "stockBajo" | "inactivos"
    label: string
    estado: EstadoAlerta
}[] = [
    { key: "agotados", label: "Agotados", estado: "agotado" },
    { key: "stockBajo", label: "Stock bajo", estado: "bajo" },
    { key: "inactivos", label: "Inactivos", estado: "inactivo" },
]

/** Máximo de alertas detalladas que se listan en la tabla. */
export const MAX_ALERTAS_DETALLADAS = 8

/** Devuelve la presentación de un estado de alerta. */
export function getAlertaEstadoItem(estado: EstadoAlerta) {
    return ALERTA_ESTADO_ITEMS.find((item) => item.value === estado)
}