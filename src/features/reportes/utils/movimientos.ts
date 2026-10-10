/**
 * Helpers de movimientos para los reportes de Kardex y Más vendidos.
 */

import type { MovementType } from "@/features/movimientos/types"

/** Cantidad en unidades/piezas de un movimiento, siempre positiva. */
export function piezasMovimiento(quantity: number): number {
    return Math.abs(quantity)
}

/** Signo del movimiento en el ledger: +1 para entradas, -1 para salidas. */
export function signoMovimiento(type: MovementType): number {
    return type === "entrada" || type === "importacion" ? 1 : -1
}