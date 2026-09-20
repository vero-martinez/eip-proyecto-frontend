"use client"

/**
 * Configuración de columnas para la tabla de movimientos. Cada columna
 * define su título, ancho y cómo se renderiza el valor de un
 * InventoryMovement.
 */

import type { ReactNode } from "react"
import { Eye } from "lucide-react"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
    formatMovementQuantity,
    formatVentaDateTime,
    getMovementDetail,
    getMovementTint,
    getMovementTypeLabel,
} from "../utils"
import type { InventoryMovement } from "../types"

export interface MovementColumn {
    key: string
    header: string
    /** Clases extra para la celda (anchos/min/max, nowrap, etc.) */
    className?: string
    render: (movement: InventoryMovement) => ReactNode
}

export function getMovimientoColumns(
    onView: (movement: InventoryMovement) => void
): MovementColumn[] {
    return [
        {
            key: "type",
            header: "Tipo",
            className: "whitespace-nowrap",
            render: (movement) => (
                <Badge
                    className={cn(
                        "h-5 w-fit gap-1 text-sm font-semibold",
                        getMovementTint(movement.movementType)
                    )}
                >
                    {getMovementTypeLabel(movement.movementType)}
                </Badge>
            ),
        },
        {
            key: "product",
            header: "Producto",
            className: "min-w-[180px] max-w-[300px]",
            render: (movement) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{movement.productName}</p>
                    <p className="truncate text-sm text-muted-foreground">
                        {movement.sku}
                    </p>
                </div>
            ),
        },
        {
            key: "quantity",
            header: "Cantidad",
            className: "whitespace-nowrap",
            render: (movement) => {
                const isSalida = movement.movementType !== "entrada"
                return (
                    <span
                        className={cn(
                            "font-bold tabular-nums",
                            isSalida
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-emerald-600 dark:text-emerald-400"
                        )}
                    >
                        {formatMovementQuantity(movement)}
                    </span>
                )
            },
        },
        {
            key: "origin",
            header: "Origen",
            className: "min-w-[180px] max-w-[280px]",
            render: (movement) => (
                <p className="truncate text-muted-foreground">
                    {getMovementDetail(movement) ?? "—"}
                </p>
            ),
        },
        {
            key: "responsable",
            header: "Responsable",
            className: "min-w-[120px] max-w-[180px]",
            render: (movement) => (
                <p className="truncate font-medium">{movement.responsable}</p>
            ),
        },
        {
            key: "date",
            header: "Fecha",
            className: "whitespace-nowrap",
            render: (movement) => (
                <p className="truncate text-sm tabular-nums text-muted-foreground">
                    {formatVentaDateTime(movement.createdAt)}
                </p>
            ),
        },
        {
            key: "actions",
            header: "Acciones",
            className: "whitespace-nowrap",
            render: (movement) => (
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 bg-violet-100 text-violet-700 hover:bg-violet-200 hover:text-violet-800 dark:bg-violet-500/15 dark:text-violet-400 dark:hover:bg-violet-500/25 dark:hover:text-violet-300"
                        onClick={() => onView(movement)}
                        aria-label={`Ver detalle del movimiento ${movement.id}`}
                    >
                        <span className="sr-only">Ver detalle</span>
                        <Eye className="size-4" aria-hidden="true" />
                    </Button>
                </div>
            ),
        },
    ]
}