/**
 * Servicio de Comercio Exterior.
 *
 * Registra operaciones de importación y exportación contra el backend, que
 * impacta el inventario: la importación crea lotes y la exportación consume
 * stock por FIFO. Los totales y el folio los calcula el servidor.
 */

import api from "@/lib/axios"

import type { OperacionCreateSchema } from "../schemas/operacionCreateSchema"

import type { OperacionComercioExterior, SocioComercial } from "../types"

/** Lista las operaciones, de la fecha más reciente a la más antigua. */
export async function getOperacionesService(): Promise<
    OperacionComercioExterior[]
> {
    const { data } = await api.get<OperacionComercioExterior[]>(
        "/comercio-exterior/operaciones"
    )
    return data
}

/** Registra una operación de importación o exportación. */
export async function registrarOperacionService(
    data: OperacionCreateSchema
): Promise<OperacionComercioExterior> {
    const body: {
        fecha: string
        tipo: OperacionCreateSchema["tipo"]
        socioComercialId: number
        tipoCambio: number
        incoterm?: string
        medioTransporte?: string
        notas?: string
        lineas: { productoId: number; cantidad: number; precioUSD: number }[]
    } = {
        fecha: data.fecha,
        tipo: data.tipo,
        socioComercialId: data.socioComercialId,
        tipoCambio: data.tipoCambio,
        lineas: data.lineas.map((linea) => ({
            productoId: linea.productoId,
            cantidad: linea.cantidad,
            precioUSD: linea.precioUSD,
        })),
    }

    if (data.incoterm !== undefined) body.incoterm = data.incoterm
    if (data.medioTransporte !== undefined) {
        body.medioTransporte = data.medioTransporte
    }
    if (data.notas) body.notas = data.notas

    const { data: operacion } = await api.post<OperacionComercioExterior>(
        "/comercio-exterior/operaciones",
        body
    )
    return operacion
}

/** Lista los socios comerciales internacionales registrados. */
export async function getSociosComercialesService(): Promise<SocioComercial[]> {
    const { data } = await api.get<SocioComercial[]>(
        "/comercio-exterior/socios-comerciales"
    )
    return data
}