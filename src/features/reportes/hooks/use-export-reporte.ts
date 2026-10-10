/**
 * Hook que dispara la descarga del reporte y gestiona el estado de la
 * exportación (para el spinner del botón) junto con los avisos al usuario.
 */

import { useState } from "react"
import { toast } from "sonner"

import { useDescargasRecientes } from "./use-descargas-recientes"
import { descargarReporte } from "../services/reportes-export.service"
import type { FormatoReporte, RangoFechas, ReporteResuelto } from "../types"

/** Extrae el mensaje de error para las notificaciones. */
function getErrorMessage(error: unknown, fallbackMessage: string): string {
    return error instanceof Error ? error.message : fallbackMessage
}

export function useExportReporte() {
    const [isExporting, setIsExporting] = useState(false)
    const { descargas, registrar } = useDescargasRecientes()

    async function exportar(
        reporte: ReporteResuelto,
        rango: RangoFechas | null,
        formato: FormatoReporte
    ): Promise<void> {
        if (isExporting) return
        setIsExporting(true)

        try {
            const nombre = await descargarReporte(reporte, rango, formato)
            registrar(nombre)
            toast.success("Reporte descargado", { description: nombre })
        } catch (error) {
            toast.error("No se pudo generar el archivo", {
                description: getErrorMessage(
                    error,
                    "Intentá de nuevo o probá con otro formato."
                ),
            })
        } finally {
            setIsExporting(false)
        }
    }

    return { isExporting, exportar, descargas }
}
