/**
 * Hook para listar las entradas de stock registradas.
 * Usa useQuery: TanStack Query maneja el loading, error y cache
 * automáticamente.
 */

import { useQuery } from "@tanstack/react-query"
import { getStockEntriesService } from "../services/entradas.service"

export function useStockEntries() {
    return useQuery({
        queryKey: ["stock-entries"],
        queryFn: getStockEntriesService,
    })
}