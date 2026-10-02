/**
 * Utilidades del módulo Dashboard: formateo de datos del endpoint y cálculo
 * de indicadores derivados.
 *
 * Todos los derivados parten de valores reales devueltos por el backend; si el
 * divisor es cero se devuelve `null` para que la interfaz muestre "—" en vez de
 * inventar un número.
 */

import type {
    AlertaStockItem,
    EstadoAlerta,
    SerieSemanal,
} from "./types"

// ==========================================
// FORMATO
// ==========================================

const TZ_LIMA = "America/Lima"

function formatearFecha(fecha: string, conAnio: boolean): string {
    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        ...(conAnio ? { year: "numeric" } : {}),
        timeZone: TZ_LIMA,
    }).format(new Date(fecha))
}

/**
 * Rango del periodo consultado. El backend devuelve `hasta` como límite
 * exclusivo, así que se retrocede un milisegundo para mostrar el último día
 * realmente incluido en el periodo.
 */
export function formatRangoPeriodo(desde: string, hasta: string): string {
    const ultimoIncluido = new Date(new Date(hasta).getTime() - 1).toISOString()
    return `${formatearFecha(desde, false)} – ${formatearFecha(ultimoIncluido, true)}`
}

/** Formatea un porcentaje ya calculado; si no existe, muestra un guion. */
export function formatPorcentaje(valor: number | null, decimales = 1): string {
    if (valor === null || !Number.isFinite(valor)) return "—"
    return `${valor.toFixed(decimales)}%`
}

/** Quita decimales inútiles de una cantidad de piezas. */
export function formatPiezas(valor: number): string {
    return new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(valor)
}

// ==========================================
// INDICADORES DERIVADOS
// ==========================================

/** Margen bruto expresado como porcentaje de las ventas. */
export function getMargenPorcentaje(margenBruto: number, totalVentas: number): number | null {
    if (!totalVentas) return null
    return (margenBruto / totalVentas) * 100
}

/** Piezas promedio por operación de venta. */
export function getPiezasPorVenta(piezasVendidas: number, cantidadVentas: number): number | null {
    if (!cantidadVentas) return null
    return piezasVendidas / cantidadVentas
}

/** Venta promedio por semana dentro de la serie. */
export function getPromedioSemanal(serie: SerieSemanal[]): number {
    if (!serie.length) return 0
    return serie.reduce((acc, semana) => acc + semana.totalVentas, 0) / serie.length
}

/** Semana con mayor facturación de la serie, o null si la serie viene vacía. */
export function getSemanaPico(serie: SerieSemanal[]): SerieSemanal | null {
    if (!serie.length) return null
    return serie.reduce(
        (pico, semana) => (semana.totalVentas > pico.totalVentas ? semana : pico),
        serie[0]!
    )
}

/**
 * Variación porcentual de la última semana frente a la anterior.
 * Null cuando no hay dos semanas comparables o cuando la semana anterior no
 * tuvo ventas (la división no sería interpretable).
 */
export function getVariacionSemanal(serie: SerieSemanal[]): number | null {
    if (serie.length < 2) return null
    const anterior = serie[serie.length - 2]!
    const actual = serie[serie.length - 1]!
    if (!anterior.totalVentas) return null
    return ((actual.totalVentas - anterior.totalVentas) / anterior.totalVentas) * 100
}

// ==========================================
// ORDENAMIENTO DE ALERTAS
// ==========================================

const ORDEN_ESTADO: EstadoAlerta[] = ["agotado", "bajo", "inactivo"]

/**
 * Ordena las alertas por severidad: agotados, luego stock bajo y por último
 * inactivos; dentro de cada grupo, por unidades faltantes y nombre.
 */
export function getAlertasPriorizadas(items: AlertaStockItem[]): AlertaStockItem[] {
    return [...items].sort((a, b) => {
        const porEstado = ORDEN_ESTADO.indexOf(a.estado) - ORDEN_ESTADO.indexOf(b.estado)
        if (porEstado !== 0) return porEstado
        if (b.unidadesFaltantes !== a.unidadesFaltantes) {
            return b.unidadesFaltantes - a.unidadesFaltantes
        }
        return a.nombre.localeCompare(b.nombre)
    })
}