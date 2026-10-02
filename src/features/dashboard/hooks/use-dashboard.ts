/**
 * Hook para el resumen gerencial del Dashboard.
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { getDashboardService } from "../services/dashboard.service"
import type { PeriodoDashboard } from "../types"

export function useDashboard(periodo: PeriodoDashboard) {
    return useQuery({
        queryKey: ["dashboard", periodo],
        queryFn: () => getDashboardService(periodo),
        // Mantiene la serie anterior visible mientras llega la del nuevo periodo,
        // para que la gráfica no salte a vacío en cada cambio.
        placeholderData: keepPreviousData,
    })
}