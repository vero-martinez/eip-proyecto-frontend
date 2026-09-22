/**
 * Tipos de Producto y Categoría compartidos entre los módulos
 * de Productos y Catálogo.
 */

export interface Category {
    id: number
    parentId: number | null
    name: string
    description: string | null
}

export type UnitType = "UNIDAD" | "KILOGRAMO"

export type ProductStatus = "activo" | "inactivo"

export interface Product {
    id: number
    categoryId: number
    sku: string
    name: string
    unitType: UnitType
    salePrice: number
    costPrice: number
    currentStock: number
    minStockAlert: number
    isActive: boolean
    /** Proveedor nacional por defecto (compra/apertura). */
    proveedorId?: number
    createdAt: string
}