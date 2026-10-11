/**
 * Servicio de Movimientos de Inventario.
 *
 * El backend mantiene el ledger y lo devuelve ya enriquecido con los datos
 * del producto y de la venta asociada, así que no hace falta reconstruirlo
 * ni conciliarlo en el cliente.
 */

import api from "@/lib/axios"

import type { InventoryMovement } from "../types"

/** Obtiene el ledger de movimientos, del más reciente al más antiguo. */
export async function getMovimientosService(): Promise<InventoryMovement[]> {
    const { data } = await api.get<InventoryMovement[]>("/movimientos")
    return data
}
