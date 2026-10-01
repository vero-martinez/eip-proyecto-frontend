/**
 * Tipos del módulo de Inventario.
 * Lotes, entradas de stock y registro de movimientos.
 */

import type { Proveedor } from "@/features/proveedores/types"

export type OrigenLote = "apertura" | "entrada" | "compra" | "importacion"

/** Snapshot del proveedor guardado en el lote. */
export type LoteProveedor = Pick<Proveedor, "id" | "name">

export interface LotesFilters {
    productId?: number
    origen?: OrigenLote
}

/** Representación de un lote guardado en el sistema. */
export interface Lote {
    id: number
    productId: number
    codigo?: string
    origen: OrigenLote
    cantidadInicial: number
    cantidadDisponible: number
    costoUnitarioSoles: number
    proveedor?: LoteProveedor
    responsable: string
    fechaIngreso: string
}

/** Registro de ingreso de producto al inventario. */
export interface StockEntry {
    id: number
    productId: number
    quantity: number
    createdAt: string
    proveedorId?: number
    responsable?: string
}

export type MovementType =
    | "entrada"
    | "venta"
    | "merma"
    | "importacion"
    | "exportacion"

/** Registro de movimientos de stock (entradas, ventas, mermas y comercio exterior). */
export interface MovementRecord {
    id: number
    productId: number
    responsable: string
    movementType: MovementType
    quantity: number
    createdAt: string
    reason?: string
    unitSoldPrice?: number
    unitCostPrice?: number
    wasteType?: string
    saleGroupId?: number
    proveedor?: string
    folio?: string
    unitPriceUSD?: number
    tipoCambio?: number
}