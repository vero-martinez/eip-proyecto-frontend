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
/** Estado de reposición de un producto. */
export type EstadoReposicion = "pedir_ya" | "pedir_pronto" | "suficiente" | "sin_demanda"

/** Qué tipo de anomalía detectó el backend. */
export type TipoAnomalia = "semana_atipica" | "movimiento_atipico" | "stock_negativo"

/** Gravedad de la anomalía. */
export type SeveridadAnomalia = "alta" | "media"

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

/** Una semana pronosticada (la fecha es el lunes que inicia la semana). */
export interface PronosticoSemana {
    semana: string
    unidades: number
}

/** Pronóstico de demanda de un producto. */
export interface PronosticoProducto {
    productId: number
    nombre: string
    sku: string
    unitType: UnitType
    /** Método elegido en la validación (ver `getEtiquetaMetodo`). */
    metodo: string
    /** Error medido en semanas pasadas; null si no hubo datos para medirlo. */
    wape: number | null
    /** false cuando el error es alto o no se pudo medir. */
    confiable: boolean
    semanasHistorial: number
    semanas: PronosticoSemana[]
}

/** Respuesta de `GET /analitica/demanda/pronostico`. */
export interface PronosticoDemanda {
    horizonteSemanas: number
    productos: PronosticoProducto[]
}

/** Recomendación de reposición de un producto. */
export interface ReposicionProducto {
    productId: number
    nombre: string
    sku: string
    unitType: UnitType
    stockActual: number
    stockMinimo: number
    /** Unidades esperadas en todo el pronóstico. */
    demandaHorizonte: number
    /** Semanas que dura el stock; null si dura más que el pronóstico. */
    semanasCobertura: number | null
    semanaAgotamiento: string | null
    cantidadSugerida: number
    /** Semana límite para pedir; si ya pasó, es la semana actual. */
    fechaLimitePedido: string | null
    plazoSemanas: number
    estado: EstadoReposicion
    confiable: boolean
}

/** Respuesta de `GET /analitica/reposicion`. */
export interface ReposicionStock {
    horizonteSemanas: number
    productos: ReposicionProducto[]
}

/** Una anomalía en ventas, mermas o stock. */
export interface Anomalia {
    tipo: TipoAnomalia
    severidad: SeveridadAnomalia
    productId: number
    nombre: string
    sku: string
    unitType: UnitType
    /** Lunes de la semana o día del movimiento; null en stock negativo. */
    fecha: string | null
    valor: number | null
    esperado: number | null
    /** Desviaciones respecto a lo habitual; null si no aplica. */
    puntaje: number | null
    /** Explicación lista para mostrar. */
    mensaje: string
}

/** Respuesta de `GET /analitica/anomalias`. */
export interface AnomaliasDetectadas {
    semanasRevisadas: number
    total: number
    altas: number
    medias: number
    anomalias: Anomalia[]
}