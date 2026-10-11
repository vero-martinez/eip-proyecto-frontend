/**
 * Utilidades del módulo de Categorías.
 * Manejo de jerarquía (raíz/subcategorías), opciones de UI y estilos de color.
 */

import type { Category, Product } from "@/types/products"
import { toTitleCase } from "@/lib/utils"

/** Obtiene el nombre de la categoría padre. */
export function getParentCategoryName(categoryId: number, categories: Category[]): string {
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return "—"
    if (category.parentId === null) return toTitleCase(category.name)

    const parent = categories.find((c) => c.id === category.parentId)
    return parent ? toTitleCase(parent.name) : "—"
}

/** Obtiene el nombre de la subcategoría. */
export function getSubcategoryName(categoryId: number, categories: Category[]): string {
    const category = categories.find((c) => c.id === categoryId)
    if (!category || category.parentId === null) return "—"

    return toTitleCase(category.name)
}

/** Retorna las categorías raíz (sin categoría padre). */
export function getRootCategories(categories: Category[]): Category[] {
    return categories.filter((c) => c.parentId === null)
}

/** Retorna las subcategorías asociadas a una categoría raíz. */
export function getSubcategories(categories: Category[], rootId: number): Category[] {
    return categories.filter((c) => c.parentId === rootId)
}

/** Obtiene el ID de la categoría raíz correspondiente. */
export function getRootCategoryId(
    categories: Category[],
    categoryId: number | undefined
): number | undefined {
    if (categoryId === undefined) return undefined
    const category = categories.find((c) => c.id === categoryId)
    if (!category) return undefined
    return category.parentId ?? category.id
}

/** Mapea las categorías a formato {value, label} para selectores. */
export function getCategoryOptions(categories: Category[]): {
    value: string
    label: string
}[] {
    return categories.map((category) => ({
        value: String(category.id),
        label: toTitleCase(category.name),
    }))
}

/** Verifica si un producto pertenece al árbol de una categoría raíz. */
export function isProductInCategoryTree(
    product: Product,
    rootId: number,
    categories: Category[]
): boolean {
    if (product.categoryId === rootId) return true
    const category = categories.find((c) => c.id === product.categoryId)
    return category?.parentId === rootId
}

export type CategoryTone =
    | "violet"
    | "pink"
    | "zinc"
    | "fuchsia"
    | "yellow"
    | "indigo"

const CATEGORY_TONES: CategoryTone[] = [
    "violet",
    "pink",
    "zinc",
    "fuchsia",
    "yellow",
    "indigo",
]

/** Retorna un tono de color asignado a la categoría raíz. */
export function getCategoryTone(rootId: number | undefined): CategoryTone {
    if (rootId === undefined) return "zinc"
    return CATEGORY_TONES[Math.abs(rootId) % CATEGORY_TONES.length]
}

/** Clases de Tailwind asociadas a cada tono para elementos visuales. */
export const CATEGORY_TONE_CLASSES: Record<
    CategoryTone,
    { surface: string; icon: string; badge: string }
> = {
    violet: {
        surface: "bg-cat-1/15",
        icon: "text-cat-1",
        badge: "border-cat-1/40 bg-cat-1/15 text-cat-1",
    },
    pink: {
        surface: "bg-cat-2/15",
        icon: "text-cat-2",
        badge: "border-cat-2/40 bg-cat-2/15 text-cat-2",
    },
    zinc: {
        surface: "bg-cat-3/15",
        icon: "text-cat-3",
        badge: "border-cat-3/40 bg-cat-3/15 text-cat-3",
    },
    fuchsia: {
        surface: "bg-cat-4/15",
        icon: "text-cat-4",
        badge: "border-cat-4/40 bg-cat-4/15 text-cat-4",
    },
    yellow: {
        surface: "bg-cat-5/15",
        icon: "text-cat-5",
        badge: "border-cat-5/40 bg-cat-5/15 text-cat-5",
    },
    indigo: {
        surface: "bg-cat-6/15",
        icon: "text-cat-6",
        badge: "border-cat-6/40 bg-cat-6/15 text-cat-6",
    },
}