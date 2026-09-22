/**
 * Utilidades del módulo Alertas del taller: clasificación de
 * productos según su estado de stock y cálculo de métricas.
 */

import type { Product } from "@/types/products"
import { hasLowStock } from "@/lib/units"

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export type AlertFilter = "all" | "bajo" | "agotado" | "inactivo"

// ==========================================
// FILTROS & SELECCIÓN DE PRODUCTOS
// ==========================================

/** Productos inactivos (no se comercializan). */
export function getInactivos(products: Product[]): Product[] {
    return products.filter((p) => !p.isActive)
}

/** Productos sin unidades disponibles. */
export function getAgotados(products: Product[]): Product[] {
    return products.filter((p) => p.currentStock === 0)
}

/** Productos con alguna alerta activa (stock bajo o inactivos). */
export function getAlertasActivas(products: Product[]): Product[] {
    return products.filter((p) => hasLowStock(p) || !p.isActive)
}

// ==========================================
// ESTADOS Y EVALUACIÓN DE ALERTAS
// ==========================================

/**
 * Retorna los badges/estados que corresponden a un producto.
 */
export function getStockBadges(product: Product) {
    return {
        bajoStock: product.currentStock > 0 && product.currentStock <= product.minStockAlert,
        agotado: product.currentStock === 0,
        inactivo: !product.isActive,
    }
}

/**
 * Indica si un producto coincide con un filtro de alerta.
 */
export function matchesAlertFilter(product: Product, filter: AlertFilter): boolean {
    const badges = getStockBadges(product)

    switch (filter) {
        case "bajo":
            return badges.bajoStock
        case "agotado":
            return badges.agotado
        case "inactivo":
            return badges.inactivo
        default:
            return true
    }
}

// ==========================================
// CÁLCULOS Y MÉTRICAS
// ==========================================

/** Porcentaje de stock actual respecto al mínimo (0-100%). */
export function getStockToMinPercent(product: Product): number {
    if (product.minStockAlert <= 0) return 100
    return Math.min(100, (product.currentStock / product.minStockAlert) * 100)
}

/** Unidades faltantes para alcanzar el stock mínimo. */
export function getUnitsToMin(product: Product): number {
    return Math.max(0, product.minStockAlert - product.currentStock)
}

/**
 * Resumen optimizado de métricas en un solo recorrido.
 */
export function summarizeAlertas(products: Product[]) {
    const total = products.length

    const counts = products.reduce(
        (acc, p) => {
            const isAlert = hasLowStock(p) || !p.isActive
            if (isAlert) acc.alertas++
            if (!p.isActive) acc.inactivos++
            if (p.currentStock === 0) acc.agotados++
            if (p.currentStock > 0 && p.currentStock <= p.minStockAlert)
                acc.stockBajo++
            return acc
        },
        { alertas: 0, inactivos: 0, agotados: 0, stockBajo: 0 }
    )

    return {
        total,
        ...counts,
    }
}

// ==========================================
// ORDENAMIENTO Y FORMATO
// ==========================================

function getAlertSeverity(product: Product): number {
    if (product.currentStock === 0) return 0
    if (product.currentStock <= product.minStockAlert) return 1
    return 2
}

/**
 * Ordena alertas por severidad: agotados -> stock bajo -> inactivos.
 */
export function sortAlertasBySeverity(products: Product[]): Product[] {
    return getAlertasActivas(products).sort((a, b) => {
        const severityDiff = getAlertSeverity(a) - getAlertSeverity(b)
        if (severityDiff !== 0) return severityDiff

        const ratioDiff = getStockToMinPercent(a) - getStockToMinPercent(b)
        if (ratioDiff !== 0) return ratioDiff

        return a.name.localeCompare(b.name)
    })
}