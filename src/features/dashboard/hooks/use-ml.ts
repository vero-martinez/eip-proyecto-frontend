"use client"

import { useState } from "react"

import api from "@/lib/axios"

import { predecirConModelo } from "../services/ml.service"
import type {
    PrediccionMLResponse,
    SemanaHistorialML,
} from "../services/ml.service"
import type { PronosticoProducto } from "../types"

interface DemandaSemanal {
    productId: number
    semana: string
    unidades: number
    origen?: "real" | "simulado"
}

interface DemandaSemanalResponse {
    semanas: DemandaSemanal[]
}

export type EstadoML = "inicial" | "cargando" | "modelo" | "error"

export type OrigenHistorialML = "real" | "simulado" | "mixto"

export interface RecomendacionML {
    unidades: number
    semanaObjetivo: string
    probabilidad: number
    version: string
    fechaHora: string
    origen: "modelo"
    origenHistorial: OrigenHistorialML
    semanasBase: number
    intervaloInferior: number | null
    intervaloSuperior: number | null
    nivelConfianza: number | null
    coberturaConfianza: number | null
    metodoConfianza: string | null
}

function aISO(fecha: Date): string {
    return [
        fecha.getUTCFullYear(),
        String(fecha.getUTCMonth() + 1).padStart(2, "0"),
        String(fecha.getUTCDate()).padStart(2, "0"),
    ].join("-")
}

function siguienteLunes(fechaISO: string): string {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return fechaISO

    const fecha = new Date(`${fechaISO}T00:00:00Z`)
    if (Number.isNaN(fecha.getTime())) return fechaISO

    const dia = fecha.getUTCDay()
    const desplazamiento = dia === 1 ? 7 : (8 - dia) % 7
    fecha.setUTCDate(fecha.getUTCDate() + desplazamiento)
    return aISO(fecha)
}

function resolverOrigenHistorial(
    historial: SemanaHistorialML[]
): OrigenHistorialML {
    const origenes = new Set(
        historial.map((item) => item.origen ?? "simulado")
    )
    if (origenes.size > 1) return "mixto"
    return origenes.has("real") ? "real" : "simulado"
}

function normalizarHistorial(
    semanas: DemandaSemanal[],
    productId: number
): SemanaHistorialML[] {
    return semanas
        .filter((item) => Number(item.productId) === productId)
        .map((item) => ({
            semana: String(item.semana).slice(0, 10),
            unidades: Number(item.unidades),
            origen: item.origen ?? "simulado",
        }))
        .filter(
            (item) =>
                /^\d{4}-\d{2}-\d{2}$/.test(item.semana) &&
                Number.isFinite(item.unidades)
        )
        .sort((a, b) => a.semana.localeCompare(b.semana))
}

export function usePrediccionML() {
    const [estado, setEstado] = useState<EstadoML>("inicial")
    const [recomendacion, setRecomendacion] = useState<RecomendacionML | null>(null)
    const [mensajeError, setMensajeError] = useState<string | null>(null)

    async function consultar(producto: PronosticoProducto): Promise<void> {
        setEstado("cargando")
        setRecomendacion(null)
        setMensajeError(null)

        try {
            const { data } = await api.get<DemandaSemanalResponse>(
                "/analitica/demanda/semanal",
                { params: { product_id: producto.productId } }
            )
            const historial = normalizarHistorial(
                data?.semanas ?? [],
                producto.productId
            )
            const ultima = historial[historial.length - 1]?.semana
            const semanaObjetivo = ultima ? siguienteLunes(ultima) : ""

            if (historial.length < 2 || !semanaObjetivo) {
                setMensajeError(
                    "No hay suficiente historial para calcular una recomendación."
                )
                setRecomendacion(null)
                setEstado("error")
                return
            }

            const origenHistorial = resolverOrigenHistorial(historial)
            const respuesta: PrediccionMLResponse = await predecirConModelo({
                productId: producto.productId,
                unitType: producto.unitType,
                semanaObjetivo,
                historialSemanas: historial,
            })

            setRecomendacion({
                unidades: respuesta.unidadesPredichas,
                semanaObjetivo: respuesta.semanaObjetivo || semanaObjetivo,
                probabilidad: respuesta.probabilidad,
                version: respuesta.version,
                fechaHora: respuesta.fechaHora,
                origen: "modelo",
                origenHistorial,
                semanasBase: historial.length,
                intervaloInferior: respuesta.intervaloInferior ?? null,
                intervaloSuperior: respuesta.intervaloSuperior ?? null,
                nivelConfianza: respuesta.nivelConfianza ?? null,
                coberturaConfianza: respuesta.coberturaConfianza ?? null,
                metodoConfianza: respuesta.metodoConfianza ?? null,
            })
            setEstado("modelo")
        } catch {
            setMensajeError("No se pudo calcular la recomendación con el modelo del servidor.")
            setRecomendacion(null)
            setEstado("error")
        }
    }

    function reiniciar(): void {
        setEstado("inicial")
        setRecomendacion(null)
        setMensajeError(null)
    }

    return {
        estado,
        recomendacion,
        mensajeError,
        consultar,
        reiniciar,
    }
}
