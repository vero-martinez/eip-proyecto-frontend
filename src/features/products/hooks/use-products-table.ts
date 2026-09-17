"use client"

/**
 * Lógica de la tabla de productos: filtros, orden, configuración de
 * TanStack Table y la paginación (rango mostrado, página actual).
 *
 * El componente ProductsTable solo consume lo que devuelve este hook
 * y lo renderiza.
 */

import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
    type ColumnDef,
} from "@tanstack/react-table"

import type { Category, Product } from "@/types/products"

import { useProductFilters } from "./use-product-filters"

interface UseProductsTableParams {
    products: Product[]
    categories: Category[]
    columns: ColumnDef<Product>[]
}

export function useProductsTable({
    products,
    categories,
    columns,
}: UseProductsTableParams) {
    const filters = useProductFilters(products, categories)

    const table = useReactTable({
        data: filters.filteredProducts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: filters.setColumnFilters,
        state: {
            columnFilters: filters.columnFilters,
        },
    })

    const totalCount = table.getFilteredRowModel().rows.length
    const pageIndex = table.getState().pagination.pageIndex
    const pageCount = table.getPageCount()
    const pageSize = table.getState().pagination.pageSize
    const rangeStart = totalCount === 0 ? 0 : pageIndex * pageSize + 1
    const rangeEnd = Math.min(totalCount, (pageIndex + 1) * pageSize)
    const searchValue =
        (table.getColumn("name")?.getFilterValue() as string) ?? ""

    return {
        table,
        totalCount,
        pageIndex,
        pageCount,
        rangeStart,
        rangeEnd,
        searchValue,
        ...filters,
    }
}
