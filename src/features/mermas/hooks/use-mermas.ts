/**
 * Hook para listar las mermas registradas.
 * Usa useQuery: TanStack Query maneja el loading, error y cache
 * automáticamente.
 */

import { useQuery } from "@tanstack/react-query"
import { getMermasService } from "../services/mermas.service"

export function useMermas() {
    return useQuery({
        queryKey: ["mermas"],
        queryFn: getMermasService,
    })
}