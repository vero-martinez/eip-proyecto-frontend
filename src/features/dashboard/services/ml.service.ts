import api from "@/lib/axios"
import type { UnitType } from "@/types/products"

export interface SemanaHistorialML {
    semana: string
    unidades: number
    origen?: "real" | "simulado"
}

export interface PrediccionMLRequest {
    productId: number
    unitType: UnitType
    semanaObjetivo: string
    historialSemanas: SemanaHistorialML[]
}

export interface PrediccionMLResponse {
    productId: number
    unitType: UnitType
    semanaObjetivo: string
    unidadesPredichas: number
    probabilidad: number
    version: string
    fechaHora: string
    origen: "modelo"
    intervaloInferior?: number | null
    intervaloSuperior?: number | null
    nivelConfianza?: number | null
    coberturaConfianza?: number | null
    metodoConfianza?: string | null
}

export async function predecirConModelo(
    payload: PrediccionMLRequest
): Promise<PrediccionMLResponse> {
    const { data } = await api.post<PrediccionMLResponse>(
        "/analitica/modelo/predecir",
        payload
    )
    return data
}
