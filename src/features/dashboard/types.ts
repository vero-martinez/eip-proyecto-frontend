/**
 * Tipos del Dashboard (feature del resumen gerencial).
 *
 * Reflejan el contrato de `GET /api/v1/dashboard/resumen`, que ya llega en
 * camelCase desde el backend. Los nombres coinciden con `app/esquemas/dashboard.py`.
 */

import type { UnitType } from "@/types/products"

/** Periodo de análisis aceptado por el endpoint. */
export type PeriodoDashboard = "dia" | "semana" | "mes"

/** Clasificación de una alerta de stock. */
export type EstadoAlerta = "agotado" | "bajo" | "inactivo"

/** Indicadores agregados de ventas del periodo consultado. */
export interface ResumenVentas {
    totalVentas: number
    cantidadVentas: number
    promedioPorVenta: number
    piezasVendidas: number
    margenBruto: number
}

/** Una semana de la serie de evolución. */
export interface SerieSemanal {
    /** Semana ISO, por ejemplo "2026-W39". */
    semana: string
    desde: string
    hasta: string
    /** Etiqueta corta para el eje, por ejemplo "S39". */
    etiqueta: string
    totalVentas: number
    piezasVendidas: number
    margenBruto: number
}

/** Producto con mejor facturación del periodo. */
export interface ProductoTop {
    productId: number
    nombre: string
    sku: string
    totalVentas: number
    piezasVendidas: number
    margenBruto: number
}

/** Un producto que cumple alguna condición de alerta de stock. */
export interface AlertaStockItem {
    productId: number
    nombre: string
    sku: string
    unitType: UnitType
    currentStock: number
    minStockAlert: number
    unidadesFaltantes: number
    estado: EstadoAlerta
}

/** Conteo por tipo y detalle de las alertas de stock. */
export interface AlertasStock {
    total: number
    agotados: number
    stockBajo: number
    inactivos: number
    items: AlertaStockItem[]
}

/** Respuesta completa de `GET /dashboard/resumen`. */
export interface DashboardResumen {
    periodo: string
    desde: string
    hasta: string
    resumenVentas: ResumenVentas
    serieSemanal: SerieSemanal[]
    topProductos: ProductoTop[]
    alertasStock: AlertasStock
}