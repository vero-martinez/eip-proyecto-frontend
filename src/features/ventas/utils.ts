import { UNIT_OPTIONS } from "@/features/products/utils"
import type { Product, UnitType } from "@/types/products"

import type { VentaItem, VentasTotals } from "./types"

/**
 * Busca un producto por SKU o código de barras (insensible a mayúsculas/espacios).
 */
export function findProductBySku(
    products: Product[],
    code: string
): Product | undefined {
    const normalized = code.trim().toLowerCase()
    if (!normalized) return undefined

    return products.find(
        (product) => product.sku.trim().toLowerCase() === normalized
    )
}

/**
 * Calcula los totales del carrito (subtotal, total y contadores).
 */
export function computeTotals(items: VentaItem[]): VentasTotals {
    const subtotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    )
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
        subtotal,
        total: subtotal,
        itemsCount: items.length,
        quantity,
    }
}

/**
 * Formatea la cantidad junto a su símbolo de unidad (ej: "3 u", "2.5 kg").
 */
export function formatSaleQuantity(
    quantity: number,
    unitType: UnitType
): string {
    const symbol =
        UNIT_OPTIONS.find((option) => option.value === unitType)?.symbol ??
        unitType

    return `${quantity} ${symbol}`
}