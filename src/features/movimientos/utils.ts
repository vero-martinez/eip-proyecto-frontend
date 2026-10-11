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
            return "bg-success/10 text-success border-success/50!"
        case "venta":
            return "bg-primary/10 text-primary border-primary/50!"
        case "importacion":
            return "bg-info/10 text-info border-info/50!"
        case "exportacion":
            return "bg-cat-6/10 text-cat-6 border-cat-6/50!"
        default:
            return "bg-destructive/10 text-destructive border-destructive/50!"
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