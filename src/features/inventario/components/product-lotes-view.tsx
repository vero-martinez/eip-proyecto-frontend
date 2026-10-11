/**
 * Componente de visualización de lotes por producto.
 * Renderiza la lista de lotes con stock disponible y el total sumario.
 */

import { Hash, Layers, PackageOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

import type { Lote } from "../types"
import {
    costoPromedioPonderado,
    getOrigenLoteInfo,
    sumDisponible,
} from "../utils"

interface ProductLotesViewProps {
    lotes: Lote[]
    /** Muestra u oculta los costos (información sensible). */
    showCost: boolean
    unitSymbol?: string
}

export function ProductLotesView({
    lotes,
    showCost,
    unitSymbol = "u",
}: ProductLotesViewProps) {
    // Solo se listan los lotes con stock disponible: un lote agotado (disponible 0) ya no forma parte del saldo.
    const conStock = lotes.filter((lote) => lote.cantidadDisponible > 0)
    const ordenados = [...conStock].sort(
        (a, b) =>
            new Date(a.fechaIngreso).getTime() -
            new Date(b.fechaIngreso).getTime() || a.id - b.id
    )

    const disponible = sumDisponible(ordenados)
    const promedio = costoPromedioPonderado(ordenados)

    return (
        <div className="space-y-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Layers className="size-4" aria-hidden="true" />
                Lotes
            </p>

            {ordenados.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
                    <PackageOpen className="size-4 shrink-0" aria-hidden="true" />
                    {conStock.length === 0
                        ? "Sin partidas. Registrá una entrada o creá el producto con stock inicial."
                        : "Sin lotes con stock disponible."}
                </div>
            ) : (
                <ul className="space-y-2">
                    {ordenados.map((lote) => {
                        const origen = getOrigenLoteInfo(lote.origen)

                        return (
                            <li
                                key={lote.id}
                                className="rounded-lg border border-border bg-muted/20 p-3"
                            >
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <Badge
                                        variant="outline"
                                        className="gap-1 border-transparent bg-foreground/5 px-2 py-0.5 font-mono font-semibold text-foreground"
                                    >
                                        <Hash className="size-3" aria-hidden="true" />
                                        {lote.codigo}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={cn("border-transparent", origen.tint)}
                                    >
                                        {origen.label}
                                    </Badge>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                        {formatDate(lote.fechaIngreso)}
                                    </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
                                    <span className="font-medium tabular-nums">
                                        {lote.cantidadInicial} → {lote.cantidadDisponible}{" "}
                                        {unitSymbol}
                                    </span>
                                    {showCost && (
                                        <span className="text-xs tabular-nums text-muted-foreground">
                                            Costo: {formatCurrency(lote.costoUnitarioSoles)}
                                        </span>
                                    )}
                                </div>

                                {lote.proveedor && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Proveedor:{" "}
                                        <span className="font-medium text-foreground">
                                            {lote.proveedor.name}
                                        </span>
                                    </p>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}

            {ordenados.length > 0 && (
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                    <span className="text-xs font-medium text-muted-foreground">
                        Disponible (Σ lotes)
                    </span>
                    <span className="font-semibold tabular-nums">
                        {disponible} {unitSymbol}
                        {showCost && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                · Costo promedio: {formatCurrency(promedio)}
                            </span>
                        )}
                    </span>
                </div>
            )}
        </div>
    )
}