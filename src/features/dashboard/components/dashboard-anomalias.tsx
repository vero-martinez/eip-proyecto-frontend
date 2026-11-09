"use client"

/**
 * Anomalías del Dashboard (zona 3 de analítica).
 *
 * Muestra ventas, mermas y stocks fuera de lo habitual. El backend entrega la
 * explicación de cada caso y ya los ordena por gravedad.
 */

import { AlertTriangle, ScanSearch, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { useAnomalias } from "../hooks/use-anomalias"
import type { SeveridadAnomalia, TipoAnomalia } from "../types"
import { formatSemanaCorta } from "../utils"

/** Cuántas anomalías se muestran; el resto se resume en una línea. */
const MAX_VISIBLES = 6

const TIPOS: Record<TipoAnomalia, string> = {
    semana_atipica: "Ventas de la semana",
    movimiento_atipico: "Movimiento inusual",
    stock_negativo: "Stock negativo",
}

const SEVERIDADES: Record<SeveridadAnomalia, { label: string; className: string }> = {
    alta: { label: "Alta", className: "border-destructive/40 text-destructive" },
    media: { label: "Media", className: "border-warning/40 text-warning" },
}

function getCuando(tipo: TipoAnomalia, fecha: string | null): string | null {
    if (!fecha) return null
    return tipo === "semana_atipica"
        ? `Semana del ${formatSemanaCorta(fecha)}`
        : formatSemanaCorta(fecha)
}

export function DashboardAnomalias() {
    const { data, isLoading, isError } = useAnomalias()
    const anomalias = data?.anomalias ?? []
    const visibles = anomalias.slice(0, MAX_VISIBLES)
    const restantes = anomalias.length - visibles.length
    const semanas = data?.semanasRevisadas ?? 8

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        aria-hidden="true"
                    >
                        <ScanSearch className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Anomalías</CardTitle>
                        <CardDescription className="text-foreground/60">
                            {data && data.total > 0
                                ? `${data.total} ${data.total === 1 ? "caso" : "casos"} fuera de lo habitual (${data.altas} de gravedad alta)`
                                : `Ventas, mermas y stock de las últimas ${semanas} semanas`}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-5 pt-0 sm:px-6">
                {isLoading ? (
                    <div className="space-y-2.5" aria-busy="true">
                        <Skeleton className="h-16 w-full rounded-2xl" />
                        <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 px-6 py-12 text-center ring-1 ring-primary/10">
                        <AlertTriangle className="size-7 text-warning" aria-hidden="true" />
                        <p className="text-sm font-medium">No se pudieron revisar las anomalías</p>
                        <p className="text-sm text-muted-foreground">
                            Intenta de nuevo en unos minutos.
                        </p>
                    </div>
                ) : anomalias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/70 px-6 py-14 text-center ring-1 ring-primary/10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Sin anomalías detectadas</p>
                            <p className="text-sm text-muted-foreground">
                                Nada fuera de lo habitual en las últimas {semanas} semanas.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <ul className="space-y-2.5">
                            {visibles.map((item, index) => {
                                const severidad = SEVERIDADES[item.severidad]
                                const cuando = getCuando(item.tipo, item.fecha)

                                return (
                                    <li
                                        key={`${item.tipo}-${item.productId}-${item.fecha ?? "sin-fecha"}-${index}`}
                                        className="space-y-1.5 rounded-2xl bg-background/80 px-4 py-3.5 shadow-sm ring-1 ring-foreground/10"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 space-y-1">
                                                <p className="truncate text-sm font-medium leading-tight">
                                                    {item.nombre}
                                                </p>
                                                <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                                    <span className="truncate font-mono">{item.sku}</span>
                                                    <span aria-hidden="true">·</span>
                                                    <span className="shrink-0">{TIPOS[item.tipo]}</span>
                                                    {cuando && (
                                                        <>
                                                            <span aria-hidden="true">·</span>
                                                            <span className="shrink-0">{cuando}</span>
                                                        </>
                                                    )}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("shrink-0", severidad.className)}
                                            >
                                                {severidad.label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-foreground/80">{item.mensaje}</p>
                                    </li>
                                )
                            })}
                        </ul>

                        {restantes > 0 && (
                            <p className="mt-3 text-center text-xs text-muted-foreground">
                                y {restantes} {restantes === 1 ? "caso más" : "casos más"}
                            </p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}