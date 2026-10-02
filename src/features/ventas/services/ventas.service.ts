/**
 * Servicio de Ventas (Punto de Venta).
 *
 * El backend recalcula los precios, consume el stock por FIFO y escribe el
 * ledger, así que el cliente solo arma el pedido y devuelve la venta que el
 * servidor confirma. El responsable se toma del usuario autenticado.
 */

import api from "@/lib/axios"
import { getSession } from "@/lib/session"

import type { Venta, VentaItem } from "../types"

/** El admin ve todas las ventas; el vendedor, solo las propias. */
export async function getVentasService(): Promise<Venta[]> {
    const esVendedor = getSession()?.usuario.rol === "vendedor"
    const { data } = await api.get<Venta[]>(esVendedor ? "/ventas/mias" : "/ventas")
    return data
}

/** Registra una venta en el punto de venta. */
export async function registerVentaService(data: {
    items: VentaItem[]
    tipoVenta: string
    metodoPago: string
    /** Ignorado: el backend usa el usuario autenticado. */
    responsable?: string
    pagoCon?: number
    /** Ignorado: el backend calcula el vuelto a partir del total. */
    vuelto?: number
}): Promise<Venta> {
    const body: {
        items: { productId: number; quantity: number }[]
        tipoVenta: string
        metodoPago: string
        pagoCon?: number
    } = {
        items: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
        })),
        tipoVenta: data.tipoVenta,
        metodoPago: data.metodoPago,
    }

    if (data.pagoCon !== undefined) {
        body.pagoCon = data.pagoCon
    }

    const { data: venta } = await api.post<Venta>("/ventas", body)
    return venta
}
