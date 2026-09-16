"use client"

/**
 * Filtros de la tabla de productos: categoría (con búsqueda),
 * subcategoría (dependiente de la categoría elegida), estado y
 * orden por fecha. Componente presentacional: recibe el valor y
 * los callbacks desde el padre (ProductsTable).
 */

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SearchableSelect } from "@/components/common/searchable-select"
import { getCategoryOptions, getRootCategories, getSubcategories } from "../utils"
import type { Category } from "@/types/products"
import type { StatusFilter, SortBy } from "../types"

interface ProductFiltersProps {
    categories: Category[]
    rootCategoryId: string
    subcategoryId: string
    statusFilter: StatusFilter
    sortBy: SortBy
    onRootCategoryChange: (id: string) => void
    onSubcategoryChange: (id: string) => void
    onStatusChange: (value: StatusFilter) => void
    onSortChange: (value: SortBy) => void
}

export function ProductFilters({
    categories,
    rootCategoryId,
    subcategoryId,
    statusFilter,
    sortBy,
    onRootCategoryChange,
    onSubcategoryChange,
    onStatusChange,
    onSortChange,
}: ProductFiltersProps) {
    const rootCategories = getRootCategories(categories)
    const selectedRoot = rootCategories.find((c) => c.id === Number(rootCategoryId))
    const subcategories = selectedRoot
        ? getSubcategories(categories, selectedRoot.id)
        : []

    return (
        <div className="flex flex-wrap items-center gap-2">
            <SearchableSelect
                value={rootCategoryId}
                onValueChange={(id) => {
                    onRootCategoryChange(id)
                    onSubcategoryChange("all")
                }}
                options={[
                    { value: "all", label: "Todas las categorías" },
                    ...getCategoryOptions(rootCategories),
                ]}
                placeholder="Todas las categorías"
                searchPlaceholder="Buscar categoría..."
                ariaLabel="Filtrar por categoría"
                triggerClassName="w-60 bg-primary/30 shadow-sm hover:bg-primary/40"
            />

            {selectedRoot && (
                <SearchableSelect
                    value={subcategoryId}
                    onValueChange={onSubcategoryChange}
                    options={[
                        { value: "all", label: "Todas" },
                        ...getCategoryOptions(subcategories),
                    ]}
                    placeholder="Todas"
                    searchPlaceholder="Buscar subcategoría..."
                    ariaLabel="Filtrar por subcategoría"
                    triggerClassName="w-44 bg-primary/30 shadow-sm hover:bg-primary/40"
                />
            )}

            <Select
                value={statusFilter}
                onValueChange={(value) => onStatusChange((value ?? "all") as StatusFilter)}
                items={{ all: "Estados", active: "Activos", inactive: "Inactivos" }}
            >
                <SelectTrigger className="w-32 border-border bg-primary/30 shadow-sm" aria-label="Filtrar por estado">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Estados</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
            </Select>

            <Select
                value={sortBy}
                onValueChange={(value) => onSortChange((value ?? "newest") as SortBy)}
                items={{ newest: "Más recientes", oldest: "Más antiguos" }}
            >
                <SelectTrigger className="w-36 border-border bg-primary/30 shadow-sm" aria-label="Ordenar productos">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="oldest">Más antiguos</SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}