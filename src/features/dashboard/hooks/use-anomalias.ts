/**
 * Hook de anomalías. Independiente del selector de periodo.
 */

import { useQuery } from "@tanstack/react-query"

import { getAnomaliasService } from "../services/anomalias.service"

export function useAnomalias() {
    return useQuery({
        queryKey: ["dashboard", "anomalias"],
        queryFn: getAnomaliasService,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    })
}