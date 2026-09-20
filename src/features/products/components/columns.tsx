"use client"

/**
 * Configuración de columnas para la tabla de productos. Cada columna
 * define su título, ancho y cómo se renderiza el valor de un Product.
 */

import type { ReactNode } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/status-badge"
import { formatCurrency } from "@/lib/utils"
import {
    formatStock,
    getParentCategoryName,
    getSubcategoryName,
    hasLowStock,
} from "../utils"
import type { Product, Category } from "@/types/products"

export interface ProductColumn {
    key: string
    header: string
    width?: string
    render: (product: Product) => ReactNode
}

export function getProductColumns(
    categories: Category[],
    onEdit: (product: Product) => void,
    onDelete: (product: Product) => void
): ProductColumn[] {
    return [
        {
            key: "name",
            header: "Producto",
            width: "w-[20%]",
            render: (product) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {product.sku}
                    </p>
                </div>
            ),
        },
        {
            key: "category",
            header: "Categoría",
            width: "w-[17%]",
            render: (product) => (
                <span className="block truncate font-medium">
                    {getParentCategoryName(product.categoryId, categories)}
                </span>
            ),
        },
        {
            key: "subcategory",
            header: "Subcategoría",
            width: "w-[16%]",
            render: (product) => (
                <span className="block truncate text-muted-foreground">
                    {getSubcategoryName(product.categoryId, categories)}
                </span>
            ),
        },
        {
            key: "salePrice",
            header: "Precio",
            width: "w-[13%]",
            render: (product) => (
                <div className="font-medium tabular-nums">
                    {formatCurrency(product.salePrice)}
                </div>
            ),
        },
        {
            key: "currentStock",
            header: "Stock",
            width: "w-[13%]",
            render: (product) => {
                const label = formatStock(product)

                if (hasLowStock(product)) {
                    return (
                        <Badge
                            variant="destructive"
                            className="bg-destructive/15 px-2.5 text-destructive hover:bg-destructive/15"
                        >
                            {label}
                        </Badge>
                    )
                }

                return <span className="font-medium tabular-nums">{label}</span>
            },
        },
        {
            key: "status",
            header: "Estado",
            width: "w-[10%]",
            render: (product) => <StatusBadge active={product.isActive} />,
        },
        {
            key: "actions",
            header: "Acciones",
            width: "w-[11%]",
            render: (product) => (
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25 dark:hover:text-amber-300"
                        onClick={() => onEdit(product)}
                    >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 bg-destructive/15 text-destructive hover:bg-destructive/25 hover:text-destructive dark:bg-destructive/15 dark:hover:bg-destructive/25"
                        onClick={() => onDelete(product)}
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            ),
        },
    ]
}