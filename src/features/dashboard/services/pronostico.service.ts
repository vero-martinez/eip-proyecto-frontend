/**
 * Servicio del pronóstico de demanda (zona 1 de analítica).
 */

import api from "@/lib/axios"

import type { PronosticoDemanda } from "../types"

/** Pronóstico semanal de todos los productos con historial suficiente. */
export async function getPronosticoService(): Promise<PronosticoDemanda> {
    const { data } = await api.get<PronosticoDemanda>("/analitica/demanda/pronostico")
    return data
}