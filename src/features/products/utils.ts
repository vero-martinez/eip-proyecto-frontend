/**
 * Utilidades del módulo Productos: resolución de nombres de
 * categorías, verificación de stock bajo y resumen de métricas
 * para las cards del dashboard.
 */

import { Category, Product } from "@/types/products"
import { toTitleCase } from "@/lib/utils"

/**
 * Obtiene el nombre de la categoría padre.
 */
export function getParentCategoryName(categoryId: number, categories: Category[]): string {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return "—"
    if (category.parentId === null) return toTitleCase(category.name)

    const parent = categories.find((c) => c.id === category.parentId)
    return parent ? toTitleCase(parent.name) : "—"
}

/**
 * Obtiene el nombre de la subcategoría.
 */
export function getSubcategoryName(categoryId: number, categories: Category[]): string {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return "—"
    if (category.parentId === null) return "—"

    return toTitleCase(category.name)
}

/**
 * Obtiene las categorías raíz (sin categoría padre).
 */
export function getRootCategories(categories: Category[]): Category[] {
    return categories.filter((c) => c.parentId === null)
}

/**
 * Obtiene las subcategorías de una categoría raíz.
 */
export function getSubcategories(categories: Category[], rootId: number): Category[] {
    return categories.filter((c) => c.parentId === rootId)
}

/**
 * Verifica si un producto pertenece a una categoría raíz, ya sea
 * directa o vía una de sus subcategorías.
 */
export function isProductInCategoryTree(
    product: Product,
    rootId: number,
    categories: Category[]
): boolean {
    if (product.categoryId === rootId) return true
    const category = categories.find((c) => c.id === product.categoryId)
    return category?.parentId === rootId
}

/**
 * Verifica si un producto tiene stock bajo.
 */
export function hasLowStock(product: Product): boolean {
    return product.isActive && product.currentStock <= product.minStockAlert
}

/**
 * Resumen de métricas del catálogo de productos, para las cards
 * de estadísticas. El valor de inventario usa el precio de venta.
 */
export function summarizeProducts(products: Product[]): {
    total: number
    active: number
    lowStock: number
    inactive: number
    inventoryValue: number
} {
    const total = products.length
    const active = products.filter((p) => p.isActive).length
    const lowStock = products.filter(hasLowStock).length
    const inactive = total - active
    const inventoryValue = products.reduce(
        (sum, p) => sum + p.salePrice * p.currentStock,
        0
    )

    return { total, active, lowStock, inactive, inventoryValue }
}