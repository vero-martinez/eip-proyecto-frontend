"use client"

/**
 * Vista del catálogo: filtros, grilla de cards y paginación.
 *
 * Componente presentacional que consume useCatalogFilters (mismo
 * patrón que ProductsTable con useProductFilters). Mantiene solo
 * estado de UI local: el producto seleccionado para abrir el detalle.
 */

import { useState } from "react"
import { Inbox } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { PaginationBar } from "@/components/common/pagination-bar"

import { formatProductCount } from "@/lib/units"
import {
    getCategoryTone,
    getParentCategoryName,
    getRootCategoryId,
} from "@/lib/categories"
import { useCatalogFilters } from "../hooks/use-catalog-filters"
import { CatalogFilters } from "./catalog-filters"
import { ProductCard } from "./product-card"
import { ProductDetailDialog } from "./product-detail-dialog"

import type { Product, Category } from "@/types/products"

interface CatalogViewProps {
    products: Product[]
    categories: Category[]
}

export function CatalogView({
    products,
    categories,
}: CatalogViewProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    const {
        search,
        setSearch,
        rootCategoryId,
        setRootCategoryId,
        subcategoryId,
        setSubcategoryId,
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
    } = useCatalogFilters(products, categories)

    return (
        <div className="space-y-5 sm:space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-2">
                <CatalogFilters
                    categories={categories}
                    search={search}
                    rootCategoryId={rootCategoryId}
                    subcategoryId={subcategoryId}
                    sortBy={sortBy}
                    onSearchChange={setSearch}
                    onRootCategoryChange={setRootCategoryId}
                    onSubcategoryChange={setSubcategoryId}
                    onSortChange={setSortBy}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                />

                <Badge
                    variant="outline"
                    className="border-primary/30 bg-primary/10 px-3 py-3 text-base text-primary"
                >
                    {formatProductCount(totalCount)}
                </Badge>
            </div>

            {pageItems.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {pageItems.map((product) => {
                        const rootId = getRootCategoryId(
                            categories,
                            product.categoryId
                        )
                        return (
                            <ProductCard
                                key={product.id}
                                product={product}
                                categoryName={getParentCategoryName(
                                    product.categoryId,
                                    categories
                                )}
                                tone={getCategoryTone(rootId)}
                                onSelect={setSelectedProduct}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Inbox className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm">
                            No se encontraron productos en el catálogo.
                        </p>
                    </div>
                </div>
            )}

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

            <ProductDetailDialog
                open={!!selectedProduct}
                onOpenChange={(open) => {
                    if (!open) setSelectedProduct(null)
                }}
                product={selectedProduct}
                categories={categories}
            />
        </div>
    )
}