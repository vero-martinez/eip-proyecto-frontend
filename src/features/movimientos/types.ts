/**
 * Tipos e interfaces de datos para el módulo de Movimientos de Inventario.
 */

import type { UnitType } from "@/types/products"

export type MovementType = "entrada" | "venta" | "merma"

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
}

export interface InventoryMovement extends MovementRecord {
    productName: string
    sku: string
    unitType: UnitType
    tipoVenta?: string
    folio?: string
}