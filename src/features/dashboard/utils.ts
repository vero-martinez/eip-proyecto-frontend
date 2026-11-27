
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
    Anomalia,
    EstadoAlerta,
    SerieSemanal,
} from "./types"

// ==========================================
// FORMATO
// ==========================================

const TZ_LIMA = "America/Lima"

function fechaValida(valor: string | null | undefined): Date | null {
    if (!valor) return null
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime()) ? null : fecha
}

function formatearFecha(fecha: string, conAnio: boolean): string {
    const valor = fechaValida(fecha)
    if (!valor) return "—"

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        ...(conAnio ? { year: "numeric" } : {}),
        timeZone: TZ_LIMA,
    }).format(valor)
}

/**
 * Rango del periodo consultado. El backend devuelve `hasta` como límite
 * exclusivo, así que se retrocede un milisegundo para mostrar el último día
 * realmente incluido en el periodo.
 */
export function formatRangoPeriodo(desde: string, hasta: string): string {
    const fin = fechaValida(hasta)
    if (!fin || !fechaValida(desde)) return "—"

    const ultimoIncluido = new Date(fin.getTime() - 1).toISOString()
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

const ETIQUETAS_METODO: Record<string, string> = {
    promedio_movil: "Promedio móvil",
    croston_sba: "Demanda intermitente",
    suavizado_exponencial: "Suavizado exponencial",
    holt_amortiguado: "Tendencia amortiguada",
    estacional_ingenuo: "Misma semana del año anterior",
    holt_winters: "Estacional (Holt-Winters)",
    ciclo_regular: "Pedidos con ritmo regular",
}

/** Nombre legible del método de pronóstico; si no se conoce, el valor tal cual. */
export function getEtiquetaMetodo(metodo: string): string {
    return ETIQUETAS_METODO[metodo] ?? metodo
}

/** Fecha corta ("12 oct") de una fecha sin hora como "2026-10-12". */
export function formatSemanaCorta(fecha: string): string {
    const valor = fechaValida(fecha)
    if (!valor) return "—"

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
    }).format(valor)
}

export function formatInicioSemanaDDMM(fecha: string): string {
    const valor = fechaValida(fecha)
    if (!valor) return "—"

    const dia = String(valor.getUTCDate()).padStart(2, "0")
    const mes = String(valor.getUTCMonth() + 1).padStart(2, "0")
    return `${dia}/${mes}`
}

export type SeveridadVisible = "alta" | "media" | "informativa"

export function inicioSemanaAnomalia(fecha: string | null): string {
    if (!fecha) return "sin-fecha"
    const valor = fechaValida(`${fecha.slice(0, 10)}T00:00:00Z`)
    return valor ? getInicioSemanaISO(valor) : fecha.slice(0, 10)
}

export function getClaveAnomalia(item: Anomalia): string {
    const semana = inicioSemanaAnomalia(item.fecha)
    return semana === "sin-fecha"
        ? `stock-${item.productId}`
        : `${item.productId}|${semana}`
}

export function getSeveridadVisible(item: Anomalia): SeveridadVisible {
    if (item.tipo === "stock_negativo" || (item.valor !== null && item.valor < 0)) {
        return "alta"
    }

    if (item.tipo === "semana_atipica" && item.valor === 0) {
        return "informativa"
    }

    if (item.valor !== null && item.esperado !== null && item.esperado > 0) {
        const veces = item.valor / item.esperado
        if (veces > 2.5) return "alta"
        if (veces >= 1.5) return "media"
    }

    return item.severidad === "alta" ? "alta" : "media"
}

function getRatioAnomalia(item: Anomalia): number {
    if (item.valor === null || !item.esperado) return 0
    return item.valor / item.esperado
}

export function getAnomaliasUnicas(items: Anomalia[]): Anomalia[] {
    const vistas = new Map<string, Anomalia>()

    items.forEach((item) => {
        const clave = getClaveAnomalia(item)
        const actual = vistas.get(clave)
        if (!actual) {
            vistas.set(clave, item)
            return
        }

        const actualEsSemana = actual.tipo === "semana_atipica"
        const nuevoEsSemana = item.tipo === "semana_atipica"
        const gana =
            (nuevoEsSemana && !actualEsSemana) ||
            (nuevoEsSemana === actualEsSemana &&
                (item.puntaje ?? 0) > (actual.puntaje ?? 0))

        if (gana) vistas.set(clave, item)
    })

    const peso: Record<SeveridadVisible, number> = {
        alta: 0,
        media: 1,
        informativa: 2,
    }

    return [...vistas.values()].sort((a, b) => {
        const porSeveridad =
            peso[getSeveridadVisible(a)] - peso[getSeveridadVisible(b)]
        if (porSeveridad !== 0) return porSeveridad

        const porPuntaje = (b.puntaje ?? 0) - (a.puntaje ?? 0)
        if (porPuntaje !== 0) return porPuntaje

        const porRatio = getRatioAnomalia(b) - getRatioAnomalia(a)
        if (porRatio !== 0) return porRatio

        return a.nombre.localeCompare(b.nombre)
    })
}

export function getAnomaliasRelevantes(items: Anomalia[]): Anomalia[] {
    return getAnomaliasUnicas(items).filter((item) => {
        const severidad = getSeveridadVisible(item)
        return severidad === "alta" || severidad === "media"
    })
}

export function formatDiaMesCorto(fecha: string | null): string {
    const valor = fechaValida(fecha)
    if (!valor) return "—"

    const texto = new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
    }).format(valor)
    const partes = texto.trim().split(/\s+/)
    return partes.length === 2
        ? `${partes[0]} de ${partes[1]!.replace(/\.$/, "")}`
        : texto
}

export function getFraseAnomaliaBreve(item: Anomalia): string {
    const cuando = item.fecha
        ? ` (semana del ${formatDiaMesCorto(item.fecha)})`
        : ""
    const ratio = getRatioAnomalia(item)

    if (item.tipo === "stock_negativo") {
        return `${item.nombre} tiene stock negativo${cuando}.`
    }
    if (item.valor === 0) {
        return `${item.nombre} no tuvo ventas${cuando}.`
    }
    if (item.tipo === "semana_atipica" && ratio >= 2.5) {
        return `${item.nombre} vendió el triple de lo habitual${cuando}.`
    }
    if (item.tipo === "semana_atipica" && ratio >= 1.5) {
        return `${item.nombre} vendió más de lo habitual${cuando}.`
    }
    if (item.tipo === "semana_atipica") {
        return `${item.nombre} tuvo una semana inusual${cuando}.`
    }
    if (ratio >= 2.5) {
        return `${item.nombre} tuvo un movimiento inusual${cuando}.`
    }
    return `${item.nombre} tuvo un movimiento fuera de lo habitual${cuando}.`
}

function listarNombres(items: Anomalia[]): string {
    const nombres = items.map((item) => item.nombre)
    if (nombres.length <= 1) return nombres[0] ?? ""
    if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`
    return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`
}

export function getResumenAnomalias(items: Anomalia[]): {
    texto: string | null
    clave: string | null
} {
    const relevantes = getAnomaliasRelevantes(items)
    if (relevantes.length === 0) return { texto: null, clave: null }

    if (relevantes.length === 1) {
        const unico = relevantes[0]!
        return {
            texto: getFraseAnomaliaBreve(unico),
            clave: getClaveAnomalia(unico),
        }
    }

    if (relevantes.length > 3) {
        const primero = relevantes[0]!
        const segundo = relevantes[1]!
        return {
            texto: `Se detectaron ${relevantes.length} ventas inusuales: ${primero.nombre} y ${segundo.nombre}, y ${relevantes.length - 2} más.`,
            clave: getClaveAnomalia(primero),
        }
    }

    return {
        texto: `Se detectaron ${relevantes.length} ventas inusuales: ${listarNombres(relevantes)}.`,
        clave: getClaveAnomalia(relevantes[0]!),
    }
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

export function getSemanasCompletas(
    serie: SerieSemanal[],
    ahora: number = Date.now()
): SerieSemanal[] {
    return serie.filter((semana) => {
        const hasta = fechaValida(semana.hasta)
        return hasta !== null && hasta.getTime() <= ahora
    })
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

// ==========================================
// PANEL GERENCIAL
// ==========================================

export type CampoSerie = "totalVentas" | "piezasVendidas" | "margenBruto"

export type NivelPrediccion = "confiable" | "aproximada" | "pocoConfiable"

export interface EstadoPrediccion {
    nivel: NivelPrediccion
    etiqueta: string
    className: string
    puntoClassName: string
}

/** Una sola regla de confianza para todo el panel. */
export function getEstadoPrediccion(wape: number | null): EstadoPrediccion {
    if (wape === null || !Number.isFinite(wape) || wape > 0.4) {
        return {
            nivel: "pocoConfiable",
            etiqueta: "Predicción poco confiable, hay pocos datos",
            className: "border-destructive/40 bg-destructive/10 text-destructive",
            puntoClassName: "bg-destructive",
        }
    }

    if (wape > 0.2) {
        return {
            nivel: "aproximada",
            etiqueta: "Predicción aproximada",
            className: "border-warning/40 bg-warning/10 text-warning",
            puntoClassName: "bg-warning",
        }
    }

    return {
        nivel: "confiable",
        etiqueta: "Predicción confiable",
        className: "border-success/40 bg-success/10 text-success",
        puntoClassName: "bg-success",
    }
}

/** Fecha larga legible sin desplazamientos de zona horaria. */
export function formatFechaLarga(fecha: string | null): string {
    if (!fecha) return "—"

    const valor = fechaValida(fecha)
    if (!valor) return "—"

    return new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    }).format(valor)
}

/** Fecha y hora legible para indicar cuándo se actualizaron los datos. */
export function formatFechaHora(valor: number | string | null | undefined): string {
    if (valor === null || valor === undefined || valor === "") return "—"

    const fecha = typeof valor === "number" ? new Date(valor) : fechaValida(valor)
    if (!fecha || Number.isNaN(fecha.getTime())) return "—"

    return new Intl.DateTimeFormat("es-PE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TZ_LIMA,
    }).format(fecha)
}

/** "3.5" -> "3 semanas y media", sin decimales técnicos. */
export function formatSemanasLegibles(semanas: number | null): string {
    if (semanas === null || !Number.isFinite(semanas)) return "Sin fecha estimada"
    if (semanas <= 0) return "Menos de una semana"
    if (semanas === 1) return "1 semana"

    const entero = Math.floor(semanas)
    const decimal = semanas - entero

    if (decimal >= 0.35 && decimal <= 0.65) {
        return `${entero} ${entero === 1 ? "semana" : "semanas"} y media`
    }

    const redondeo = Math.round(semanas)
    return `${redondeo} semanas`
}

/** Rango legible de una semana pronosticada: "23 al 29 de noviembre". */
export function formatRangoSemanal(fecha: string): string {
    const inicio = fechaValida(fecha)
    if (!inicio) return "—"

    const fin = new Date(inicio.getTime() + 6 * 24 * 60 * 60 * 1000)
    const mismoMes = inicio.getUTCMonth() === fin.getUTCMonth()

    const diaInicio = new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        timeZone: "UTC",
    }).format(inicio)
    const mesInicio = new Intl.DateTimeFormat("es-PE", {
        month: "long",
        timeZone: "UTC",
    }).format(inicio)
    const diaFin = new Intl.DateTimeFormat("es-PE", {
        day: "numeric",
        timeZone: "UTC",
    }).format(fin)

    if (mismoMes) return `${diaInicio} al ${diaFin} de ${mesInicio}`

    const mesFin = new Intl.DateTimeFormat("es-PE", {
        month: "long",
        timeZone: "UTC",
    }).format(fin)
    return `${diaInicio} de ${mesInicio} al ${diaFin} de ${mesFin}`
}

/** Variación de un campo entre las dos últimas semanas completas. */
export function getVariacionCampo(
    serie: SerieSemanal[],
    campo: CampoSerie
): number | null {
    const completas = getSemanasCompletas(serie)
    if (completas.length < 2) return null

    const anterior = completas[completas.length - 2]![campo]
    const actual = completas[completas.length - 1]![campo]
    if (!anterior) return null

    return ((actual - anterior) / anterior) * 100
}

/** Lunes de la semana de una fecha ISO (UTC) para alinear el marcador "Hoy". */
export function getInicioSemanaISO(fecha: Date = new Date()): string {
    const copia = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()))
    const dia = copia.getUTCDay()
    const desplazamiento = dia === 0 ? 6 : dia - 1
    copia.setUTCDate(copia.getUTCDate() - desplazamiento)
    return copia.toISOString().slice(0, 10)
}
