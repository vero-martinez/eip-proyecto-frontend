"use client"

/**
 * Grilla de productos del Punto de Venta. Reutiliza ProductCard del
 * catálogo; al hacer clic en una card se agrega el producto al carrito
 * (a diferencia del catálogo, que abre el detalle).
 *
 * Componente presentacional: recibe los productos ya filtrados y
 * paginados desde el container.
 */

import { Inbox } from "lucide-react"

import { PaginationBar } from "@/components/common/pagination-bar"
import { ProductCard } from "@/features/products/components/product-card"
import {
    formatProductCount,
    getCategoryTone,
    getParentCategoryName,
    getRootCategoryId,
} from "@/features/products/utils"
import type { Product, Category } from "@/types/products"

interface PosProductGridProps {
    products: Product[]
    categories: Category[]
    totalCount: number
    page: number
    pageCount: number
    rangeStart: number
    rangeEnd: number
    onPageChange: (page: number) => void
    onAdd: (product: Product) => void
}

export function PosProductGrid({
    products,
    categories,
    totalCount,
    page,
    pageCount,
    rangeStart,
    rangeEnd,
    onPageChange,
    onAdd,
}: PosProductGridProps) {
    return (
        <div className="space-y-4">
            {products.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => {
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
                                onSelect={onAdd}
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
                            No se encontraron productos para vender.
                        </p>
                    </div>
                </div>
            )}

            <PaginationBar
                page={page}
                pageCount={pageCount}
                onPageChange={onPageChange}
                summary={{
                    from: rangeStart,
                    to: rangeEnd,
                    total: totalCount,
                    formatCount: formatProductCount,
                }}
            />

            {/* Legibilidad del detalle mínimo de producto */}
            <p className="sr-only">
                Las cards agregar una unidad al carrito al hacer clic.
            </p>
        </div>
    )
}