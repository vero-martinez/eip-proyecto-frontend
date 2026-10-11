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
        tint: "bg-info/10 text-info ring-info/25",
    },
    {
        value: "entrada",
        label: "Entrada",
        tint: "bg-success/10 text-success ring-success/25",
    },
    {
        value: "compra",
        label: "Compra",
        tint: "bg-warning/10 text-warning ring-warning/25",
    },
    {
        value: "importacion",
        label: "Importación",
        tint: "bg-cat-6/10 text-cat-6 ring-cat-6/25",
    },
]