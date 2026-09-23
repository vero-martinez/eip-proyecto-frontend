/**
 * Servicio de Entradas con datos de prueba (Mock) persistidos en localStorage.
 * Gestiona y consulta el historial de ingresos de productos al inventario.
 */

import type { StockEntry } from "../types"
import { createLocalStore } from "@/lib/persistence"

/** Genera una fecha en formato ISO restando días a la fecha actual. */
function daysAgo(days: number, hour = 15): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString()
}

/** Helper interno para construir objetos de entrada de stock semillas. */
function entrySeed(
    id: number,
    productId: number,
    quantity: number,
    days: number,
    notes?: string,
    proveedorId?: number,
    responsable?: string
): StockEntry {
    return {
        id,
        productId,
        quantity,
        proveedorId,
        responsable,
        createdAt: daysAgo(days),
    }
}

function seedStockEntries(): StockEntry[] {
    return [
        entrySeed(1, 5, 6, 1, "Reposición de amatistas pulidas", 2, "Taller Mock"),
        entrySeed(2, 4, 12, 2, "Reposición de amatistas pulidas", 2, "Carlos Ríos"),
        entrySeed(3, 6, 15, 3, undefined, undefined, "María Gómez"),
        entrySeed(4, 1, 40, 5, undefined, undefined, "Taller Mock"),
        entrySeed(5, 7, 5, 7, undefined, 3, "Carlos Ríos"),
        entrySeed(6, 7, 10, 9, undefined, 3, "María Gómez"),
        entrySeed(7, 2, 20, 12, "Compra a proveedor", 1, "Taller Mock"),
        entrySeed(8, 3, 50, 20, "Lote de exportación", undefined, "Carlos Ríos"),
        entrySeed(9, 4, 8, 25, undefined, undefined, "María Gómez"),
        entrySeed(10, 8, 10, 45, undefined, 1, "Taller Mock"),
        entrySeed(11, 6, 5, 60, undefined, undefined, "Carlos Ríos"),
    ]
}

// --- Declaración del Store ---

const stockEntriesStore = createLocalStore<StockEntry[]>("stock_entries", seedStockEntries)

/** Simula latencia de red. */
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

/** Obtiene el historial de entradas ordenado de más reciente a más antiguo. */
export async function getStockEntriesService(): Promise<StockEntry[]> {
    await delay()
    const currentEntries = stockEntriesStore.get()
    return [...currentEntries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

/** Agrega un nuevo registro al historial de entradas. */
export async function appendStockEntryService(data: {
    productId: number
    quantity: number
    proveedorId?: number
    responsable: string
    notas?: string
}): Promise<StockEntry> {
    await delay()

    const currentEntries = stockEntriesStore.get()
    const maxId = currentEntries.length > 0 ? Math.max(...currentEntries.map((e) => e.id)) : 0
    const nextId = maxId + 1

    const newEntry: StockEntry = {
        id: nextId,
        productId: data.productId,
        quantity: data.quantity,
        proveedorId: data.proveedorId,
        responsable: data.responsable,
        createdAt: new Date().toISOString(),
    }

    stockEntriesStore.set([newEntry, ...currentEntries])
    return newEntry
}