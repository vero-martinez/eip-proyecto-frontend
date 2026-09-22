/**
 * Card de producto para el catálogo (solo consulta).
 *
 * Componente presentacional: recibe el producto ya resuelto (nombres de
 * categoría y tono visual) y un callback de selección. La card entera es
 * un botón para abrir el detalle.
 */

import { Gem } from "lucide-react"
import { cn } from "cn"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

import { formatStock, hasLowStock, isOutOfStock } from "@/lib/units"
import { CATEGORY_TONE_CLASSES, type CategoryTone } from "@/lib/categories"
import type { Product } from "@/types/products"

interface ProductCardProps {
    product: Product
    categoryName: string
    tone: CategoryTone
    onSelect: (product: Product) => void
}

export function ProductCard({
    product,
    categoryName,
    tone,
    onSelect,
}: ProductCardProps) {
    const lowStock = hasLowStock(product)
    const outOfStock = isOutOfStock(product)
    const { surface, icon, badge } = CATEGORY_TONE_CLASSES[tone]

    return (
        <button
            type="button"
            onClick={() => onSelect(product)}
            aria-label={`Ver detalle de ${product.name}`}
            className="group block h-full w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
            <Card className="h-full gap-0 py-0 transition-shadow duration-150 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-primary">
                <div
                    aria-hidden="true"
                    className={cn(
                        "relative flex h-32 items-center justify-center",
                        surface
                    )}
                >
                    <div className="flex size-16 items-center justify-center rounded-full bg-white/70 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
                        <Gem className={cn("size-8", icon)} />
                    </div>
                    <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 border-transparent bg-black/50 font-mono text-white"
                    >
                        {product.sku}
                    </Badge>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="truncate font-semibold text-base">{product.name}</p>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                            variant="outline"
                            className={cn("truncate", badge)}
                        >
                            {categoryName}
                        </Badge>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-xl text-sidebar font-bold">
                            {formatCurrency(product.salePrice)}
                        </span>
                        <span
                            className={cn(
                                "text-sm tabular-nums",
                                outOfStock || lowStock
                                    ? "font-medium text-destructive"
                                    : "text-muted-foreground"
                            )}
                        >
                            {outOfStock ? "Sin stock" : formatStock(product)}
                        </span>
                    </div>
                </div>
            </Card>
        </button>
    )
}