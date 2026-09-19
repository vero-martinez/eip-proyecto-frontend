/**
 * Servicio de Entradas con datos mock.
 */

import type { Proveedor, StockEntry } from "../types"
import { adjustProductStockService } from "@/features/products/services/products.service"

// ===== Mock data =====

/**
 * Genera una fecha ISO relativa a los días transcurridos desde hoy.
 */
function daysAgo(days: number, hour = 15): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString()
}

const MOCK_PROVEEDORES: Proveedor[] = [
    { id: 1, name: "Canteras Andinas S.A.C." },
    { id: 2, name: "Minera del Sur" },
    { id: 3, name: "Distribuidora Lurín" },
    { id: 4, name: "Importaciones Roca Viva" },
]

let mockId = 0
function entry(
    productId: number,
    quantity: number,
    days: number,
    notes?: string,
    proveedorId?: number,
    responsable?: string
): StockEntry {
    mockId += 1
    return {
        id: mockId,
        productId,
        quantity,
        proveedorId,
        responsable,
        createdAt: daysAgo(days),
    }
}

let MOCK_ENTRIES: StockEntry[] = [
    entry(5, 6, 1, "Reposición de amatistas pulidas", 2, "Taller Mock"),
    entry(4, 12, 2, "Reposición de amatistas pulidas", 2, "Carlos Ríos"),
    entry(6, 15, 3, undefined, undefined, "María Gómez"),
    entry(1, 40, 5, undefined, undefined, "Taller Mock"),
    entry(7, 5, 7, undefined, 3, "Carlos Ríos"),
    entry(7, 10, 9, undefined, 3, "María Gómez"),
    entry(2, 20, 12, "Compra a proveedor", 1, "Taller Mock"),
    entry(3, 50, 20, "Lote de exportación", undefined, "Carlos Ríos"),
    entry(4, 8, 25, undefined, undefined, "María Gómez"),
    entry(8, 10, 45, undefined, 1, "Taller Mock"),
    entry(6, 5, 60, undefined, undefined, "Carlos Ríos"),
]

// Simula la latencia de red.
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Service =====

/**
 * Obtiene las entradas ordenadas de la más reciente a la más antigua.
 */
export async function getStockEntriesService(): Promise<StockEntry[]> {
    await delay()
    return [...MOCK_ENTRIES].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

/**
 * Obtiene la lista de proveedores registrados.
 */
export async function getProveedoresService(): Promise<Proveedor[]> {
    await delay(200)
    return [...MOCK_PROVEEDORES]
}

/**
 * Registra una nueva entrada de stock y actualiza el total del producto.
 */
export async function registerStockEntryService(data: {
    productId: number
    quantity: number
    notes?: string
    proveedorId?: number
    responsable?: string
}): Promise<StockEntry> {
    await delay()
    const newEntry: StockEntry = {
        id: mockId + 1,
        productId: data.productId,
        quantity: data.quantity,
        proveedorId: data.proveedorId,
        responsable: data.responsable,
        createdAt: new Date().toISOString(),
    }
    mockId += 1

    MOCK_ENTRIES = [newEntry, ...MOCK_ENTRIES]
    await adjustProductStockService(data.productId, data.quantity)

    return newEntry
}