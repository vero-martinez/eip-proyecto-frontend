"use client"

/**
 * Pronóstico de demanda del Dashboard (zona 1 de analítica).
 *
 * Muestra, por producto, las unidades esperadas en las próximas semanas. Si el
 * backend marca el pronóstico como poco fiable, se avisa en la propia fila.
 */

import { AlertTriangle, PackageSearch, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getUnitSymbol } from "@/lib/units"

import { usePronostico } from "../hooks/use-pronostico"
import { formatPiezas, formatSemanaCorta, getEtiquetaMetodo } from "../utils"

export function DashboardPronostico() {
    const { data, isLoading, isError } = usePronostico()
    const productos = data?.productos ?? []
    const horizonte = data?.horizonteSemanas ?? 4

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        aria-hidden="true"
                    >
                        <TrendingUp className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Pronóstico de demanda</CardTitle>
                        <CardDescription className="text-foreground/60">
                            Unidades esperadas en las próximas {horizonte} semanas
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-5 pt-0 sm:px-6">
                {isLoading ? (
                    <div className="space-y-2.5" aria-busy="true">
                        <Skeleton className="h-28 w-full rounded-2xl" />
                        <Skeleton className="h-28 w-full rounded-2xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 px-6 py-12 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudo calcular el pronóstico</p>
                        <p className="text-sm text-muted-foreground">
                            Intenta de nuevo en unos minutos.
                        </p>
                    </div>
                ) : productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/70 px-6 py-14 text-center ring-1 ring-primary/10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <PackageSearch className="size-7 text-primary" aria-hidden="true" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Aún no hay historial suficiente</p>
                            <p className="text-sm text-muted-foreground">
                                Se necesitan al menos 8 semanas de ventas por producto para pronosticar.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {productos.map((producto) => {
                            const simbolo = getUnitSymbol(producto.unitType)
                            const total = producto.semanas.reduce((acc, s) => acc + s.unidades, 0)

                            return (
                                <li
                                    key={producto.productId}
                                    className="space-y-3 rounded-2xl bg-background/80 px-4 py-3.5 shadow-sm ring-1 ring-foreground/10"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 space-y-1">
                                            <p className="truncate text-sm font-medium leading-tight">
                                                {producto.nombre}
                                            </p>
                                            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                                <span className="truncate font-mono">{producto.sku}</span>
                                                <span aria-hidden="true">·</span>
                                                <span className="shrink-0">
                                                    {getEtiquetaMetodo(producto.metodo)}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="shrink-0 space-y-1 text-right">
                                            <p className="text-sm font-semibold tabular-nums">
                                                {formatPiezas(total)}{" "}
                                                <span className="text-xs font-normal text-muted-foreground">
                                                    {simbolo}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">en total</p>
                                        </div>
                                    </div>

                                    <div
                                        className="grid gap-2"
                                        style={{
                                            gridTemplateColumns: `repeat(${producto.semanas.length}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {producto.semanas.map((semana) => (
                                            <div
                                                key={semana.semana}
                                                className="rounded-xl bg-muted/50 px-2 py-1.5 text-center"
                                            >
                                                <p className="text-[11px] text-muted-foreground">
                                                    {formatSemanaCorta(semana.semana)}
                                                </p>
                                                <p className="text-sm font-medium tabular-nums">
                                                    {formatPiezas(semana.unidades)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        {producto.wape !== null ? (
                                            <p className="text-xs text-muted-foreground">
                                                Error en pruebas pasadas:{" "}
                                                <span className="tabular-nums">
                                                    {Math.round(producto.wape * 100)}%
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                Error no medido (pocos datos)
                                            </p>
                                        )}
                                        {!producto.confiable && (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 border-warning/40 text-warning"
                                            >
                                                <AlertTriangle className="size-3" aria-hidden="true" />
                                                Poco fiable
                                            </Badge>
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}