"use client"

/**
 * Tabla de productos, usando @tanstack/react-table (v8) + los
 * componentes Table de shadcn/ui para el renderizado visual.
 *
 * Recibe los productos y categorías ya cargados (vía hooks), y los
 * callbacks de editar/eliminar que le pasa el componente padre.
 */

import { Plus, ChevronLeft, ChevronRight, Inbox, Search, X } from "lucide-react"
import { flexRender } from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ClearFiltersButton } from "@/components/common/clear-filters-button"
import { ProductFilters } from "./product-filters"
import { getProductColumns } from "./columns"
import { useProductsTable } from "../hooks/use-products-table"
import { formatProductCount } from "../utils"
import type { Product, Category } from "@/types/products"

interface ProductsTableProps {
    products: Product[]
    categories: Category[]
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
    onCreate: () => void
}

export function ProductsTable({
    products,
    categories,
    onEdit,
    onDelete,
    onCreate,
}: ProductsTableProps) {
    const columns = getProductColumns(categories, onEdit, onDelete)

    const {
        table,
        totalCount,
        pageIndex,
        pageCount,
        rangeStart,
        rangeEnd,
        searchValue,
        rootCategoryId,
        subcategoryId,
        statusFilter,
        sortBy,
        setRootCategoryId,
        setSubcategoryId,
        setStatusFilter,
        setSortBy,
        hasActiveFilters,
        clearFilters,
    } = useProductsTable({ products, categories, columns })

    return (
        <div className="space-y-5 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <ProductFilters
                        categories={categories}
                        rootCategoryId={rootCategoryId}
                        subcategoryId={subcategoryId}
                        statusFilter={statusFilter}
                        sortBy={sortBy}
                        onRootCategoryChange={setRootCategoryId}
                        onSubcategoryChange={setSubcategoryId}
                        onStatusChange={setStatusFilter}
                        onSortChange={setSortBy}
                    />
                    {hasActiveFilters && (
                        <ClearFiltersButton onClick={clearFilters} />
                    )}
                </div>
                <Button
                    onClick={onCreate}
                    className="w-full h-10 order-first sm:w-auto sm:order-last"
                >
                    <Plus className="size-4" />
                    Nuevo producto
                </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-3">
                <InputGroup className="w-full max-w-sm h-10 border-border bg-white shadow-sm dark:bg-input/30">
                    <InputGroupAddon align="inline-start">
                        <Search className="size-4 text-primary" aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Buscar por nombre o código..."
                        aria-label="Buscar productos"
                        value={searchValue}
                        onChange={(e) =>
                            table.getColumn("name")?.setFilterValue(e.target.value)
                        }
                    />
                    {searchValue && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                size="icon-xs"
                                aria-label="Limpiar búsqueda"
                                onClick={() => table.getColumn("name")?.setFilterValue("")}
                            >
                                <X className="size-3.5" />
                            </InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
                <Badge
                    variant="outline"
                    className="border-violet-300 bg-violet-100/70 px-3 py-3 text-base text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
                >
                    {formatProductCount(totalCount)}
                </Badge>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
                <Table className="table-fixed min-w-[880px]">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-primary hover:bg-primary"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className={`h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase ${
                                            (header.column.columnDef.meta as
                                                | { width?: string }
                                                | undefined)?.width ?? ""
                                        }`}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.header,
                                                  header.getContext()
                                              )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="hover:bg-accent/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={`px-4 py-3 ${(
                                                cell.column.columnDef.meta as
                                                    | { width?: string }
                                                    | undefined
                                            )?.width ?? ""}`}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-40 px-4 text-center"
                                >
                                    <div className="mx-auto flex w-fit flex-col items-center gap-2 text-muted-foreground">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                            <Inbox className="size-6" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm">No se encontraron productos.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-between">
                {totalCount > 0 && (
                    <p className="text-sm text-muted-foreground">
                        Mostrando{" "}
                        <span className="font-medium text-foreground">
                            {rangeStart}–{rangeEnd}
                        </span>{" "}
                        de {formatProductCount(totalCount)}
                    </p>
                )}
                <nav
                    aria-label="Paginación"
                    className="flex items-center rounded-lg border border-border bg-card shadow-sm"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none rounded-l-lg"
                        aria-label="Página anterior"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                    </Button>
                    <span className="flex h-8 items-center border-x border-border px-3 text-xs font-medium text-muted-foreground tabular-nums">
                        {pageIndex + 1}
                        <span className="px-1.5 text-foreground/40">/</span>
                        {pageCount}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none rounded-r-lg"
                        aria-label="Página siguiente"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </Button>
                </nav>
            </div>
        </div>
    )
}