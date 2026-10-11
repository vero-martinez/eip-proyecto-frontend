/**
 * Hook con el estado de los filtros de la página de Reportes: reporte
 * activo, rango de fechas, granularidad de "Ventas por periodo" y formato
 * de exportación.
 *
 * El rango vive en estado local →igual que el filtro de Movimientos→ porque
 * no necesita ser enlazable ni compartible por URL. Los campos de fecha
 * siempre reflejan el rango resuelto, así que al cambiar de preset se
 * actualizan solos y el usuario ve qué periodo tiene seleccionado.
 */

import { useMemo, useState } from "react"

import {
    FORMATO_POR_DEFECTO,
    PRESET_RANGO_POR_DEFECTO,
    REPORTE_ITEMS,
    REPORTE_POR_DEFECTO,
} from "../constants"
import type {
    FormatoReporte,
    Granularidad,
    PresetRango,
    ReporteId,
} from "../types"
import { resolverRango } from "../utils"

const RANGO_INICIAL = resolverRango(PRESET_RANGO_POR_DEFECTO, "", "")

export function useReporteFilters() {
    const [reporte, setReporte] = useState<ReporteId>(REPORTE_POR_DEFECTO)
    const [preset, setPreset] = useState<PresetRango>(PRESET_RANGO_POR_DEFECTO)
    const [desde, setDesdeState] = useState(RANGO_INICIAL.desde)
    const [hasta, setHastaState] = useState(RANGO_INICIAL.hasta)
    const [granularidad, setGranularidad] = useState<Granularidad>("dia")
    const [formato, setFormato] = useState<FormatoReporte>(FORMATO_POR_DEFECTO)

    const rango = useMemo(
        () => resolverRango(preset, desde, hasta),
        [preset, desde, hasta]
    )

    /** Stock actual es un snapshot del presente: no depende del rango. */
    const snapshot =
        REPORTE_ITEMS.find((item) => item.value === reporte)?.snapshot ?? false

    /** Cambiar de preset recalcula los campos de fecha visibles. */
    const cambiarPreset = (value: PresetRango) => {
        setPreset(value)
        if (value === "personalizado") return
        const siguiente = resolverRango(value, "", "")
        setDesdeState(siguiente.desde)
        setHastaState(siguiente.hasta)
    }

    /** Escribir una fecha a mano implica un rango personalizado. */
    const setDesde = (value: string) => {
        setPreset("personalizado")
        setDesdeState(value)
    }

    const setHasta = (value: string) => {
        setPreset("personalizado")
        setHastaState(value)
    }

    return {
        reporte,
        setReporte,
        preset,
        setPreset: cambiarPreset,
        desde,
        setDesde,
        hasta,
        setHasta,
        granularidad,
        setGranularidad,
        formato,
        setFormato,
        rango,
        snapshot,
        /** Los campos de fecha solo se editan en modo personalizado. */
        rangoPersonalizado: preset === "personalizado",
    }
}
