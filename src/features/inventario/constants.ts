/**
 * Constantes y estilos del módulo de Inventario.
 * Mantiene las etiquetas y clases de color asociadas a cada origen.
 */

import type { OrigenLote } from "./types"

export interface LoteInfoItem {
    value: OrigenLote
    label: string
    tint: string
}

export const ORIGEN_LOTE_ITEMS: LoteInfoItem[] = [
    {
        value: "apertura",
        label: "Apertura",
        tint: "bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-300",
    },
    {
        value: "entrada",
        label: "Entrada",
        tint: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-300",
    },
    {
        value: "compra",
        label: "Compra",
        tint: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-300",
    },
]