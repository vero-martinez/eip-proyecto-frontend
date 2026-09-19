/**
 * Servicio de Mermas con datos mock.
 */

import type { Merma } from "../types"
import { adjustProductStockService } from "@/features/products/services/products.service"

// ===== Mock data =====

/**
 * Genera una fecha ISO relativa a los días transcurridos desde hoy.
 */
function daysAgo(days: number, hour = 11): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    date.setHours(hour, 0, 0, 0)
    return date.toISOString()
}

let mockId = 0
function merma(
    productId: number,
    quantity: number,
    days: number,
    motivo: string,
    responsable: string,
    detalle?: string
): Merma {
    mockId += 1
    return {
        id: mockId,
        productId,
        quantity,
        motivo,
        detalle,
        responsable,
        createdAt: daysAgo(days),
    }
}

let MOCK_MERMAS: Merma[] = [
    merma(5, 1, 1, "Rotura o daño durante pulido", "Taller Mock"),
    merma(7, 1, 3, "Defecto de calidad", "Carlos Ríos"),
    merma(
        4,
        2,
        6,
        "Pérdida o extravío",
        "María Gómez",
        "No se encontró en el conteo físico del almacén."
    ),
    merma(2, 2.5, 10, "Rotura o daño durante pulido", "Taller Mock"),
    merma(6, 1, 14, "Error de producción", "Carlos Ríos"),
    merma(
        1,
        3,
        22,
        "Defecto de calidad",
        "María Gómez",
        "Piezas manchadas por humedad."
    ),
    merma(3, 5.5, 35, "Defecto de calidad", "Taller Mock"),
    merma(7, 2, 50, "Pérdida o extravío", "Carlos Ríos"),
]

// Simula la latencia de red.
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

// ===== Service =====

/**
 * Obtiene las mermas ordenadas de la más reciente a la más antigua.
 */
export async function getMermasService(): Promise<Merma[]> {
    await delay()
    return [...MOCK_MERMAS].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
}

/**
 * Registra una nueva merma y descuenta la cantidad del stock del producto.
 */
export async function registerMermaService(data: {
    productId: number
    quantity: number
    motivo: string
    detalle?: string
    responsable: string
}): Promise<Merma> {
    await delay()
    const newMerma: Merma = {
        id: mockId + 1,
        productId: data.productId,
        quantity: data.quantity,
        motivo: data.motivo,
        detalle: data.detalle,
        responsable: data.responsable,
        createdAt: new Date().toISOString(),
    }
    mockId += 1

    MOCK_MERMAS = [newMerma, ...MOCK_MERMAS]
    await adjustProductStockService(data.productId, -data.quantity)

    return newMerma
}