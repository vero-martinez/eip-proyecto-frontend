/**
 * Hook del pronóstico de demanda. Es independiente del selector de periodo:
 * el cálculo puede tardar unos segundos y no debe retrasar el resto del Dashboard.
 */

import { useQuery } from "@tanstack/react-query"

import { getPronosticoService } from "../services/pronostico.service"

export function usePronostico() {
    return useQuery({
        queryKey: ["dashboard", "pronostico"],
        queryFn: getPronosticoService,
        staleTime: 5 * 60 * 1000, // el backend ya guarda el resultado en caché
        retry: 1,
    })
}