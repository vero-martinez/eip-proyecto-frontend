/**
 * Hook que agrega las listas crudas en el reporte activo.
 *
 * El trabajo pesado vive en `construirReporte` (funciones puras); este hook
 * solo memoriza el resultado para no volver a recorrer el ledger cada vez que
 * se repinta la página.
 */

import { useMemo } from "react"

import type { DatosReportes, Granularidad, RangoFechas, ReporteId } from "../types"
import { construirReporte } from "../utils"

export function useReporte(
    reporte: ReporteId,
    datos: DatosReportes,
    rango: RangoFechas,
    granularidad: Granularidad
) {
    return useMemo(
        () => construirReporte(reporte, datos, rango, granularidad),
        [reporte, datos, rango, granularidad]
    )
}
