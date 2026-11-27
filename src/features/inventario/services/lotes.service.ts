/**
 * Servicio de Lotes.
 *
 * Consulta los lotes de inventario. El control FIFO, el consumo de stock
 * y el recálculo del costo promedio son responsabilidades del backend:
 * este servicio solo lee.
 */

import api from "@/lib/axios"

import type { Lote } from "../types"

/** Lista los lotes de un producto en orden de consumo FIFO (más antiguos primero). */
export async function getLotesPorProductoService(
    productId: number
): Promise<Lote[]> {
    const { data } = await api.get<Lote[]>(`/lotes/producto/${productId}`)
    return data
}