"use client"

/**
 * Card con los últimos registros de entrada al inventario: muestra el
 * producto, la cantidad ingresada, la fecha, el proveedor y el
 * responsable de cada entrada. Presenta solo la lista; el orden y
 * filtrado lo resuelve getRecentEntradas().
 */

import { AlertTriangle, Calendar, History, Package, Truck, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ActivityList } from "@/components/common/activity-list"
import { formatDate } from "@/lib/utils"
import { hasLowStock } from "@/lib/units"
import type { Product } from "@/types/products"

import type { Proveedor } from "@/features/proveedores/types"
import type { StockEntry } from "../types"
import { formatEntryQuantity, getProveedorName, getRecentEntradas } from "../utils"

interface RecentEntradasProps {
    products: Product[]
    entries: StockEntry[]
    proveedores: Proveedor[]
    limit?: number
}

export function RecentEntradas({
    products,
    entries,
    proveedores,
    limit = 5,
}: RecentEntradasProps) {
    const recent = getRecentEntradas(entries, products, limit)

    return (
        <ActivityList
            icon={History}
            title="Últimas entradas"
            description={`Los últimos ${limit} registros de entrada al inventario.`}
            tone="positive"
            items={recent}
            emptyTitle="Sin entradas recientes"
            emptyHint="Registrá un movimiento para verlo reflejado aquí."
            renderItem={({ id, product, quantity, proveedorId, responsable, createdAt }) => {
                const proveedorName = getProveedorName(proveedorId, proveedores)
                const isLow = hasLowStock(product)

                return (
                    <li
                        key={id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-accent/40 p-3"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground border border-primary/20">
                                <Package className="size-4" aria-hidden="true" />
                            </div>

                            <div className="min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <p className="truncate font-medium text-sm text-accent-foreground">
                                        {product.name}
                                    </p>
                                    {isLow && (
                                        <Badge
                                            variant="outline"
                                            className="gap-1 shrink-0 rounded-full border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/20 px-2 py-0.5 text-[10px] font-medium"
                                        >
                                            <AlertTriangle
                                                className="size-2.5"
                                                aria-hidden="true"
                                            />
                                            Stock bajo
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                    <span className="inline-flex items-center gap-1">
                                        <Calendar className="size-3" aria-hidden="true" />
                                        {formatDate(createdAt)}
                                    </span>

                                    {proveedorName && (
                                        <span className="inline-flex items-center gap-1 border-l border-border pl-2">
                                            <Truck className="size-3" aria-hidden="true" />
                                            <span className="truncate max-w-[120px] sm:max-w-[160px]">
                                                {proveedorName}
                                            </span>
                                        </span>
                                    )}

                                    {responsable && (
                                        <span className="inline-flex items-center gap-1 border-l border-border pl-2">
                                            <User className="size-3" aria-hidden="true" />
                                            <span className="truncate max-w-[120px] sm:max-w-[160px]">
                                                {responsable}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Badge
                            variant="outline"
                            className="shrink-0 font-semibold border-amber-500 bg-amber-200/60 dark:text-amber-400 dark:bg-amber-500/20 px-2.5 py-1 text-xs"
                        >
                            {formatEntryQuantity(quantity, product.unitType)}
                        </Badge>
                    </li>
                )
            }}
        />
    )
}