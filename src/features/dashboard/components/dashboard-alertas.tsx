/**
 * Alertas de stock del Dashboard.
 *
 * El backend cuenta y clasifica los productos con problemas de inventario
 * (agotado, stock bajo o inactivo); aquí se muestran los contadores y el
 * detalle de los casos más severos.
 */

import { AlertTriangle, PackageCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
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

/** Porcentaje (0-100) del mínimo requerido que hay en existencia. */
function getNivelStock(currentStock: number, unidadesFaltantes: number) {
    const minimo = currentStock + unidadesFaltantes
    if (minimo <= 0 || unidadesFaltantes <= 0) return null
    return Math.max(0, Math.min(100, Math.round((currentStock / minimo) * 100)))
}

export function DashboardAlertas({ alertas }: DashboardAlertasProps) {
    const priorizadas = getAlertasPriorizadas(alertas.items)
    const visibles = priorizadas.slice(0, MAX_ALERTAS_DETALLADAS)
    const restantes = priorizadas.length - visibles.length
    const sinAlertas = alertas.total === 0

    const contadores = ALERTA_CONTADOR_ITEMS.map((contador) => ({
        ...contador,
        cantidad: alertas[contador.key],
        presentacion: getAlertaEstadoItem(contador.estado),
    })).filter((c) => c.presentacion && c.cantidad > 0)

    return (
        <Card
            className={cn(
                "overflow-hidden border-l-4 shadow-none",
                sinAlertas ? "border-l-emerald-500" : "border-l-amber-500"
            )}
        >
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-5 sm:p-6">
                <div className="flex items-center gap-3.5">
                    <div
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-lg",
                            sinAlertas
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        )}
                        aria-hidden="true"
                    >
                        {sinAlertas ? (
                            <PackageCheck className="size-5" />
                        ) : (
                            <AlertTriangle className="size-5" />
                        )}
                    </div>
                    <div className="space-y-0.5">
                        <CardTitle className="text-base font-semibold">Alertas de stock</CardTitle>
                        <CardDescription>
                            {sinAlertas
                                ? "Sin alertas activas"
                                : `${alertas.total} ${
                                      alertas.total === 1
                                          ? "producto requiere"
                                          : "productos requieren"
                                  } atención`}
                        </CardDescription>
                    </div>
                </div>

                {!sinAlertas && (
                    <span
                        className="text-4xl font-semibold leading-none tabular-nums tracking-tight"
                        aria-hidden="true"
                    >
                        {alertas.total}
                    </span>
                )}
            </CardHeader>

            <CardContent className="flex flex-col gap-5 px-5 pb-5 pt-0 sm:px-6 sm:pb-6">
                {sinAlertas ? (
                    <div className="rounded-lg border border-dashed py-10 text-center">
                        <p className="text-sm font-medium">Todo en orden</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Todo el inventario está por encima de su mínimo.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Contadores: una sola banda dividida en segmentos */}
                        {contadores.length > 0 && (
                            <ul className="grid grid-cols-1 divide-y overflow-hidden rounded-lg border sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))] sm:divide-x sm:divide-y-0">
                                {contadores.map((contador) => (
                                    <li
                                        key={contador.key}
                                        className="flex items-center justify-between gap-3 px-4 py-3.5 sm:flex-col sm:items-start sm:gap-2.5"
                                    >
                                        <Badge
                                            variant={contador.presentacion?.variant}
                                            className={cn(
                                                "w-fit",
                                                contador.presentacion?.className
                                            )}
                                        >
                                            {contador.label}
                                        </Badge>
                                        <span className="text-3xl font-semibold leading-none tabular-nums tracking-tight">
                                            {contador.cantidad}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Detalle */}
                        <div className="overflow-hidden rounded-lg border">
                            <Table>
                                <TableHeader className="bg-muted/40">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">
                                            Producto
                                        </TableHead>
                                        <TableHead className="h-10 text-xs font-medium text-muted-foreground">
                                            Estado
                                        </TableHead>
                                        <TableHead className="h-10 min-w-36 text-xs font-medium text-muted-foreground">
                                            Stock
                                        </TableHead>
                                        <TableHead className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                                            Faltantes
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibles.map((item) => {
                                        const presentacion = getAlertaEstadoItem(item.estado)
                                        const simbolo = getUnitSymbol(item.unitType)
                                        const nivel = getNivelStock(
                                            item.currentStock,
                                            item.unidadesFaltantes
                                        )
                                        return (
                                            <TableRow key={item.productId}>
                                                <TableCell className="max-w-56 px-4 py-3">
                                                    <p className="truncate text-sm font-medium leading-tight">
                                                        {item.nombre}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                        {item.sku}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    {presentacion && (
                                                        <Badge
                                                            variant={presentacion.variant}
                                                            className={presentacion.className}
                                                        >
                                                            {presentacion.label}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-3">
                                                    <p className="text-sm font-medium tabular-nums">
                                                        {formatPiezas(item.currentStock)}{" "}
                                                        <span className="text-xs font-normal text-muted-foreground">
                                                            {simbolo}
                                                        </span>
                                                    </p>
                                                    {nivel !== null && (
                                                        <div
                                                            className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted"
                                                            role="img"
                                                            aria-label={`${nivel}% del stock mínimo`}
                                                        >
                                                            <div
                                                                className="h-full rounded-full bg-amber-500"
                                                                style={{ width: `${nivel}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                                                    {item.unidadesFaltantes > 0 ? "−" : ""}
                                                    {formatPiezas(item.unidadesFaltantes)}{" "}
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        {simbolo}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>

                            {restantes > 0 && (
                                <p className="border-t bg-muted/40 px-4 py-2.5 text-center text-xs text-muted-foreground">
                                    y {restantes} producto{restantes === 1 ? "" : "s"} más con
                                    alerta
                                </p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}