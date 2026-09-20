/**
 * Funciones de utilidad y formato para el módulo de Movimientos de Inventario.
 */

import { UNIT_OPTIONS } from "@/features/products/utils"
import { formatVentaDateTime } from "@/features/ventas/utils"
import { toTitleCase } from "@/lib/utils"

import { MOVIMIENTO_TIPO_ITEMS } from "./constants"
import type { InventoryMovement, MovementType } from "./types"

export interface MovimientosResumen {
    total: number
    entradas: number
    ventas: number
    mermas: number
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
    const symbol =
        UNIT_OPTIONS.find((option) => option.value === movement.unitType)
            ?.symbol ?? movement.unitType
    const sign = movement.movementType === "entrada" ? "+" : "−"
    return `${sign}${Math.abs(movement.quantity)} ${symbol}`
}

/** Devuelve el origen o detalle principal del movimiento. */
export function getMovementDetail(
    movement: InventoryMovement
): string | undefined {
    if (movement.movementType === "venta") {
        const tipo = movement.tipoVenta ?? "Venta"
        return movement.folio ? `${tipo} · ${movement.folio}` : tipo
    }
    return movement.proveedor ?? "Taller"
}

/** Devuelve el motivo o notas adicionales del movimiento. */
export function getMovementMotivo(
    movement: InventoryMovement
): string | undefined {
    if (movement.movementType === "venta") return undefined
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
        default:
            return "bg-destructive/10 text-destructive border-destructive/50! dark:bg-destructive/20 dark:text-destructive dark:border-destructive/60!"
    }
}

/** Formatea la cantidad total de registros para los textos de resumen. */
export function formatMovementCount(count: number): string {
    return `${count} movimiento${count !== 1 ? "s" : ""}`
}

/** Calcula el conteo de movimientos agrupados por tipo. */
export function summarizeMovimientos(
    movements: InventoryMovement[]
): MovimientosResumen {
    let entradas = 0
    let ventas = 0
    let mermas = 0

    for (const movement of movements) {
        if (movement.movementType === "entrada") entradas += 1
        else if (movement.movementType === "venta") ventas += 1
        else mermas += 1
    }

    return {
        total: movements.length,
        entradas,
        ventas,
        mermas,
    }
}

export { formatVentaDateTime }