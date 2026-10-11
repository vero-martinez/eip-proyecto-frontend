/**
 * Hook personalizado para manejar los filtros, ordenamiento y paginación
 * de la tabla de productos.
 */

import { useMemo, useState } from "react"

import { isProductInCategoryTree } from "@/lib/categories"
import { hasLowStock } from "@/lib/units"
import type { Category, Product } from "@/types/products"
import type { SortBy, StatusFilter } from "../types"

const PAGE_SIZE = 10

export function useProductFilters(products: Product[], categories: Category[]) {
    const [search, setSearchState] = useState("")
    const [rootCategoryId, setRootCategoryIdState] = useState("all")
    const [subcategoryId, setSubcategoryIdState] = useState("all")
    const [statusFilter, setStatusFilterState] = useState<StatusFilter>("all")
    const [sortBy, setSortByState] = useState<SortBy>("newest")
    const [page, setPage] = useState(0)

    const setSearch = (value: string) => {
        setSearchState(value)
        setPage(0)
    }

    const setRootCategoryId = (value: string) => {
        setRootCategoryIdState(value)
        setSubcategoryIdState("all")
        setPage(0)
    }

    const setSubcategoryId = (value: string) => {
        setSubcategoryIdState(value)
        setPage(0)
    }

    const setStatusFilter = (value: StatusFilter) => {
        setStatusFilterState(value)
        setPage(0)
    }

    const setSortBy = (value: SortBy) => {
        setSortByState(value)
        setPage(0)
    }

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

        const term = search.trim().toLowerCase()
        if (term) {
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.sku.toLowerCase().includes(term)
            )
        }

        return [...result].sort((a, b) => {
            switch (sortBy) {
                case "oldest":
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                case "low-stock":
                    return Number(hasLowStock(b)) - Number(hasLowStock(a))
                default:
                    return (
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
            }
        })
    }, [
        products,
        categories,
        rootCategoryId,
        subcategoryId,
        statusFilter,
        search,
        sortBy,
    ])

    const totalCount = filteredProducts.length
    const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
    const safePage = Math.min(page, pageCount - 1)
    const pageItems = filteredProducts.slice(
        safePage * PAGE_SIZE,
        (safePage + 1) * PAGE_SIZE
    )
    const rangeStart = totalCount === 0 ? 0 : safePage * PAGE_SIZE + 1
    const rangeEnd = Math.min(totalCount, (safePage + 1) * PAGE_SIZE)

    const hasActiveFilters =
        search.trim() !== "" ||
        rootCategoryId !== "all" ||
        statusFilter !== "all" ||
        sortBy !== "newest"

    const clearFilters = () => {
        setSearchState("")
        setRootCategoryIdState("all")
        setSubcategoryIdState("all")
        setStatusFilterState("all")
        setSortByState("newest")
        setPage(0)
    }

    return {
        search,
        setSearch,
        rootCategoryId,
        setRootCategoryId,
        subcategoryId,
        setSubcategoryId,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        pageItems,
        totalCount,
        page: safePage,
        pageCount,
        rangeStart,
        rangeEnd,
        hasActiveFilters,
        clearFilters,
        goToPage: (target: number) =>
            setPage(Math.min(Math.max(target, 0), pageCount - 1)),
    }
}