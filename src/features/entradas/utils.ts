/**
 * Funciones auxiliares para el módulo de Entradas.
 */

import type { Product, UnitType } from "@/types/products"
import { formatDate } from "@/lib/utils"
import { hasLowStock, UNIT_OPTIONS } from "@/features/products/utils"

import type { Proveedor, StockEntry } from "./types"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Busca el nombre de un proveedor según su ID.
 */
export function getProveedorName(
    proveedorId: number | undefined,
    proveedores: Proveedor[]
): string | undefined {
    if (proveedorId === undefined) return undefined
    return proveedores.find((proveedor) => proveedor.id === proveedorId)?.name
}

/**
 * Comprueba si la entrada se registró en los últimos 30 días.
 */
function isWithinLast30Days(entry: StockEntry): boolean {
    return Date.now() - new Date(entry.createdAt).getTime() <= THIRTY_DAYS_MS
}

/**
 * Agrega el símbolo de la unidad a la cantidad ingresada (ej: "+6 u").
 */
export function formatEntryQuantity(quantity: number, unitType: UnitType): string {
    const unit = UNIT_OPTIONS.find((option) => option.value === unitType)
    const symbol = unit?.symbol ?? unitType
    return `+${quantity} ${symbol}`
}

/**
 * Obtiene los últimos N productos con sus cantidades acumuladas.
 */
export function getLastDistinctProducts(
    entries: StockEntry[],
    products: Product[],
    limit = 5
): {
    product: Product
    totalQuantity: number
    lastDate: string
    proveedorId: number | undefined
    responsable: string | undefined
}[] {
    const byProduct = new Map<
        number,
        { total: number; last: number; proveedorId?: number; responsable?: string }
    >()

    for (const item of entries) {
        const time = new Date(item.createdAt).getTime()
        const current =
            byProduct.get(item.productId) ?? { total: 0, last: 0 }

        if (time > current.last) {
            current.last = time
            current.proveedorId = item.proveedorId
            current.responsable = item.responsable
        }
        current.total += item.quantity
        byProduct.set(item.productId, current)
    }

    return [...byProduct.entries()]
        .map(([productId, { total, last, proveedorId, responsable }]) => ({
            product: products.find((p) => p.id === productId),
            totalQuantity: total,
            lastDate: new Date(last).toISOString(),
            proveedorId,
            responsable,
        }))
        .filter((item): item is {
            product: Product
            totalQuantity: number
            lastDate: string
            proveedorId: number | undefined
            responsable: string | undefined
        } => item.product !== undefined)
        .sort(
            (a, b) =>
                new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
        )
        .slice(0, limit)
}

/**
 * Calcula el resumen de métricas para las tarjetas del panel.
 */
export function summarizeEntradas(
    entries: StockEntry[],
    products: Product[]
): {
    totalInventory: number
    entriesLast30: number
    unitsLast30: number
    lowStock: number
    lastEntry: { product: Product; totalQuantity: number; lastDate: string } | undefined
} {
    const totalInventory = products.filter((p) => p.currentStock > 0).length
    const lowStock = products.filter(hasLowStock).length

    const entriesLast30 = entries.filter(isWithinLast30Days)
    const unitsLast30 = entriesLast30.reduce((sum, item) => sum + item.quantity, 0)

    const [lastEntry] = getLastDistinctProducts(entries, products, 1)

    return {
        totalInventory,
        entriesLast30: entriesLast30.length,
        unitsLast30,
        lowStock,
        lastEntry,
    }
}

/**
 * Formatea la fecha de la última entrada para mostrar en pantalla.
 */
export function formatLastEntryDate(date: string): string {
    return `el ${formatDate(date)}`
}