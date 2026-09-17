"use client"

/**
 * Definición de columnas para la tabla de productos, usando
 * @tanstack/react-table. Cada columna define cómo se extrae y
 * renderiza el valor de cada celda a partir de un Product.
 */

import { ColumnDef, CellContext } from "@tanstack/react-table"
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

export function getProductColumns(
    categories: Category[],
    onEdit: (product: Product) => void,
    onDelete: (product: Product) => void
): ColumnDef<Product>[] {
    return [
        {
            accessorKey: "name",
            header: "Producto",
            meta: { width: "w-[20%]" },
            cell: ({ row }: CellContext<Product, unknown>) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{row.original.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                        {row.original.sku}
                    </p>
                </div>
            ),
        },
        {
            id: "category",
            header: "Categoría",
            meta: { width: "w-[17%]" },
            cell: ({ row }: CellContext<Product, unknown>) => (
                <span className="block truncate font-medium">
                    {getParentCategoryName(row.original.categoryId, categories)}
                </span>
            ),
        },
        {
            id: "subcategory",
            header: "Subcategoría",
            meta: { width: "w-[16%]" },
            cell: ({ row }: CellContext<Product, unknown>) => (
                <span className="block truncate text-muted-foreground">
                    {getSubcategoryName(row.original.categoryId, categories)}
                </span>
            ),
        },
        {
            accessorKey: "salePrice",
            header: "Precio",
            meta: { width: "w-[13%]" },
            cell: ({ row }: CellContext<Product, unknown>) => (
                <div className="font-medium tabular-nums">
                    {formatCurrency(row.original.salePrice)}
                </div>
            ),
        },
        {
            accessorKey: "currentStock",
            header: "Stock",
            meta: { width: "w-[13%]" },
            cell: ({ row }: CellContext<Product, unknown>) => {
                const label = formatStock(row.original)

                if (hasLowStock(row.original)) {
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
            id: "status",
            header: "Estado",
            meta: { width: "w-[10%]" },
            cell: ({ row }: CellContext<Product, unknown>) => (
                <StatusBadge active={row.original.isActive} />
            ),
        },
        {
            id: "actions",
            header: "Acciones",
            meta: { width: "w-[11%]" },
            cell: ({ row }: CellContext<Product, unknown>) => (
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 bg-amber-100 text-amber-700 hover:bg-amber-200 hover:text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 dark:hover:bg-amber-500/25 dark:hover:text-amber-300"
                        onClick={() => onEdit(row.original)}
                    >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 bg-destructive/15 text-destructive hover:bg-destructive/25 hover:text-destructive dark:bg-destructive/15 dark:hover:bg-destructive/25"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Eliminar</span>
                    </Button>
                </div>
            ),
        },
    ]
}