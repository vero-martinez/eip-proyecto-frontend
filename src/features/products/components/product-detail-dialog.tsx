"use client"

/**
 * Detalle de producto del catálogo (solo consulta).
 *
 * Componente presentacional: recibe el producto y las categorías ya
 * resueltas. Usa el mismo tono de categoría que la card para mantener
 * la identidad visual entre grilla y detalle.
 */

import {
    AlertTriangle,
    Banknote,
    Barcode,
    Calendar,
    Gem,
    Layers,
    Package,
    Ruler,
    Tag,
    type LucideIcon,
} from "lucide-react"
import { cn } from "cn"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

import {
    formatStock,
    getCategoryTone,
    getParentCategoryName,
    getRootCategoryId,
    getSubcategoryName,
    hasLowStock,
    UNIT_OPTIONS,
} from "../utils"
import { CATEGORY_TONE_CLASSES } from "./product-card"
import type { Product, Category } from "@/types/products"

interface ProductDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: Product | null
    categories: Category[]
    /** Muestra u oculta el precio de costo (sensible). */
    showCost: boolean
}

function DetailField({
    icon: Icon,
    label,
    children,
}: {
    icon: LucideIcon
    label: string
    children: React.ReactNode
}) {
    return (
        <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {label}
            </dt>
            <dd className="mt-1 text-sm text-foreground">{children}</dd>
        </div>
    )
}

export function ProductDetailDialog({
    open,
    onOpenChange,
    product,
    categories,
    showCost,
}: ProductDetailDialogProps) {
    if (!product) return null

    const rootId = getRootCategoryId(categories, product.categoryId)
    const tone = getCategoryTone(rootId)
    const { surface, icon, badge } = CATEGORY_TONE_CLASSES[tone]
    const categoryName = getParentCategoryName(product.categoryId, categories)
    const subcategoryName = getSubcategoryName(product.categoryId, categories)
    const lowStock = hasLowStock(product)
    const unitLabel =
        UNIT_OPTIONS.find((option) => option.value === product.unitType)?.label ??
        product.unitType
    const unitSymbol =
        UNIT_OPTIONS.find((option) => option.value === product.unitType)?.symbol ??
        product.unitType

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-md">
                <div
                    className={cn(
                        "relative flex h-32 items-center justify-center rounded-t-xl",
                        surface
                    )}
                >
                    <div className="flex size-16 items-center justify-center rounded-full bg-white/70 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10">
                        <Gem className={cn("size-8", icon)} />
                    </div>
                    <Badge
                        variant="secondary"
                        className="absolute top-3 left-3 border-transparent bg-black/50 font-mono text-white"
                    >
                        <Barcode aria-hidden="true" />
                        {product.sku}
                    </Badge>
                </div>

                <div className="space-y-5 p-8">
                    <DialogHeader>
                        <div className="flex flex-wrap items-center gap-2">
                            <DialogTitle className="text-lg font-semibold">
                                {product.name}
                            </DialogTitle>
                            {lowStock && (
                                <Badge variant="destructive">Stock bajo</Badge>
                            )}
                        </div>
                        <DialogDescription className="sr-only">
                            Detalle del producto {product.name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline" className={badge}>
                            <Tag aria-hidden="true" />
                            {categoryName}
                        </Badge>
                        <StatusBadge active={product.isActive} />
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar
                                className="size-3.5 shrink-0"
                                aria-hidden="true"
                            />
                            {formatDate(product.createdAt)}
                        </span>
                    </div>

                    <div className="rounded-lg border border-border bg-muted/40 p-4">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Banknote
                                className="size-3.5"
                                aria-hidden="true"
                            />
                            Precio de venta
                        </p>
                        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <span className="text-2xl font-bold tracking-tight tabular-nums text-sidebar">
                                {formatCurrency(product.salePrice)}
                            </span>
                            {showCost && (
                                <span className="text-sm text-muted-foreground">
                                    Costo:{" "}
                                    {formatCurrency(product.costPrice)}
                                </span>
                            )}
                        </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <DetailField icon={Layers} label="Subcategoría">
                            {subcategoryName}
                        </DetailField>
                        <DetailField icon={Ruler} label="Unidad de medida">
                            {unitLabel}
                        </DetailField>
                        <DetailField icon={Package} label="Stock actual">
                            {formatStock(product)}
                        </DetailField>
                        <DetailField icon={AlertTriangle} label="Stock mínimo">
                            {product.minStockAlert} {unitSymbol}
                        </DetailField>
                    </dl>
                </div>
            </DialogContent>
        </Dialog>
    )
}
