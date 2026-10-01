/**
 * Servicio de Proveedores: catálogo nacional para las compras y
 * aperturas del inventario. Solo lectura (admin, taller).
 */

import api from "@/lib/axios"
import type { Proveedor } from "../types"

/** Lista los proveedores registrados. */
export async function getProveedoresService(): Promise<Proveedor[]> {
    const { data } = await api.get<Proveedor[]>("/proveedores")
    return data
}
