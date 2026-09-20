"use client"

/**
 * Card con los últimos productos que entraron al inventario (distintos,
 * con la cantidad agregada de sus entradas y la fecha de la más reciente).
 * Presenta solo la lista; el agrupado y orden lo resuelve
 * getLastDistinctProducts().
 */

import { AlertTriangle, Calendar, History, Inbox, Package, Truck, User } from "lucide-react"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { hasLowStock } from "@/features/products/utils"
import type { Product } from "@/types/products"

import type { Proveedor, StockEntry } from "../types"
import { formatEntryQuantity, getLastDistinctProducts, getProveedorName } from "../utils"

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
    const recent = getLastDistinctProducts(entries, products, limit)

    return (
        <Card className="border-border/80 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-2.5">
                    {/* Icono de la Card */}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 mt-0.5">
                        <History className="size-4" aria-hidden="true" />
                    </span>

                    {/* Contenedor del Título + Descripción */}
                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            Últimas entradas
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Los últimos {limit} productos que ingresaron al inventario.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-0">
                {recent.length ? (
                    <ul className="flex flex-col gap-2">
                        {recent.map(
                            ({ product, totalQuantity, lastDate, proveedorId, responsable }) => {
                                const proveedorName = getProveedorName(
                                    proveedorId,
                                    proveedores
                                )
                                const isLow = hasLowStock(product)

                                return (
                                    <li
                                        key={product.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-primary/40 bg-accent/40 p-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Icono del Producto con fondo primario completo */}
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
                                                        {formatDate(lastDate)}
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

                                        {/* Badge de Cantidad Ingresada */}
                                        <Badge
                                            variant="outline"
                                            className="shrink-0 font-semibold border-amber-500 bg-amber-200/60 dark:text-amber-400 dark:bg-amber-500/20 px-2.5 py-1 text-xs"
                                        >
                                            +{formatEntryQuantity(totalQuantity, product.unitType)}
                                        </Badge>
                                    </li>
                                )
                            }
                        )}
                    </ul>
                ) : (
                    <div className="flex h-44 flex-col items-center justify-center gap-2.5 text-center text-muted-foreground">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50">
                            <Inbox className="size-5 text-muted-foreground/70" aria-hidden="true" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                Sin entradas recientes
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Registrá un movimiento para verlo reflejado aquí.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}