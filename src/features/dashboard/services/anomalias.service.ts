/**
 * Servicio de anomalías (zona 3 de analítica).
 */

import api from "@/lib/axios"

import type { AnomaliasDetectadas } from "../types"

/** Ventas, mermas y stocks fuera de lo habitual en las últimas semanas. */
export async function getAnomaliasService(): Promise<AnomaliasDetectadas> {
    const { data } = await api.get<AnomaliasDetectadas>("/analitica/anomalias")
    return data
}