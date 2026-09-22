/**
 * Utilidades del módulo Productos: resumen de métricas del catálogo y
 * opciones de ordenamiento. Las helpers genéricas de stock/unidades y
 * categorías viven en lib (units.ts, categories.ts).
 */

import type { Product } from "@/types/products"
import { hasLowStock } from "@/lib/units"
import type { CatalogSort } from "./types"

/**
 * Opciones de orden del catálogo: fuente única para el select (label)
 * y el ordenamiento (value).
 */
export const CATALOG_SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
    { value: "recent", label: "Más recientes" },
    { value: "oldest", label: "Más antiguos" },
    { value: "price-asc", label: "Precio: menor a mayor" },
    { value: "price-desc", label: "Precio: mayor a menor" },
]

/**
 * Resumen de métricas del catálogo de productos, para las cards
 * de estadísticas. El valor de inventario usa el precio de venta.
 */
export function summarizeProducts(products: Product[]): {
    total: number
    active: number
    lowStock: number
    inactive: number
    inventoryValue: number
} {
    const total = products.length
    const active = products.filter((p) => p.isActive).length
    const lowStock = products.filter(hasLowStock).length
    const inactive = total - active
    const inventoryValue = products.reduce(
        (sum, p) => sum + p.salePrice * p.currentStock,
        0
    )

    return { total, active, lowStock, inactive, inventoryValue }
}