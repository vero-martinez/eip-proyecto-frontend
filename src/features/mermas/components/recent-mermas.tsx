"use client"

/**
 * Card con los últimos ajustes de merma registrados: muestra el
 * producto, la cantidad descartada, la fecha, el motivo y el nombre
 * de la persona que realizó el ajuste.
 */

import { Calendar, History, Package, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ActivityList } from "@/components/common/activity-list"
import { formatDate } from "@/lib/utils"
import type { Product } from "@/types/products"

import type { Merma } from "../types"
import { formatMermaQuantity, getRecentMermas } from "../utils"

interface RecentMermasProps {
    products: Product[]
    mermas: Merma[]
    limit?: number
}

export function RecentMermas({
    products,
    mermas,
    limit = 5,
}: RecentMermasProps) {
    const recent = getRecentMermas(mermas, products, limit)

    return (
        <ActivityList
            icon={History}
            title="Últimos ajustes"
            description={`Los últimos ${limit} descartes registrados en el taller.`}
            tone="negative"
            items={recent}
            emptyTitle="Sin ajustes recientes"
            emptyHint="Registrá una merma para verla reflejada aquí."
            renderItem={({ id, product, quantity, motivo, responsable, createdAt }) => (
                <li
                    key={id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive text-white border border-destructive/20">
                            <Package className="size-4" aria-hidden="true" />
                        </div>

                        <div className="min-w-0 space-y-1">
                            <p className="truncate font-medium text-sm text-accent-foreground">
                                {product.name}
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="size-3" aria-hidden="true" />
                                    {formatDate(createdAt)}
                                </span>

                                <span className="inline-flex items-center gap-1 border-l border-border pl-2 font-medium text-muted-foreground">
                                    {motivo}
                                </span>

                                <span className="inline-flex items-center gap-1 border-l border-border pl-2">
                                    <User className="size-3" aria-hidden="true" />
                                    <span className="truncate max-w-[120px] sm:max-w-[160px]">
                                        {responsable}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <Badge
                        variant="outline"
                        className="shrink-0 font-semibold border-destructive bg-destructive/10 px-2.5 py-1 text-xs text-destructive"
                    >
                        {formatMermaQuantity(quantity, product.unitType)}
                    </Badge>
                </li>
            )}
        />
    )
}