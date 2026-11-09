/**
 * Hook de la reposición de stock. Independiente del selector de periodo.
 */

import { useQuery } from "@tanstack/react-query"

import { getReposicionService } from "../services/reposicion.service"

export function useReposicion() {
    return useQuery({
        queryKey: ["dashboard", "reposicion"],
        queryFn: getReposicionService,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })
}