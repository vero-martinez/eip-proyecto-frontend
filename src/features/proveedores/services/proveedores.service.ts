/**
 * Servicio de Proveedores: catálogo nacional para las compras y
 * aperturas del inventario.
 */

import type { Proveedor } from "../types"

// ===== Mock data =====

const MOCK_PROVEEDORES: Proveedor[] = [
    { id: 1, name: "Canteras Andinas S.A.C." },
    { id: 2, name: "Minera del Sur" },
    { id: 3, name: "Distribuidora Lurín" },
    { id: 4, name: "Importaciones Roca Viva" },
]

// Simula la latencia de red.
const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Service =====

/** Lista los proveedores registrados. */
export async function getProveedoresService(): Promise<Proveedor[]> {
    await delay()
    return [...MOCK_PROVEEDORES]
}