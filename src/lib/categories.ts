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
        surface: "bg-violet-400 dark:bg-violet-950/50",
        icon: "text-violet-600 dark:text-violet-400",
        badge: "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    },
    pink: {
        surface: "bg-pink-300 dark:bg-pink-950/50",
        icon: "text-pink-500 dark:text-pink-400",
        badge: "border-pink-300 bg-pink-100 text-pink-700 dark:border-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    },
    zinc: {
        surface: "bg-zinc-200 dark:bg-zinc-800/60",
        icon: "text-zinc-500 dark:text-zinc-300",
        badge: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
    },
    fuchsia: {
        surface: "bg-fuchsia-300 dark:bg-fuchsia-950/50",
        icon: "text-fuchsia-500 dark:text-fuchsia-400",
        badge: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700 dark:border-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
    },
    yellow: {
        surface: "bg-yellow-200 dark:bg-yellow-950/50",
        icon: "text-yellow-600 dark:text-yellow-300",
        badge: "border-yellow-300 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
    },
    indigo: {
        surface: "bg-indigo-400 dark:bg-indigo-950/50",
        icon: "text-indigo-600 dark:text-indigo-400",
        badge: "border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    },
}