/**
 * Utilidades para unidades de medida y formato de stock.
 */

import type { Product, UnitType } from "@/types/products"

/** Catálogo de unidades de medida y sus símbolos. */
export const UNIT_OPTIONS: {
    value: UnitType
    label: string
    symbol: string
}[] = [
        { value: "UNIDAD", label: "Unidad", symbol: "u" },
        { value: "KILOGRAMO", label: "Kilogramo", symbol: "kg" },
    ]

/** Retorna el símbolo de la unidad de medida. */
export function getUnitSymbol(unitType: UnitType): string {
    return UNIT_OPTIONS.find((option) => option.value === unitType)?.symbol ?? unitType
}

/** Verifica si el stock actual está en nivel de alerta. */
export function hasLowStock(product: Product): boolean {
    return product.isActive && product.currentStock <= product.minStockAlert
}

/** Verifica si el producto está agotado (sin stock disponible). */
export function isOutOfStock(product: Product): boolean {
    return product.currentStock <= 0
}

/** Formatea el stock junto a su símbolo (ej. "3 u"). */
export function formatStock(product: Product): string {
    return `${product.currentStock} ${getUnitSymbol(product.unitType)}`
}

/** Formatea el total de productos con pluralización (ej. "5 productos"). */
export function formatProductCount(count: number): string {
    return `${count} producto${count !== 1 ? "s" : ""}`
}