"use client"

/**
 * Filtros del catálogo: búsqueda, categoría (con búsqueda),
 * subcategoría (dependiente de la categoría elegida), orden y botón
 * de limpiar. Componente presentacional: recibe el valor y los
 * callbacks desde CatalogView. No incluye filtro de estado porque el
 * catálogo solo muestra productos activos.
 */

import { Search, X } from "lucide-react"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { SearchableSelect } from "@/components/common/searchable-select"
import { ClearFiltersButton } from "@/components/common/clear-filters-button"

import {
    CATALOG_SORT_OPTIONS,
} from "../utils"
import {
    getCategoryOptions,
    getRootCategories,
    getSubcategories,
} from "@/lib/categories"
import type { CatalogSort } from "../types"
import type { Category } from "@/types/products"

interface CatalogFiltersProps {
    categories: Category[]
    search: string
    rootCategoryId: string
    subcategoryId: string
    sortBy: CatalogSort
    onSearchChange: (value: string) => void
    onRootCategoryChange: (id: string) => void
    onSubcategoryChange: (id: string) => void
    onSortChange: (value: CatalogSort) => void
    hasActiveFilters: boolean
    onClearFilters: () => void
}

export function CatalogFilters({
    categories,
    search,
    rootCategoryId,
    subcategoryId,
    sortBy,
    onSearchChange,
    onRootCategoryChange,
    onSubcategoryChange,
    onSortChange,
    hasActiveFilters,
    onClearFilters,
}: CatalogFiltersProps) {
    const rootCategories = getRootCategories(categories)
    const selectedRoot = rootCategories.find(
        (category) => category.id === Number(rootCategoryId)
    )
    const subcategories = selectedRoot
        ? getSubcategories(categories, selectedRoot.id)
        : []

    const sortItems = Object.fromEntries(
        CATALOG_SORT_OPTIONS.map((option) => [option.value, option.label])
    )

    return (
        <div className="flex flex-wrap items-center gap-3 sm:gap-2">
            <InputGroup className="w-full border-border bg-white shadow-sm sm:w-60 dark:bg-input/30">
                <InputGroupAddon align="inline-start">
                    <Search className="size-4 text-primary" aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                    placeholder="Buscar por nombre o código..."
                    aria-label="Buscar productos"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
                {search && (
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            size="icon-xs"
                            aria-label="Limpiar búsqueda"
                            onClick={() => onSearchChange("")}
                        >
                            <X className="size-3.5" />
                        </InputGroupButton>
                    </InputGroupAddon>
                )}
            </InputGroup>

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
                triggerClassName=" w-full sm:w-54 bg-primary/30 shadow-sm hover:bg-primary/40"
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
                    triggerClassName="w-full sm:w-44 bg-primary/30 shadow-sm hover:bg-primary/40"
                />
            )}

            <Select
                value={sortBy}
                onValueChange={(value) =>
                    onSortChange((value ?? "recent") as CatalogSort)
                }
                items={sortItems}
            >
                <SelectTrigger
                    className="w-full sm:w-48 border-border bg-primary/30 shadow-sm"
                    aria-label="Ordenar catálogo"
                >
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {CATALOG_SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <ClearFiltersButton onClick={onClearFilters} />
            )}
        </div>
    )
}
