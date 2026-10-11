/**
 * Tipos del módulo de Reportes.
 *
 * El backend no expone endpoints de reportes, así que todo se arma en el
 * cliente a partir de las listas que ya consumen el resto de módulos
 * (ventas, movimientos, comercio exterior y productos).
 *
 * Cada reporte se resuelve a una estructura normalizada →indicadores,
 * serie de la gráfica y tabla→ para que los tres formatos de exportación
 * (PDF, CSV y XLSX) muestreen exactamente lo mismo.
 */

import type { LucideIcon } from "lucide-react"
import type { StatTone } from "@/components/common/stat-card"
import type { Category, Product } from "@/types/products"
import type { InventoryMovement } from "@/features/movimientos/types"
import type { OperacionComercioExterior } from "@/features/comercio-exterior/types"
import type { Venta } from "@/features/ventas/types"

/** Identificadores de los reportes disponibles en el módulo. */
export type ReporteId =
    | "ventas-canal"
    | "ventas-periodo"
    | "kardex"
    | "comercio-exterior"
    | "stock"
    | "mas-vendidos"

/** Agrupación temporal de "Ventas por periodo". */
export type Granularidad = "dia" | "semana" | "mes"

/** Formatos de exportación. */
export type FormatoReporte = "pdf" | "csv" | "xlsx"

/** Rangos rápidos; "personalizado" habilita los dos campos de fecha. */
export type PresetRango =
    | "hoy"
    | "7-dias"
    | "30-dias"
    | "este-mes"
    | "mes-anterior"
    | "personalizado"

/** Rango inclusivo en fechas locales, formato "YYYY-MM-DD". */
export interface RangoFechas {
    desde: string
    hasta: string
}

/** Valores admitidos en una celda de reporte. */
export type ValorCelda = string | number | null

/** Una fila de la tabla, indexada por `ColumnaReporte.clave`. */
interface FilaReporte {
    [clave: string]: ValorCelda
}

/**
 * Formato de una columna. El texto lo compone `formatCelda` según el
 * formato, para que los exportadores escriban el número de la misma manera.
 */
export type FormatoColumna = "texto" | "moneda" | "usd" | "numero" | "porcentaje"

export interface ColumnaReporte {
    clave: string
    etiqueta: string
    formato: FormatoColumna
    /**
     * Peso relativo para repartir el ancho disponible entre columnas.
     * Las columnas numéricas pesan 1 y las de texto 2, de modo que el nombre
     * del producto o del socio respire sin que el PDF se salga de la hoja.
     */
    peso?: number
}

/** Indicador del reporte activo. */
export interface StatReporte {
    label: string
    value: string
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export interface TablaReporte {
    columnas: ColumnaReporte[]
    filas: FilaReporte[]
    /** Fila de totales; las celdas ausentes se imprimen vacías. */
    totales?: FilaReporte
}

/** Reporte ya agregado y listo para pintarse o exportarse. */
export interface ReporteResuelto {
    id: ReporteId
    titulo: string
    descripcion: string
    /** El reporte no depende del rango: es un snapshot del presente. */
    snapshot: boolean
    stats: StatReporte[]
    tabla: TablaReporte
}

/** Listas crudas que alimentan los reportes. */
export interface DatosReportes {
    ventas: Venta[]
    movimientos: InventoryMovement[]
    operaciones: OperacionComercioExterior[]
    productos: Product[]
    categorias: Category[]
}
