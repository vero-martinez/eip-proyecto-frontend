import { UNIT_OPTIONS } from "@/features/products/utils"
import { toTitleCase, formatDate } from "@/lib/utils"
import type { Product, UnitType } from "@/types/products"

import { METODOS_PAGO, TIPOS_VENTA } from "./constants"
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

// --- Labels y Formato de venta (compartidos con boleta y Mis ventas) ---

const getLabel = (
    options: { value: string; label: string }[],
    value: string
) => options.find((opt) => opt.value === value)?.label ?? toTitleCase(value)

/** Label legible del tipo de venta ("tienda" -> "Tienda"). */
export function getTipoVentaLabel(value: string): string {
    return getLabel(TIPOS_VENTA, value)
}

/** Label legible del método de pago. */
export function getMetodoPagoLabel(value: string): string {
    return getLabel(METODOS_PAGO, value)
}

/** Fecha y hora legibles de una venta (ej. "14/09/2026 · 16:00"). */
export function formatVentaDateTime(isoDate: string): string {
    const date = new Date(isoDate)
    const hora = date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    })
    return `${formatDate(isoDate)} · ${hora}`
}