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
    "bg-warning/15 text-warning ring-warning/30",
    "bg-muted-foreground/15 text-muted-foreground ring-muted-foreground/30",
    "bg-cat-5/15 text-cat-5 ring-cat-5/30",
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
                                    className="flex items-center gap-4 rounded-2xl bg-background/80 px-4 py-3.5 shadow-sm ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:bg-background hover:shadow-md"
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