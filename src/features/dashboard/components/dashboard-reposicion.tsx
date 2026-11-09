"use client"

/**
 * Reposición de stock del Dashboard (zona 2 de analítica).
 *
 * Compara el stock actual con el pronóstico de demanda y dice, por producto,
 * cuánto dura y cuánto conviene pedir. El backend entrega los productos ya
 * ordenados por urgencia.
 */

import { AlertTriangle, PackageCheck, ShoppingCart } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"

import { useReposicion } from "../hooks/use-reposicion"
import type { EstadoReposicion, ReposicionProducto } from "../types"
import { formatPiezas, formatSemanaCorta } from "../utils"

const ESTADOS: Record<EstadoReposicion, { label: string; className: string }> = {
    pedir_ya: { label: "Pedir ya", className: "border-destructive/40 text-destructive" },
    pedir_pronto: { label: "Pedir pronto", className: "border-warning/40 text-warning" },
    suficiente: { label: "Stock suficiente", className: "border-success/40 text-success" },
    sin_demanda: { label: "Sin demanda prevista", className: "text-muted-foreground" },
}

function getCobertura(item: ReposicionProducto, horizonte: number): string {
    if (item.semanasCobertura === null) return `Cubre las próximas ${horizonte} semanas`
    if (item.semanasCobertura === 0) return "Sin stock disponible"
    return `Stock para ~${item.semanasCobertura.toFixed(1)} semanas`
}

function getAccion(item: ReposicionProducto): string {
    switch (item.estado) {
        case "pedir_ya":
            return "Pedir esta semana"
        case "pedir_pronto":
            return item.fechaLimitePedido
                ? `Pedir antes del ${formatSemanaCorta(item.fechaLimitePedido)}`
                : "Quedaría bajo el mínimo: reponer pronto"
        case "suficiente":
            return "No hace falta pedir"
        default:
            return "Sin ventas previstas"
    }
}

export function DashboardReposicion() {
    const { data, isLoading, isError } = useReposicion()
    const productos = data?.productos ?? []
    const horizonte = data?.horizonteSemanas ?? 4
    const plazo = productos[0]?.plazoSemanas

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        aria-hidden="true"
                    >
                        <ShoppingCart className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Reposición de stock</CardTitle>
                        <CardDescription className="text-foreground/60">
                            Cuánto dura el stock y cuánto conviene pedir
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-5 pt-0 sm:px-6">
                {isLoading ? (
                    <div className="space-y-2.5" aria-busy="true">
                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-24 w-full rounded-2xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 px-6 py-12 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudo calcular la reposición</p>
                        <p className="text-sm text-muted-foreground">
                            Intenta de nuevo en unos minutos.
                        </p>
                    </div>
                ) : productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/70 px-6 py-14 text-center ring-1 ring-primary/10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <PackageCheck className="size-7 text-primary" aria-hidden="true" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Sin recomendaciones todavía</p>
                            <p className="text-sm text-muted-foreground">
                                Hacen falta al menos 8 semanas de ventas por producto.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ul className="space-y-2.5">
                            {productos.map((item) => {
                                const estado = ESTADOS[item.estado]
                                const simbolo = getUnitSymbol(item.unitType)

                                return (
                                    <li
                                        key={item.productId}
                                        className="space-y-2.5 rounded-2xl bg-background/80 px-4 py-3.5 shadow-sm ring-1 ring-foreground/10"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm font-medium leading-tight">
                                                    {item.nombre}
                                                </p>
                                                <p className="truncate font-mono text-xs text-muted-foreground">
                                                    {item.sku}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("shrink-0", estado.className)}
                                            >
                                                {estado.label}
                                            </Badge>
                                        </div>

                                        <div className="grid gap-2 text-xs sm:grid-cols-3">
                                            <p className="text-muted-foreground">
                                                Stock{" "}
                                                <span className="font-medium tabular-nums text-foreground">
                                                    {formatPiezas(item.stockActual)} {simbolo}
                                                </span>{" "}
                                                · mínimo {formatPiezas(item.stockMinimo)}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {getCobertura(item, horizonte)}
                                            </p>
                                            <p className="font-medium text-foreground">
                                                {getAccion(item)}
                                            </p>
                                        </div>

                                        {(item.cantidadSugerida > 0 || !item.confiable) && (
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                {item.cantidadSugerida > 0 ? (
                                                    <p className="text-sm font-semibold tabular-nums">
                                                        Pedir {formatPiezas(item.cantidadSugerida)}{" "}
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            {simbolo}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <span />
                                                )}
                                                {!item.confiable && (
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1 border-warning/40 text-warning"
                                                    >
                                                        <AlertTriangle
                                                            className="size-3"
                                                            aria-hidden="true"
                                                        />
                                                        Pronóstico poco fiable
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>

                        {plazo !== undefined && (
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                Plazo de reposición supuesto: {plazo}{" "}
                                {plazo === 1 ? "semana" : "semanas"} (provisional).
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}