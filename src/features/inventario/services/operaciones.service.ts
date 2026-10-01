/**
 * Operaciones de Inventario.
 *
 * Comandos de alto nivel para registrar ingresos de producción y compras.
 * Cada operación delega en el backend la creación del lote, el recálculo del
 * costo promedio y el asiento en el ledger de movimientos.
 *
 * El responsable no se envía: el backend lo toma del usuario autenticado.
 */

import api from "@/lib/axios"

import { validarCantidadPositiva, validarCostoNoNegativo } from "../utils"

import type { StockEntry } from "../types"

/** Registra un ingreso producido por el taller sin alterar el costo promedio. */
export async function registrarEntradaProduccionService(data: {
    productId: number
    quantity: number
    /** Ignorado: el backend usa el usuario autenticado. */
    responsable?: string
    notas?: string
}): Promise<StockEntry> {
    const { data: entry } = await api.post<StockEntry>("/entradas", {
        productId: data.productId,
        quantity: validarCantidadPositiva(data.quantity),
        notas: data.notas ?? "Producción del taller",
    })
    return entry
}

/** Registra una compra a proveedor y recalcula el costo promedio del producto. */
export async function registrarCompraService(data: {
    productId: number
    quantity: number
    proveedorId?: number
    costoUnitarioSoles?: number
    /** Ignorado: el backend usa el usuario autenticado. */
    responsable?: string
    notas?: string
}): Promise<StockEntry> {
    const body: {
        productId: number
        quantity: number
        proveedorId?: number
        costoUnitarioSoles?: number
        notas?: string
    } = {
        productId: data.productId,
        quantity: validarCantidadPositiva(data.quantity),
    }

    if (data.proveedorId !== undefined) {
        body.proveedorId = data.proveedorId
    }
    if (data.costoUnitarioSoles !== undefined) {
        body.costoUnitarioSoles = validarCostoNoNegativo(data.costoUnitarioSoles)
    }

    const { data: entry } = await api.post<StockEntry>("/compras", {
        ...body,
        notas: data.notas ?? "Compra a proveedor",
    })
    return entry
}
