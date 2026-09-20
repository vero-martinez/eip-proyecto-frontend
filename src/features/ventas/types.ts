/**
 * Tipos para el módulo de Ventas (Punto de Venta).
 */

import type { UnitType } from "@/types/products"

/**
 * Línea de un carrito/venta: snapshot del producto al momento de
 * agregarlo (nombre, SKU, unidad y precio) más la cantidad vendida.
 */
export interface VentaItem {
    productId: number
    name: string
    sku: string
    unitType: UnitType
    unitPrice: number
    quantity: number
}

/**
 * Venta registrada en el punto de venta.
 */
export interface Venta {
    id: number
    items: VentaItem[]
    tipoVenta: string
    metodoPago: string
    subtotal: number
    total: number
    /** Solo aplica cuando metodoPago es "efectivo": dinero recibido. */
    pagoCon?: number
    /** Diferencia pagoCon - total, cuando es >= 0. */
    vuelto?: number
    /** Nombre de quien realizó la venta (usuario logueado). */
    responsable: string
    createdAt: string
}

/**
 * Totales derivados del carrito.
 */
export interface VentasTotals {
    subtotal: number
    total: number
    /** Cantidad de líneas (productos distintos) en el carrito. */
    itemsCount: number
    /** Suma de unidades sin la unidad de cada item (para badges). */
    quantity: number
}