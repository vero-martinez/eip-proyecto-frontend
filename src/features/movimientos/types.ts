/**
 * Tipos de la vista "Movimientos" (feature hoja del ledger).
 * Los tipos crudos del ledger viven en el core de inventario.
 */

import type { UnitType } from "@/types/products"
import type { MovementRecord } from "@/features/inventario/types"

export type { MovementRecord, MovementType } from "@/features/inventario/types"

export interface InventoryMovement extends MovementRecord {
    productName: string
    sku: string
    unitType: UnitType
    tipoVenta?: string
    folio?: string
}