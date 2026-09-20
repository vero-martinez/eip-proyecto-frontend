"use client"

/**
 * Barra de herramientas del Punto de Venta: búsqueda, filtros y escáner.
 */

import { ScanBarcode, Search, X } from "lucide-react"

import { ClearFiltersButton } from "@/components/common/clear-filters-button"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"

import {
    getCategoryOptions,
    getRootCategories,
    getSubcategories,
} from "@/features/products/utils"
import type { Category } from "@/types/products"

interface PosToolbarProps {
    categories: Category[]
    search: string
    rootCategoryId: string
    subcategoryId: string
    totalCount: number
    hasActiveFilters: boolean
    onSearchChange: (value: string) => void
    onRootCategoryChange: (id: string) => void
    onSubcategoryChange: (id: string) => void
    onClearFilters: () => void
    onScan: () => void
}

export function PosToolbar({
    categories,
    search,
    rootCategoryId,
    subcategoryId,
    totalCount,
    hasActiveFilters,
    onSearchChange,
    onRootCategoryChange,
    onSubcategoryChange,
    onClearFilters,
    onScan,
}: PosToolbarProps) {
    const rootCategories = getRootCategories(categories)
    const selectedRoot = rootCategories.find(
        (cat) => cat.id === Number(rootCategoryId)
    )
    const subcategories = selectedRoot
        ? getSubcategories(categories, selectedRoot.id)
        : []

    return (
        <div className="flex flex-wrap items-center gap-2.5">
            {/* Búsqueda por nombre o SKU */}
            <InputGroup className="w-full sm:w-64">
                <InputGroupAddon align="inline-start">
                    <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                    placeholder="Buscar por nombre o código..."
                    aria-label="Buscar productos"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
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

            {/* Filtro de categoría */}
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
                triggerClassName="w-full sm:w-52"
            />

            {/* Filtro de subcategoría */}
            {selectedRoot && (
                <SearchableSelect
                    value={subcategoryId}
                    onValueChange={onSubcategoryChange}
                    options={[
                        { value: "all", label: "Todas las subcategorías" },
                        ...getCategoryOptions(subcategories),
                    ]}
                    placeholder="Todas las subcategorías"
                    searchPlaceholder="Buscar subcategoría..."
                    ariaLabel="Filtrar por subcategoría"
                    triggerClassName="w-full sm:w-48"
                />
            )}

            {/* Contador de resultados */}
            <Badge variant="secondary" className="px-2.5 py-1 text-xs font-medium">
                {totalCount} {totalCount === 1 ? "producto" : "productos"}
            </Badge>

            {hasActiveFilters && <ClearFiltersButton onClick={onClearFilters} />}

            {/* Botón de escáner */}
            <Button
                type="button"
                variant="outline"
                onClick={onScan}
                className="ml-auto gap-2"
            >
                <ScanBarcode className="size-4" aria-hidden="true" />
                <span>Escanear</span>
            </Button>
        </div>
    )
}