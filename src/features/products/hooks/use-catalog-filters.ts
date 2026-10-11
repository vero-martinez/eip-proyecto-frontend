/**
 * Hook personalizado para manejar la lógica de filtrado, ordenamiento
 * y paginación del catálogo de productos en modo consulta.
 */

import { useMemo, useState } from "react"

import type { Category, Product } from "@/types/products"
import type { CatalogSort } from "../types"
import {
    getRootCategories,
    getSubcategories,
    isProductInCategoryTree,
} from "@/lib/categories"

const PAGE_SIZE = 12

export function useCatalogFilters(products: Product[], categories: Category[]) {
    const [search, setSearchState] = useState("")
    const [rootCategoryId, setRootCategoryIdState] = useState("all")
    const [subcategoryId, setSubcategoryIdState] = useState("all")
    const [sortBy, setSortByState] = useState<CatalogSort>("recent")
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

    const setSortBy = (value: CatalogSort) => {
        setSortByState(value)
        setPage(0)
    }

    const filteredProducts = useMemo(() => {
        let result = products.filter((product) => product.isActive)

        if (rootCategoryId !== "all") {
            const rootId = Number(rootCategoryId)

            if (subcategoryId !== "all") {
                const subId = Number(subcategoryId)
                result = result.filter((product) => product.categoryId === subId)
            } else {
                result = result.filter((product) =>
                    isProductInCategoryTree(product, rootId, categories)
                )
            }
        }

        const term = search.trim().toLowerCase()
        if (term) {
            result = result.filter(
                (product) =>
                    product.name.toLowerCase().includes(term) ||
                    product.sku.toLowerCase().includes(term)
            )
        }

        return [...result].sort((a, b) => {
            switch (sortBy) {
                case "oldest":
                    return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                    )
                case "price-asc":
                    return a.salePrice - b.salePrice
                case "price-desc":
                    return b.salePrice - a.salePrice
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

    const rootCategories = getRootCategories(categories)
    const selectedRoot = rootCategories.find(
        (category) => category.id === Number(rootCategoryId)
    )
    const subcategories = selectedRoot
        ? getSubcategories(categories, selectedRoot.id)
        : []

    const hasActiveFilters =
        search.trim() !== "" ||
        rootCategoryId !== "all" ||
        sortBy !== "recent"

    const clearFilters = () => {
        setSearchState("")
        setRootCategoryIdState("all")
        setSubcategoryIdState("all")
        setSortByState("recent")
        setPage(0)
    }

    return {
        search,
        setSearch,
        rootCategoryId,
        setRootCategoryId,
        subcategoryId,
        setSubcategoryId,
        sortBy,
        setSortBy,
        rootCategories,
        subcategories,
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