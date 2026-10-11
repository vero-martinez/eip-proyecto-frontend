/**
 * Punto de entrada de utilidades del módulo de Reportes.
 */

import type {
    DatosReportes,
    Granularidad,
    RangoFechas,
    ReporteId,
    ReporteResuelto,
} from "../types"

import { construirComercioExterior } from "./builders/comercio-exterior"
import { construirKardex } from "./builders/kardex"
import { construirMasVendidos } from "./builders/mas-vendidos"
import { construirStock } from "./builders/stock"
import { construirVentasCanal } from "./builders/ventas-canal"
import { construirVentasPeriodo } from "./builders/ventas-periodo"

export function construirReporte(
    reporte: ReporteId,
    datos: DatosReportes,
    rango: RangoFechas,
    granularidad: Granularidad
): ReporteResuelto {
    switch (reporte) {
        case "ventas-canal":
            return construirVentasCanal(datos, rango)
        case "ventas-periodo":
            return construirVentasPeriodo(datos, rango, granularidad)
        case "kardex":
            return construirKardex(datos, rango)
        case "comercio-exterior":
            return construirComercioExterior(datos, rango)
        case "stock":
            return construirStock(datos)
        case "mas-vendidos":
            return construirMasVendidos(datos, rango)
    }
}

export { resolverRango, formatRango } from "./fechas"
export { formatCelda, sufijoUnidad } from "./formato"
