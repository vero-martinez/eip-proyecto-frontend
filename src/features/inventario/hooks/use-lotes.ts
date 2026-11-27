/**
 * Hooks de Lotes.
 * Consultas de solo lectura para obtener lotes de inventario mediante React Query.
 */

import { useQuery } from "@tanstack/react-query"

import { getLotesPorProductoService } from "../services/lotes.service"

/** Obtiene los lotes de un producto específico ordenados para consumo FIFO. */
export function useLotesPorProducto(productId: number | null | undefined) {
    return useQuery({
        queryKey: ["lotes", "producto", productId],
        queryFn: () => getLotesPorProductoService(productId!),
        enabled: productId !== null && productId !== undefined && productId > 0,
    })
}