/**
 * Constantes del módulo de Movimientos de inventario.
 */

import type { MovementType } from "./types"

export const MOVIMIENTO_TIPO_ITEMS: {
    value: MovementType
    label: string
}[] = [
    { value: "entrada", label: "Entrada" },
    { value: "venta", label: "Venta" },
    { value: "merma", label: "Merma" },
]

export type SortOption = "recent" | "oldest"

export const SORT_ITEMS: { value: SortOption; label: string }[] = [
    { value: "recent", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
]