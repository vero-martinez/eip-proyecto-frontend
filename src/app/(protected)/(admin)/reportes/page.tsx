"use client"

/**
 * Página de Reportes del administrador.
 *
 * Container: obtiene los datos con los hooks, resuelve el reporte activo y
 * reparte todo por props a los componentes presentacionales. Ningún
 * componente hijo lee estado global ni llama servicios.
 */

import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

import { ReportesDescargasRecientes } from "@/features/reportes/components/reportes-descargas-recientes"
import { ReportesEmptyState } from "@/features/reportes/components/reportes-empty-state"
import { ReportesFiltersBar } from "@/features/reportes/components/reportes-filters-bar"
import { ReportesPicker } from "@/features/reportes/components/reportes-picker"
import { ReportesStats } from "@/features/reportes/components/reportes-stats"
import { useExportReporte } from "@/features/reportes/hooks/use-export-reporte"
import { useReporte } from "@/features/reportes/hooks/use-reporte"
import { useReporteFilters } from "@/features/reportes/hooks/use-reporte-filters"
import { useReportesDatos } from "@/features/reportes/hooks/use-reportes-datos"
import { formatRango } from "@/features/reportes/utils"

export default function ReportesPage() {
    const {
        reporte,
        setReporte,
        preset,
        setPreset,
        desde,
        setDesde,
        hasta,
        setHasta,
        rangoPersonalizado,
        granularidad,
        setGranularidad,
        formato,
        setFormato,
        rango,
        snapshot,
    } = useReporteFilters()

    const { datos, isFetching, isError, refetch } = useReportesDatos()
    const reporteResuelto = useReporte(reporte, datos, rango, granularidad)
    const { isExporting, exportar, descargas } = useExportReporte()

    const granularidadVisible = reporte === "ventas-periodo"
    const tieneDatos = reporteResuelto.tabla.filas.length > 0

    if (isError) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        No se pudieron cargar los datos del reporte.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Ocurrió un problema al conectar con el servidor.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    className="mt-2 gap-2"
                >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Reintentar</span>
                </Button>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-4">
            <h1 className="sr-only">Reportes</h1>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">
                        {reporteResuelto.titulo}
                    </h2>
                    <p className="truncate text-xs text-muted-foreground">
                        {snapshot ? "Snapshot actual del inventario" : formatRango(rango)}
                        {isFetching && "\u00B7\u00B7\u00B7 actualizando..."}
                    </p>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Actualizar datos del reporte"
                    onClick={refetch}
                    disabled={isFetching}
                >
                    <RefreshCw
                        className={isFetching ? "size-4 animate-spin" : "size-4"}
                        aria-hidden="true"
                    />
                </Button>
            </div>

            {tieneDatos ? (
                <ReportesStats stats={reporteResuelto.stats} />
            ) : (
                <ReportesEmptyState
                    titulo="No hay datos para este reporte."
                    descripcion={
                        snapshot
                            ? "Todav\u00EDa no hay productos activos en el cat\u00E1logo."
                            : "Prob\u00E1 con un rango de fechas m\u00E1s amplio o eleg\u00ED otro reporte."
                    }
                />
            )}

            <ReportesFiltersBar
                snapshot={snapshot}
                granularidadVisible={granularidadVisible}
                preset={preset}
                onPresetChange={setPreset}
                desde={desde}
                onDesdeChange={setDesde}
                hasta={hasta}
                onHastaChange={setHasta}
                rangoPersonalizado={rangoPersonalizado}
                granularidad={granularidad}
                onGranularidadChange={setGranularidad}
                formato={formato}
                onFormatoChange={setFormato}
                onExportar={() =>
                    exportar(reporteResuelto, snapshot ? null : rango, formato)
                }
                isExporting={isExporting}
                tieneDatos={tieneDatos}
            />

            <ReportesPicker value={reporte} onChange={setReporte} />

            <ReportesDescargasRecientes descargas={descargas} />
        </main>
    )
}
