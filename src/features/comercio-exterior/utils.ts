/**
 * Funciones de ayuda para el módulo de Comercio Exterior (formato, textos y cálculos).
 */

import { toTitleCase } from "@/lib/utils"
import { round2 } from "@/features/inventario/utils"
import {
    INCOTERMS,
    MEDIOS_TRANSPORTE,
    TIPO_OPERACION_ITEMS,
    TIPO_OPERACION_TINT,
} from "./constants"
import type {
    ComercioExteriorResumen,
    OperacionComercioExterior,
    TipoOperacion,
} from "./types"

// --- FECHAS Y FORMATO ---

// Formatea una fecha local como "YYYY-MM-DD"
export function formatISODateLocal(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

// Retorna la fecha de hoy en formato "YYYY-MM-DD"
export function fechaHoy(): string {
    return formatISODateLocal(new Date())
}

// Convierte un número a formato de moneda en dólares ($)
export function formatUSD(amount: number): string {
    return new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency: "USD",
    }).format(amount)
}

// Retorna el texto legible de la cantidad de operaciones (ej: "1 operación" o "5 operaciones")
export function formatOperacionCount(count: number): string {
    return `${count} operación${count !== 1 ? "es" : ""}`
}

// --- LABELS Y ESTILOS ---

// Obtiene el nombre legible de un tipo de operación
export function getTipoOperacionLabel(tipo: TipoOperacion): string {
    return (
        TIPO_OPERACION_ITEMS.find((option) => option.value === tipo)?.label ??
        toTitleCase(tipo)
    )
}

// Obtiene el color o estilo asignado a un tipo de operación
export function getTipoOperacionTint(tipo: TipoOperacion): string {
    return TIPO_OPERACION_TINT[tipo]
}

// Obtiene el nombre legible de un Incoterm
export function getIncotermLabel(value?: string): string | undefined {
    if (!value) return undefined
    return INCOTERMS.find((option) => option.value === value)?.label ?? value
}

// Obtiene el nombre legible del medio de transporte
export function getMedioTransporteLabel(value?: string): string | undefined {
    if (!value) return undefined
    return (
        MEDIOS_TRANSPORTE.find((option) => option.value === value)?.label ??
        toTitleCase(value)
    )
}

// --- CÁLCULOS Y RESÚMENES ---

// Calcula el precio total de un ítem (cantidad × precio unitario)
export function calcularSubtotalLinea(linea: {
    cantidad: number
    precioUSD: number
}): number {
    return round2(linea.cantidad * linea.precioUSD)
}

// Calcula los totales en USD y en Soles (PEN) según el tipo de cambio
export function calcularTotales(
    lineas: { cantidad: number; precioUSD: number }[],
    tipoCambio: number
): { subtotalUSD: number; totalUSD: number; totalPEN: number } {
    const subtotalUSD = round2(
        lineas.reduce(
            (sum, linea) => sum + linea.cantidad * linea.precioUSD,
            0
        )
    )
    return {
        subtotalUSD,
        totalUSD: subtotalUSD,
        totalPEN: round2(subtotalUSD * tipoCambio),
    }
}

// Suma y calcula las estadísticas generales del historial de operaciones
export function resumirOperaciones(
    operaciones: OperacionComercioExterior[]
): ComercioExteriorResumen {
    let importaciones = 0
    let exportaciones = 0
    let invertidoUSD = 0
    let exportadoUSD = 0
    let totalUSD = 0

    for (const operacion of operaciones) {
        totalUSD += operacion.totalUSD
        if (operacion.tipo === "importacion") {
            importaciones += 1
            invertidoUSD += operacion.totalUSD
        } else {
            exportaciones += 1
            exportadoUSD += operacion.totalUSD
        }
    }

    return {
        total: operaciones.length,
        importaciones,
        exportaciones,
        totalUSD: round2(totalUSD),
        invertidoUSD: round2(invertidoUSD),
        exportadoUSD: round2(exportadoUSD),
    }
}