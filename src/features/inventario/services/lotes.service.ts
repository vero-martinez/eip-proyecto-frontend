/**
 * Servicio de Lotes.
 *
 * Consulta los lotes de inventario. El control FIFO, el consumo de stock
 * y el recálculo del costo promedio son responsabilidades del backend:
 * este servicio solo lee.
 */

import api from "@/lib/axios"

import type { Lote, LotesFilters } from "../types"

/** Lista los lotes, con filtros opcionales, del más reciente al más antiguo. */
export async function getLotesService(
    filtros?: LotesFilters
): Promise<Lote[]> {
    const { data } = await api.get<Lote[]>("/lotes", {
        params: {
            product_id: filtros?.productId,
            origen: filtros?.origen,
        },
    })
    return data
}

/** Lista los lotes de un producto en orden de consumo FIFO (más antiguos primero). */
export async function getLotesPorProductoService(
    productId: number
): Promise<Lote[]> {
    const { data } = await api.get<Lote[]>(`/lotes/producto/${productId}`)
    return data
}