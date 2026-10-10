/**
 * Catálogos del módulo de Reportes: reportes disponibles, rangos rápidos
 * y formatos de exportación.
 *
 * El prototipo original-era listaba "Ventas por feria", pero la feria no
 * existe como entidad (es solo un valor de `tipoVenta`).
 */
import {
    BarChart3,
    Boxes,
    CalendarRange,
    FileDown,
    FileSpreadsheet,
    FileText,
    Globe,
    Package,
    type LucideIcon,
} from "lucide-react"
import type {
    FormatoReporte,
    Granularidad,
    PresetRango,
    ReporteId,
} from "./types"
interface ReporteItem {
    value: ReporteId
    label: string
    descripcion: string
    icon: LucideIcon
    /** El reporte es un snapshot del presente y no usa el rango de fechas. */
    snapshot: boolean
}
export const REPORTE_ITEMS: ReporteItem[] = [
    {
        value: "ventas-canal",
        label: "Ventas por canal",
        descripcion: "Ingresos y operaciones de cada canal de venta",
        icon: BarChart3,
        snapshot: false,
    },
    {
        value: "ventas-periodo",
        label: "Ventas por periodo",
        descripcion: "Facturación agrupada por día, semana o mes",
        icon: CalendarRange,
        snapshot: false,
    },
    {
        value: "kardex",
        label: "Kardex de movimientos",
        descripcion: "Entradas, salidas y saldo acumulado por producto",
        icon: Boxes,
        snapshot: false,
    },
    {
        value: "comercio-exterior",
        label: "Comercio exterior",
        descripcion: "Importaciones y exportaciones en USD y soles",
        icon: Globe,
        snapshot: false,
    },
    {
        value: "stock",
        label: "Stock actual",
        descripcion: "Disponibilidad y valorización del inventario",
        icon: Package,
        snapshot: true,
    },
    {
        value: "mas-vendidos",
        label: "Más vendidos",
        descripcion: "Ranking de productos por unidades y margen",
        icon: BarChart3,
        snapshot: false,
    },
]
export const PRESET_RANGO_ITEMS: { value: PresetRango; label: string }[] = [
    { value: "hoy", label: "Hoy" },
    { value: "7-dias", label: "Últimos 7 días" },
    { value: "30-dias", label: "Últimos 30 días" },
    { value: "este-mes", label: "Este mes" },
    { value: "mes-anterior", label: "Mes anterior" },
    { value: "personalizado", label: "Personalizado" },
]
export const FORMATO_ITEMS: { value: FormatoReporte; label: string; icon: LucideIcon }[] = [
    { value: "xlsx", label: "Excel", icon: FileSpreadsheet },
    { value: "csv", label: "CSV", icon: FileText },
    { value: "pdf", label: "PDF", icon: FileDown },
]
/** Agrupación temporal de "Ventas por periodo". */
export const GRANULARIDAD_ITEMS: { value: Granularidad; label: string }[] = [
    { value: "dia", label: "Diario" },
    { value: "semana", label: "Semanal" },
    { value: "mes", label: "Mensual" },
]
export const REPORTE_POR_DEFECTO: ReporteId = "ventas-canal"
export const PRESET_RANGO_POR_DEFECTO: PresetRango = "30-dias"
export const FORMATO_POR_DEFECTO: FormatoReporte = "xlsx"
/** Formato de la columna según su tipo: el texto pesa el doble. */
export const PESO_COLUMNA_TEXTO = 2
export const PESO_COLUMNA_NUMERICA = 1