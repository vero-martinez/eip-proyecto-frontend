"use client"

/**
 * Card con los últimos ajustes de merma registrados: muestra el
 * producto, la cantidad descartada, la fecha, el motivo y el nombre
 * de la persona que realizó el ajuste.
 */

import { Calendar, History, Inbox, Package, User } from "lucide-react"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
        <Card className="border-border/80 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-2.5">
                    {/* Icono de la Card */}
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20 mt-0.5">
                        <History className="size-4" aria-hidden="true" />
                    </span>

                    {/* Contenedor del Título + Descripción */}
                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            Últimos ajustes
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Los últimos {limit} descartes registrados en el taller.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pt-0">
                {recent.length ? (
                    <ul className="flex flex-col gap-2">
                        {recent.map(({ id, product, quantity, motivo, responsable, createdAt }) => (
                            <li
                                key={id}
                                className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Icono del Producto con fondo primario completo */}
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

                                {/* Badge de Cantidad Descartada */}
                                <Badge
                                    variant="outline"
                                    className="shrink-0 font-semibold border-destructive bg-destructive/10 px-2.5 py-1 text-xs text-destructive"
                                >
                                    {formatMermaQuantity(quantity, product.unitType)}
                                </Badge>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex h-44 flex-col items-center justify-center gap-2.5 text-center text-muted-foreground">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50">
                            <Inbox className="size-5 text-muted-foreground/70" aria-hidden="true" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                Sin ajustes recientes
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Registrá una merma para verla reflejada aquí.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}