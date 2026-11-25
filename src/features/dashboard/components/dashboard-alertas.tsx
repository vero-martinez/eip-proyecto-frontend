"use client"

import { AlertTriangle, PackageCheck, Package, Boxes } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"

import {
    ALERTA_CONTADOR_ITEMS,
    getAlertaEstadoItem,
    MAX_ALERTAS_DETALLADAS,
} from "../constants"
import type { AlertasStock } from "../types"
import { formatPiezas, getAlertasPriorizadas } from "../utils"

interface DashboardAlertasProps {
    alertas: AlertasStock
}

/** Porcentaje del stock mínimo que existe actualmente. */
function getNivelStock(currentStock: number, unidadesFaltantes: number) {
    const minimo = currentStock + unidadesFaltantes

    if (minimo <= 0 || unidadesFaltantes <= 0) return null

    return Math.max(
        0,
        Math.min(100, Math.round((currentStock / minimo) * 100))
    )
}

const COLORES_ESTADO = {
    agotado: "bg-destructive",
    bajo: "bg-warning",
    inactivo: "bg-muted-foreground",
} as const

const ICONOS_ESTADO = {
    agotado: AlertTriangle,
    bajo: Package,
    inactivo: Boxes,
} as const

export function DashboardAlertas({ alertas }: DashboardAlertasProps) {
    const priorizadas = getAlertasPriorizadas(alertas.items)
    const visibles = priorizadas.slice(0, MAX_ALERTAS_DETALLADAS)
    const restantes = priorizadas.length - visibles.length
    const sinAlertas = alertas.total === 0

    const contadores = ALERTA_CONTADOR_ITEMS.map((contador) => ({
        ...contador,
        cantidad: alertas[contador.key],
        presentacion: getAlertaEstadoItem(contador.estado),
    })).filter((contador) => contador.presentacion)

    return (
        <Card className="h-full min-w-0 overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            {/* Encabezado compacto */}
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-3 pb-2">
                <div className="flex min-w-0 items-center gap-2">
                    <div
                        className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            sinAlertas
                                ? "bg-success text-success-foreground"
                                : "bg-primary text-primary-foreground"
                        )}
                        aria-hidden="true"
                    >
                        {sinAlertas ? (
                            <PackageCheck className="size-4" />
                        ) : (
                            <AlertTriangle className="size-4" />
                        )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                        <CardTitle className="text-sm">
                            Alertas de stock
                        </CardTitle>

                        <CardDescription className="text-[11px] leading-tight">
                            {sinAlertas
                                ? "Inventario en orden"
                                : `${alertas.total} ${
                                      alertas.total === 1
                                          ? "producto requiere atención"
                                          : "productos requieren atención"
                                  }`}
                        </CardDescription>
                    </div>
                </div>

                <span className="shrink-0 text-xl font-semibold tabular-nums tracking-tight">
                    {alertas.total}
                </span>
            </CardHeader>

            <CardContent className="flex flex-col gap-2.5 px-3 pb-3 pt-0">
                {/* Contadores */}
                <dl className="grid grid-cols-3 gap-1.5">
                    {contadores.map((contador) => (
                        <div
                            key={contador.key}
                            className="flex min-w-0 flex-col gap-1 rounded-lg bg-background/80 p-2 shadow-sm ring-1 ring-foreground/10"
                        >
                            <dt className="min-w-0">
                                <Badge
                                    variant={contador.presentacion?.variant}
                                    className={cn(
                                        "max-w-full truncate px-1 py-0 text-[9px]",
                                        contador.presentacion?.className
                                    )}
                                >
                                    {contador.label}
                                </Badge>
                            </dt>

                            <dd className="text-lg font-semibold tabular-nums leading-none">
                                {contador.cantidad}
                            </dd>
                        </div>
                    ))}
                </dl>

                {sinAlertas ? (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg bg-background/70 px-3 py-6 text-center ring-1 ring-primary/10">
                        <PackageCheck
                            className="size-7 text-success"
                            aria-hidden="true"
                        />

                        <div className="space-y-0.5">
                            <p className="text-xs font-medium">
                                Todo en orden
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                El inventario está por encima de su mínimo.
                            </p>
                        </div>
                    </div>
                ) : (
                    <section className="space-y-2">
                        {/* Encabezado del detalle */}
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-xs font-semibold">
                                Productos con alertas
                            </h3>

                            <Badge variant="outline" className="shrink-0 text-[9px]">
                                {visibles.length} de {priorizadas.length}
                            </Badge>
                        </div>

                        {/* Alertas compactas */}
                        <div className="flex flex-col gap-1.5">
                            {visibles.map((item) => {
                                const presentacion = getAlertaEstadoItem(item.estado)
                                const Icono = ICONOS_ESTADO[item.estado]
                                const simbolo = getUnitSymbol(item.unitType)

                                const nivel = getNivelStock(
                                    item.currentStock,
                                    item.unidadesFaltantes
                                )

                                const stockMinimo =
                                    item.currentStock + item.unidadesFaltantes

                                return (
                                    <article
                                        key={item.productId}
                                        className="flex min-w-0 flex-col gap-2 rounded-lg bg-background/80 p-2.5 shadow-sm ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
                                    >
                                        {/* Producto y estado */}
                                        <div className="flex min-w-0 items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <div
                                                    className={cn(
                                                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                                                        item.estado === "agotado"
                                                            ? "bg-destructive/10 text-destructive"
                                                            : item.estado === "bajo"
                                                              ? "bg-warning/10 text-warning"
                                                              : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <Icono className="size-3.5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold leading-tight">
                                                        {item.nombre}
                                                    </p>
                                                    <p className="truncate font-mono text-[9px] text-muted-foreground">
                                                        {item.sku}
                                                    </p>
                                                </div>
                                            </div>

                                            {presentacion && (
                                                <Badge
                                                    variant={presentacion.variant}
                                                    className={cn(
                                                        "shrink-0 px-1.5 py-0 text-[9px]",
                                                        presentacion.className
                                                    )}
                                                >
                                                    {presentacion.label}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Stock y mínimo */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-[10px] text-muted-foreground">
                                                    Stock actual
                                                </span>

                                                <span className="text-xs font-semibold tabular-nums">
                                                    {formatPiezas(item.currentStock)} {simbolo}
                                                </span>
                                            </div>

                                            {nivel !== null ? (
                                                <div
                                                    className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
                                                    role="img"
                                                    aria-label={`${nivel}% del stock mínimo`}
                                                >
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all",
                                                            COLORES_ESTADO[item.estado]
                                                        )}
                                                        style={{ width: `${nivel}%` }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-1.5 w-full rounded-full bg-muted" />
                                            )}

                                            <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                                <span>Stock mínimo: {formatPiezas(stockMinimo)} {simbolo}</span>

                                                <span>
                                                    {nivel !== null ? `${nivel}%` : "Sin nivel"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Faltantes */}
                                        <div
                                            className={cn(
                                                "flex items-center justify-between gap-2 rounded-md px-2 py-1.5",
                                                item.estado === "agotado"
                                                    ? "bg-destructive/10"
                                                    : item.estado === "bajo"
                                                      ? "bg-warning/10"
                                                      : "bg-muted/70"
                                            )}
                                        >
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                Unidades faltantes
                                            </span>

                                            <span
                                                className={cn(
                                                    "text-xs font-bold tabular-nums",
                                                    item.estado === "agotado"
                                                        ? "text-destructive"
                                                        : item.estado === "bajo"
                                                          ? "text-warning"
                                                          : "text-foreground"
                                                )}
                                            >
                                                {formatPiezas(item.unidadesFaltantes)} {simbolo}
                                            </span>
                                        </div>
                                    </article>
                                )
                            })}
                        </div>

                        {restantes > 0 && (
                            <p className="pt-0.5 text-center text-[10px] text-muted-foreground">
                                y {restantes} producto{restantes === 1 ? "" : "s"} más con alerta
                            </p>
                        )}
                    </section>
                )}
            </CardContent>
        </Card>
    )
}