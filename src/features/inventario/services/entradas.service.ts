/**
 * Servicio de Entradas.
 *
 * Consulta el historial de ingresos de stock al inventario. El registro de
 * entradas y compras se hace desde `operaciones.service`, contra el backend.
 */

import api from "@/lib/axios"

import type { StockEntry } from "../types"

/** Obtiene el historial de entradas, del más reciente al más antiguo. */
export async function getStockEntriesService(): Promise<StockEntry[]> {
    const { data } = await api.get<StockEntry[]>("/entradas")
    return data
}
