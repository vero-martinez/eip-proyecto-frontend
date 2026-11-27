import { PackageSearch, Trophy } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

import type { ProductoTop } from "../types"
import { formatPiezas } from "../utils"

interface DashboardTopProductosProps {
    productos: ProductoTop[]
}

const RANK_STYLES = [
    "bg-warning/15 text-warning ring-warning/30",
    "bg-muted-foreground/15 text-muted-foreground ring-muted-foreground/30",
    "bg-cat-5/15 text-cat-5 ring-cat-5/30",
]

export function DashboardTopProductos({ productos }: DashboardTopProductosProps) {
    const visibles = productos.slice(0, 5)
    const totalTop = visibles.reduce((acc, producto) => acc + producto.totalVentas, 0)

    return (
        <Card className="flex h-full min-w-0 flex-col overflow-hidden border-primary/20 bg-primary/10 shadow-sm">
            <CardHeader className="shrink-0 space-y-1 p-4 pb-2">
                <div className="flex items-center gap-3">
                    <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                        aria-hidden="true"
                    >
                        <Trophy className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-1">
                        <CardTitle className="text-xl">Productos favoritos</CardTitle>
                        <CardDescription className="text-xs">
                            Los que más facturan
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 px-4 pb-4 pt-0">
                {visibles.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl bg-background/70 px-4 py-10 text-center ring-1 ring-primary/10">
                        <PackageSearch className="size-7 text-primary" aria-hidden="true" />
                        <p className="text-sm font-medium">Sin ventas todavía</p>
                        <p className="text-xs text-muted-foreground">
                            Cuando haya ventas en el periodo, verás aquí tus productos estrella.
                        </p>
                    </div>
                ) : (
                    <ol className="flex w-full flex-col divide-y divide-border/60">
                        {visibles.map((producto, index) => {
                            const porcentaje = totalTop > 0
                                ? (producto.totalVentas / totalTop) * 100
                                : 0

                            return (
                                <li
                                    key={producto.productId}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    <span
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
                                            index < 3
                                                ? `ring-1 ${RANK_STYLES[index]}`
                                                : "bg-muted text-muted-foreground"
                                        }`}
                                    >
                                        {index + 1}
                                    </span>

                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="truncate text-sm font-medium leading-tight">
                                            {producto.nombre}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {formatPiezas(producto.piezasVendidas)} piezas · {porcentaje.toFixed(0)}%
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-semibold tabular-nums">
                                        {formatCurrency(producto.totalVentas)}
                                    </p>
                                </li>
                            )
                        })}
                    </ol>
                )}
            </CardContent>
        </Card>
    )
}
