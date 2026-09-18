"use client"

/**
 * Tabla de productos, usando los componentes Table de shadcn/ui para
 * el renderizado visual y el hook useProductFilters para búsqueda,
 * filtros, orden y paginación client-side.
 *
 * Recibe los productos y categorías ya cargados (vía hooks), y los
 * callbacks de editar/eliminar que le pasa el componente padre.
 */

import { Plus, Inbox, Search, X } from "lucide-react"

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
import { PaginationBar } from "@/components/common/pagination-bar"
import { ProductFilters } from "./product-filters"
import { getProductColumns } from "./columns"
import { useProductFilters } from "../hooks/use-product-filters"
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
        page,
        pageCount,
        rangeStart,
        rangeEnd,
        hasActiveFilters,
        clearFilters,
        goToPage,
    } = useProductFilters(products, categories)

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
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <InputGroupAddon align="inline-end">
                            <InputGroupButton
                                size="icon-xs"
                                aria-label="Limpiar búsqueda"
                                onClick={() => setSearch("")}
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
                        <TableRow className="bg-primary hover:bg-primary">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.key}
                                    className={`h-11 px-4 text-xs font-semibold tracking-wide text-primary-foreground uppercase ${
                                        column.width ?? ""
                                    }`}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageItems.length ? (
                            pageItems.map((product) => (
                                <TableRow
                                    key={product.id}
                                    className="hover:bg-accent/50"
                                >
                                    {columns.map((column) => (
                                        <TableCell
                                            key={column.key}
                                            className={`px-4 py-3 ${
                                                column.width ?? ""
                                            }`}
                                        >
                                            {column.render(product)}
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
                                        <p className="text-sm">
                                            No se encontraron productos.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <PaginationBar
                page={page}
                pageCount={pageCount}
                onPageChange={goToPage}
                summary={{
                    from: rangeStart,
                    to: rangeEnd,
                    total: totalCount,
                    formatCount: formatProductCount,
                }}
            />
        </div>
    )
}