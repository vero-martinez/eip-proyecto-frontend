/**
 * Funciones auxiliares para el módulo de Mermas.
 */

import type { Product, UnitType } from "@/types/products"
import { formatDate } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"

import type { Merma } from "./types"

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

/**
 * Comprueba si la merma está dentro de los últimos 30 días.
 */
function isWithinLast30Days(merma: Merma): boolean {
    return Date.now() - new Date(merma.createdAt).getTime() <= THIRTY_DAYS_MS
}

/**
 * Comprueba si la merma pertenece al mes calendario actual.
 */
function isInCurrentMonth(merma: Merma): boolean {
    const now = new Date()
    const date = new Date(merma.createdAt)
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    )
}

/**
 * Agrega el símbolo de la unidad a la cantidad descartada (ej: "−6 u").
 */
export function formatMermaQuantity(quantity: number, unitType: UnitType): string {
    const symbol = getUnitSymbol(unitType)
    return `−${quantity} ${symbol}`
}

/**
 * Obtiene los últimos N ajustes de merma con su producto resuelto,
 * ordenados del más reciente al más antiguo.
 */
export function getRecentMermas(
    mermas: Merma[],
    products: Product[],
    limit = 5
): (Merma & { product: Product })[] {
    return [...mermas]
        .map((merma) => ({
            ...merma,
            product: products.find((p) => p.id === merma.productId),
        }))
        .filter(
            (item): item is Merma & { product: Product } =>
                item.product !== undefined
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, limit)
}

/**
 * Calcula el resumen de métricas para las tarjetas del panel de mermas:
 * piezas descartadas en los últimos 30 días, pérdida estimada del mes
 * (cantidad × costo por unidad), cantidad de ajustes del mes y el
 * último ajuste registrado.
 */
export function summarizeMermas(
    mermas: Merma[],
    products: Product[]
): {
    piecesLast30: number
    estimatedLossMonth: number
    ajustesMonth: number
    lastMerma: (Merma & { product: Product }) | undefined
} {
    const piecesLast30 = mermas
        .filter(isWithinLast30Days)
        .reduce((sum, item) => sum + item.quantity, 0)

    const monthMermas = mermas.filter(isInCurrentMonth)
    const estimatedLossMonth = monthMermas.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId)
        return sum + item.quantity * (product?.costPrice ?? 0)
    }, 0)

    const [lastMerma] = getRecentMermas(mermas, products, 1)

    return {
        piecesLast30,
        estimatedLossMonth,
        ajustesMonth: monthMermas.length,
        lastMerma,
    }
}

/**
 * Formatea la fecha del último ajuste para mostrar en pantalla.
 */
export function formatLastMermaDate(date: string): string {
    return `el ${formatDate(date)}`
}