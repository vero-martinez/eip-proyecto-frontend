/**
 * Tipos para el módulo de Entradas de stock.
 */

/**
 * Proveedor asociado a un ingreso de stock.
 */
export interface Proveedor {
    id: number
    name: string
}

/**
 * Registro de ingreso de producto al inventario.
 */
export interface StockEntry {
    id: number
    productId: number
    quantity: number
    createdAt: string
    proveedorId?: number
    /** Nombre de la persona que registró la entrada. */
    responsable?: string
}