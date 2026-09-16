/**
 * Hook con el estado de filtros y ordenamiento de la tabla de
 * productos. Centraliza el estado local (búsqueda, categoría raíz,
 * subcategoría, estado, orden) y deriva la lista filtrada y ordenada.
 */

import { useState, useMemo } from "react"
import { ColumnFiltersState } from "@tanstack/react-table"

import { isProductInCategoryTree } from "../utils"
import type { StatusFilter, SortBy } from "../types"
import type { Product, Category } from "@/types/products"

export function useProductFilters(products: Product[], categories: Category[]) {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [rootCategoryId, setRootCategoryId] = useState("all")
    const [subcategoryId, setSubcategoryId] = useState("all")
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
    const [sortBy, setSortBy] = useState<SortBy>("newest")

    const filteredProducts = useMemo(() => {
        let result = products

        if (rootCategoryId !== "all") {
            const rootId = Number(rootCategoryId)

            if (subcategoryId !== "all") {
                const subId = Number(subcategoryId)
                result = result.filter((p) => p.categoryId === subId)
            } else {
                result = result.filter((p) =>
                    isProductInCategoryTree(p, rootId, categories)
                )
            }
        }

        if (statusFilter === "active") {
            result = result.filter((p) => p.isActive)
        } else if (statusFilter === "inactive") {
            result = result.filter((p) => !p.isActive)
        }

        result = [...result].sort((a, b) =>
            sortBy === "newest"
                ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )

        return result
    }, [products, categories, rootCategoryId, subcategoryId, statusFilter, sortBy])

    const hasActiveFilters =
        columnFilters.some((f) => typeof f.value === "string" && f.value !== "") ||
        rootCategoryId !== "all" ||
        statusFilter !== "all" ||
        sortBy !== "newest"

    const clearFilters = () => {
        setColumnFilters([])
        setRootCategoryId("all")
        setSubcategoryId("all")
        setStatusFilter("all")
        setSortBy("newest")
    }

    return {
        columnFilters,
        setColumnFilters,
        rootCategoryId,
        setRootCategoryId,
        subcategoryId,
        setSubcategoryId,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        filteredProducts,
        hasActiveFilters,
        clearFilters,
    }
}