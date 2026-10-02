/**
 * Servicio del Dashboard.
 *
 * El backend agrega ventas, movimientos y productos en un solo endpoint, así
 * que el front no necesita traer el ledger por separado para armar el resumen.
 */

import api from "@/lib/axios"

import type { DashboardResumen, PeriodoDashboard } from "../types"

/** Obtiene el resumen gerencial para el periodo indicado. */
export async function getDashboardService(
    periodo: PeriodoDashboard
): Promise<DashboardResumen> {
    const { data } = await api.get<DashboardResumen>("/dashboard/resumen", {
        params: { periodo },
    })
    return data
}