/**
 * Servicio de Mermas.
 *
 * Registra mermas contra el backend, que consume el stock aplicando FIFO
 * y escribe el movimiento en el ledger. Si el stock no alcanza, el backend
 * responde 409 y la merma no se registra.
 */

import api from "@/lib/axios"

import type { MermaFormData } from "../schemas"
import type { Merma } from "../types"

/** Motivos que admite el backend, derivados de las constantes del módulo. */
export type MotivoMerma = MermaFormData["motivo"]

/** Obtiene las mermas, de la más reciente a la más antigua. */
export async function getMermasService(): Promise<Merma[]> {
    const { data } = await api.get<Merma[]>("/mermas")
    return data
}

/** Registra una merma consumiendo el stock del producto. */
export async function registerMermaService(data: {
    productId: number
    quantity: number
    motivo: MotivoMerma
    detalle?: string
    /** Ignorado: el backend usa el usuario autenticado. */
    responsable?: string
}): Promise<Merma> {
    const body: {
        productId: number
        quantity: number
        motivo: MotivoMerma
        detalle?: string
    } = {
        productId: data.productId,
        quantity: data.quantity,
        motivo: data.motivo,
    }

    if (data.detalle !== undefined) {
        body.detalle = data.detalle
    }

    const { data: merma } = await api.post<Merma>("/mermas", body)
    return merma
}
