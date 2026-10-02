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
                "overflow-hidden border bg-gradient-to-br shadow-sm",
                sinAlertas
                    ? "border-emerald-200 from-emerald-100 via-teal-50 to-emerald-50 dark:border-emerald-500/20 dark:from-emerald-500/20 dark:via-teal-500/10 dark:to-emerald-500/5"
                    : "border-amber-200 from-amber-100 via-orange-50 to-rose-50 dark:border-amber-500/20 dark:from-amber-500/20 dark:via-orange-500/10 dark:to-rose-500/10"
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className={cn(
                            "flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg",
                            sinAlertas
                                ? "bg-emerald-500 shadow-emerald-500/30"
                                : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-orange-500/30"
                        )}
                        aria-hidden="true"
                    >
                        {sinAlertas ? (
                            <PackageCheck className="size-6" />
                        ) : (
                            <AlertTriangle className="size-6" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Alertas de stock</CardTitle>
                        <CardDescription className="text-foreground/60">
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
                    <span className="hidden shrink-0 rounded-full bg-background/80 px-4 py-1.5 text-2xl font-bold tabular-nums text-orange-600 shadow-sm ring-1 ring-orange-500/20 sm:block dark:text-orange-400">
                        {alertas.total}
                    </span>
                )}
            </CardHeader>

            <CardContent className="flex flex-col gap-5 px-6 pb-6 pt-0">
                {sinAlertas ? (
                    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/70 px-6 py-12 text-center ring-1 ring-emerald-500/15 backdrop-blur">
                        <p className="text-base font-semibold">Todo en orden</p>
                        <p className="text-sm text-muted-foreground">
                            Todo el inventario está por encima de su mínimo.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Contadores */}
                        {contadores.length > 0 && (
                            <ul className="grid gap-3 sm:grid-cols-3">
                                {contadores.map((contador) => (
                                    <li
                                        key={contador.key}
                                        className="flex flex-col gap-3 rounded-2xl bg-background/80 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur dark:ring-white/10"
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
                                        <span className="text-4xl font-bold leading-none tabular-nums tracking-tight">
                                            {contador.cantidad}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Detalle */}
                        <div className="overflow-hidden rounded-2xl bg-background/90 shadow-sm ring-1 ring-black/5 backdrop-blur dark:ring-white/10">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b hover:bg-transparent">
                                        <TableHead className="h-12 px-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Producto
                                        </TableHead>
                                        <TableHead className="h-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Estado
                                        </TableHead>
                                        <TableHead className="h-12 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Stock
                                        </TableHead>
                                        <TableHead className="h-12 px-5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Faltantes
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibles.map((item) => {
                                        const presentacion = getAlertaEstadoItem(item.estado)
                                        const simbolo = getUnitSymbol(item.unitType)
                                        return (
                                            <TableRow
                                                key={item.productId}
                                                className="transition-colors hover:bg-orange-500/[0.06]"
                                            >
                                                <TableCell className="px-5 py-4">
                                                    <p className="truncate font-medium leading-tight">
                                                        {item.nombre}
                                                    </p>
                                                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                                                        {item.sku}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="py-4">
                                                    {presentacion && (
                                                        <Badge
                                                            variant={presentacion.variant}
                                                            className={presentacion.className}
                                                        >
                                                            {presentacion.label}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="py-4 text-right font-medium tabular-nums">
                                                    {formatPiezas(item.currentStock)}{" "}
                                                    <span className="text-xs font-normal text-muted-foreground">
                                                        {simbolo}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-right font-semibold tabular-nums text-rose-600 dark:text-rose-400">
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
                                <p className="border-t px-5 py-3 text-center text-xs text-muted-foreground">
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