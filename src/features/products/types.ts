/**
 * Tipos de estado de filtros y ordenamiento del módulo Productos.
 */

export type StatusFilter = "all" | "active" | "inactive"
export type SortBy = "newest" | "oldest" | "low-stock"

/** Criterios de orden del catálogo (solo consulta). */
export type CatalogSort =
    | "recent"
    | "oldest"
    | "price-asc"
    | "price-desc"