/**
 * Funciones de utilidad y formato para el módulo de Movimientos de Inventario.
 */

import { getUnitSymbol } from "@/lib/units"
import { formatVentaDateTime } from "@/features/ventas/utils"
import { formatCurrency, toTitleCase } from "@/lib/utils"
import { formatUSD } from "@/features/comercio-exterior/utils"

import { MOVIMIENTO_TIPO_ITEMS } from "./constants"
import type { InventoryMovement, MovementType } from "./types"

export interface MovimientosResumen {
    total: number
    entradas: number
    ventas: number
    mermas: number
    importaciones: number
    exportaciones: number
}

/** Retorna el label legible del tipo de movimiento. */
export function getMovementTypeLabel(type: MovementType): string {
    return (
        MOVIMIENTO_TIPO_ITEMS.find((option) => option.value === type)?.label ??
        toTitleCase(type)
    )
}

/** Formatea la cantidad con su signo y símbolo de unidad. */
export function formatMovementQuantity(movement: InventoryMovement): string {
    const esEntrada =
        movement.movementType === "entrada" ||
        movement.movementType === "importacion"
    const sign = esEntrada ? "+" : "−"
    return `${sign}${Math.abs(movement.quantity)} ${getUnitSymbol(movement.unitType)}`
}

/** Devuelve el origen o detalle principal del movimiento. */
export function getMovementDetail(
    movement: InventoryMovement
): string | undefined {
    if (movement.movementType === "venta") {
        const tipo = movement.tipoVenta ?? "Venta"
        return movement.folio ? `${tipo} · ${movement.folio}` : tipo
    }
    if (
        movement.movementType === "importacion" ||
        movement.movementType === "exportacion"
    ) {
        return (
            [movement.proveedor, movement.reason].filter(Boolean).join(" · ") ||
            undefined
        )
    }
    return movement.proveedor ?? "Taller"
}

/** Devuelve el motivo o notas adicionales del movimiento. */
export function getMovementMotivo(
    movement: InventoryMovement
): string | undefined {
    if (movement.movementType === "venta") return undefined
    if (
        movement.movementType === "importacion" ||
        movement.movementType === "exportacion"
    ) {
        return undefined
    }
    if (movement.movementType === "merma") {
        return movement.wasteType ?? movement.reason
    }
    return movement.reason
}

/** Retorna las clases de Tailwind para los estilos del badge por tipo. */
export function getMovementTint(type: MovementType): string {
    switch (type) {
        case "entrada":
            return "bg-emerald-500/10 text-emerald-700 border-emerald-500/50! dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-400/50!"
        case "venta":
            return "bg-violet-500/10 text-violet-700 border-violet-500/50! dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-400/50!"
        case "importacion":
            return "bg-sky-500/10 text-sky-700 border-sky-500/50! dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-400/50!"
        case "exportacion":
            return "bg-indigo-500/10 text-indigo-700 border-indigo-500/50! dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-400/50!"
        default:
            return "bg-destructive/10 text-destructive border-destructive/50! dark:bg-destructive/20 dark:text-destructive dark:border-destructive/60!"
    }
}

/** Formatea la cantidad total de registros para los textos de resumen. */
export function formatMovementCount(count: number): string {
    return `${count} movimiento${count !== 1 ? "s" : ""}`
}

/** Formatea un precio de venta en soles, con "—" si no aplica. */
export function formatPrecioSoles(value?: number): string {
    return value !== undefined && value > 0 ? formatCurrency(value) : "—"
}

/** Formatea un importe en dólares y soles cuando ambos están disponibles. */
export function formatPrecioDoble(usd?: number, pen?: number): string {
    const partes = [
        usd !== undefined ? formatUSD(usd) : undefined,
        pen !== undefined ? formatCurrency(pen) : undefined,
    ].filter((parte): parte is string => parte !== undefined)
    return partes.length > 0 ? partes.join(" · ") : "—"
}

/** Calcula el conteo de movimientos agrupados por tipo. */
export function summarizeMovimientos(
    movements: InventoryMovement[]
): MovimientosResumen {
    let entradas = 0
    let ventas = 0
    let mermas = 0
    let importaciones = 0
    let exportaciones = 0

    for (const movement of movements) {
        if (movement.movementType === "entrada") entradas += 1
        else if (movement.movementType === "venta") ventas += 1
        else if (movement.movementType === "merma") mermas += 1
        else if (movement.movementType === "importacion") importaciones += 1
        else exportaciones += 1
    }

    return {
        total: movements.length,
        entradas,
        ventas,
        mermas,
        importaciones,
        exportaciones,
    }
}

export { formatVentaDateTime }