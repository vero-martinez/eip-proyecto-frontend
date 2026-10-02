/**
 * Top de productos por facturación del Dashboard.
 *
 * El backend ya devuelve los cinco más vendidos del periodo, ordenados por
 * importe; aquí solo se presenta.
 */

import { PackageSearch, Trophy } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCurrency } from "@/lib/utils"

import type { ProductoTop } from "../types"
import { formatPiezas } from "../utils"

interface DashboardTopProductosProps {
    productos: ProductoTop[]
}

/** Estilos de la posición según el puesto (podio para los 3 primeros). */
const RANK_STYLES = [
    "bg-amber-100 text-amber-700 ring-amber-300/60 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/30",
    "bg-slate-100 text-slate-600 ring-slate-300/60 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30",
    "bg-orange-100 text-orange-700 ring-orange-300/60 dark:bg-orange-500/15 dark:text-orange-400 dark:ring-orange-500/30",
]

export function DashboardTopProductos({ productos }: DashboardTopProductosProps) {
    const totalTop = productos.reduce((acc, p) => acc + p.totalVentas, 0)

    return (
        <Card className="h-full overflow-hidden border-primary/20 bg-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6 pb-4">
                <div className="flex items-center gap-4">
                    <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                        aria-hidden="true"
                    >
                        <Trophy className="size-6" />
                    </div>
                    <div className="space-y-1">
                        <CardTitle className="text-lg">Top de productos</CardTitle>
                        <CardDescription className="text-foreground/60">
                            Mayor facturación del periodo
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-5 pt-0 sm:px-6">
                {productos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-background/70 px-6 py-14 text-center ring-1 ring-primary/10">
                        <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <PackageSearch className="size-7 text-primary" aria-hidden="true" />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Sin ventas todavía</p>
                            <p className="text-sm text-muted-foreground">
                                Cuando haya ventas en el periodo, verás aquí tus productos estrella.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ol className="space-y-2.5">
                        {productos.map((producto, index) => {
                            const porcentajeTotal =
                                totalTop > 0 ? (producto.totalVentas / totalTop) * 100 : 0
                            const esPodio = index < 3

                            return (
                                <li
                                    key={producto.productId}
                                    className="flex items-center gap-4 rounded-2xl bg-background/80 px-4 py-3.5 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:bg-background hover:shadow-md dark:ring-white/10"
                                >
                                    <span
                                        className={cn(
                                            "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums",
                                            esPodio
                                                ? cn("ring-1", RANK_STYLES[index])
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {index + 1}
                                    </span>

                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="truncate text-sm font-medium leading-tight">
                                            {producto.nombre}
                                        </p>
                                        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                            <span className="truncate font-mono">{producto.sku}</span>
                                            <span aria-hidden="true">·</span>
                                            <span className="shrink-0 tabular-nums">
                                                {formatPiezas(producto.piezasVendidas)}{" "}
                                                {producto.piezasVendidas === 1 ? "pieza" : "piezas"}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="shrink-0 space-y-1 text-right">
                                        <p className="text-sm font-semibold tabular-nums">
                                            {formatCurrency(producto.totalVentas)}
                                        </p>
                                        <p className="text-xs font-medium tabular-nums text-primary">
                                            {porcentajeTotal.toFixed(0)}%
                                        </p>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                )}
            </CardContent>
        </Card>
    )
}