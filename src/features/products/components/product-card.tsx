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

import { formatStock, hasLowStock, type CategoryTone } from "../utils"
import type { Product } from "@/types/products"

export const CATEGORY_TONE_CLASSES: Record<
    CategoryTone,
    { surface: string; icon: string; badge: string }
> = {
    violet: {
        surface: "bg-violet-400 dark:bg-violet-950/50",
        icon: "text-violet-600 dark:text-violet-400",
        badge: "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    },
    pink: {
        surface: "bg-pink-300 dark:bg-pink-950/50",
        icon: "text-pink-500 dark:text-pink-400",
        badge: "border-pink-300 bg-pink-100 text-pink-700 dark:border-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
    },
    zinc: {
        surface: "bg-zinc-200 dark:bg-zinc-800/60",
        icon: "text-zinc-500 dark:text-zinc-300",
        badge: "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300",
    },
    fuchsia: {
        surface: "bg-fuchsia-300 dark:bg-fuchsia-950/50",
        icon: "text-fuchsia-500 dark:text-fuchsia-400",
        badge: "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-700 dark:border-fuchsia-700 dark:bg-fuchsia-950/50 dark:text-fuchsia-300",
    },
    yellow: {
        surface: "bg-yellow-200 dark:bg-yellow-950/50",
        icon: "text-yellow-600 dark:text-yellow-300",
        badge: "border-yellow-300 bg-yellow-100 text-yellow-700 dark:border-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
    },
    indigo: {
        surface: "bg-indigo-400 dark:bg-indigo-950/50",
        icon: "text-indigo-600 dark:text-indigo-400",
        badge: "border-indigo-300 bg-indigo-100 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    },
}

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
                                lowStock
                                    ? "font-medium text-destructive"
                                    : "text-muted-foreground"
                            )}
                        >
                            {formatStock(product)}
                        </span>
                    </div>
                </div>
            </Card>
        </button>
    )
}
