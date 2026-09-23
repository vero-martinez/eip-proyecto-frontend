/**
 * Utilidades del módulo de Ventas: cálculo de totales, formato de
 * cantidades, labels de tipo/método y métricas del historial del
 * vendedor (hoy/semana). Fuente única para POS, boleta y "Mis ventas".
 */

import { getUnitSymbol } from "@/lib/units"
import { toTitleCase, formatDate } from "@/lib/utils"
import type { Product, UnitType } from "@/types/products"

import { METODOS_PAGO, TIPOS_VENTA } from "./constants"
import type { Venta, VentaItem, VentasTotals } from "./types"

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
    return `${quantity} ${getUnitSymbol(unitType)}`
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

/** Resumen de las líneas de una venta (ej. "2 productos"). */
export function formatVentaItems(items: VentaItem[]): string {
    return `${items.length} producto${items.length !== 1 ? "s" : ""}`
}

// --- Fechas del historial (hora local) ---

export interface PeriodSummary {
    count: number
    total: number
}

export interface MisVentasResumen {
    hoy: PeriodSummary
    semana: PeriodSummary
}

/** Inicio del día en hora local (00:00:00). */
const startOfDayLocal = (date: Date): Date =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate())

/** Compara si dos fechas caen el mismo día calendario (hora local). */
export function isSameLocalDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

/** Lunes 00:00 de la semana de la fecha dada (hora local). */
export function startOfWeekMonday(date: Date): Date {
    const monday = startOfDayLocal(date)
    monday.setDate(monday.getDate() - ((date.getDay() + 6) % 7))
    return monday
}

/** Parsea "YYYY-MM-DD" como fecha local al inicio del día. */
export function parseDateInput(value: string): Date {
    const [year, month, day] = value.split("-").map(Number)
    return new Date(year, month - 1, day)
}

/** Indica si una fecha ISO cae dentro de un rango [desde, hasta] inclusivo. */
export function isInDateRange(
    isoDate: string,
    desde?: string,
    hasta?: string
): boolean {
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return false

    if (desde && date < startOfDayLocal(parseDateInput(desde))) return false

    if (hasta) {
        const hastaEnd = startOfDayLocal(parseDateInput(hasta))
        hastaEnd.setDate(hastaEnd.getDate() + 1)
        if (date >= hastaEnd) return false
    }

    return true
}

/**
 * Calcula las métricas de "hoy" y "esta semana" (lunes a hoy) en un
 * solo recorrido sobre las ventas.
 */
export function summarizeMisVentas(ventas: Venta[]): MisVentasResumen {
    const now = new Date()
    const weekStart = startOfWeekMonday(now)

    const resumen: MisVentasResumen = {
        hoy: { count: 0, total: 0 },
        semana: { count: 0, total: 0 },
    }

    for (const venta of ventas) {
        const fecha = new Date(venta.createdAt)

        if (fecha >= weekStart) {
            resumen.semana.count += 1
            resumen.semana.total += venta.total
        }

        if (isSameLocalDay(fecha, now)) {
            resumen.hoy.count += 1
            resumen.hoy.total += venta.total
        }
    }

    return resumen
}