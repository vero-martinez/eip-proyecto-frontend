/**
 * Utilidades del módulo Productos: resolución de nombres de
 * categorías, verificación de stock bajo y resumen de métricas
 * para las cards del dashboard.
 */

import { Category, Product, UnitType } from "@/types/products"
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
 * Obtiene el id de la categoría raíz de una categoría dada
 * (ella misma si es raíz, o su padre).
 */
export function getRootCategoryId(
    categories: Category[],
    categoryId: number | undefined
): number | undefined {
    if (categoryId === undefined) return undefined
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return undefined
    return category.parentId ?? category.id
}

/**
 * Opciones {value,label} para los selects de categorías, con el
 * nombre normalizado (fuente única de labels para filtros y form).
 */
export function getCategoryOptions(categories: Category[]): {
    value: string
    label: string
}[] {
    return categories.map((category) => ({
        value: String(category.id),
        label: toTitleCase(category.name),
    }))
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
 * Catálogo de unidades de medida: fuente única para los labels (UI)
 * y los símbolos usados al formatear el stock.
 */
export const UNIT_OPTIONS: {
    value: UnitType
    label: string
    symbol: string
}[] = [
    { value: "UNIDAD", label: "Unidad", symbol: "u" },
    { value: "KILOGRAMO", label: "Kilogramo", symbol: "kg" },
]

/**
 * Formatea el stock actual de un producto con su unidad (ej. "3 u").
 */
export function formatStock(product: Product): string {
    const unit = UNIT_OPTIONS.find((option) => option.value === product.unitType)
    return `${product.currentStock} ${unit?.symbol ?? product.unitType}`
}

/**
 * Formatea el conteo de productos con pluralización (ej. "5 productos").
 */
export function formatProductCount(count: number): string {
    return `${count} producto${count !== 1 ? "s" : ""}`
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