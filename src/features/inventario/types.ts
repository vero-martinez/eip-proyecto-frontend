/**
 * Tipos del módulo de Inventario.
 * Lotes, proveedores, entradas de stock y registro de movimientos.
 */

export type OrigenLote = "apertura" | "entrada" | "compra"

export interface Proveedor {
    id: number
    name: string
}

/** Snapshot del proveedor guardado en el lote. */
export type LoteProveedor = Pick<Proveedor, "id" | "name">

export interface LotesFilters {
    productId?: number
    origen?: OrigenLote
}

/** Datos requeridos para registrar un nuevo lote. */
export interface LoteRequest {
    productId: number
    cantidad: number
    origen: OrigenLote
    responsable: string
    costoUnitarioSoles?: number
    proveedor?: LoteProveedor
    codigo?: string
    fechaIngreso?: string
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

/** Detalle del descuento de inventario y costo por lote. */
export interface ConsumoDetalle {
    loteId: number
    cantidad: number
    costoUnitarioSoles: number
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

export type MovementType = "entrada" | "venta" | "merma"

/** Registro de movimientos de stock (entradas, ventas y mermas). */
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