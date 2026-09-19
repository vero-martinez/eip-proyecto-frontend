"use client"

/**
 * Paso 1 del carrito del Punto de Venta: detalle de los items con
 * controles de cantidad, estado vacío y acciones (vaciar / siguiente).
 *
 * Componente presentacional: recibe los items y los callbacks desde el
 * orquestador. No lee estado global ni llama mutaciones.
 */

import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react"

import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"

import { formatSaleQuantity } from "../utils"
import type { VentaItem } from "../types"

interface VentaCartStepCarritoProps {
    items: VentaItem[]
    onIncrement: (productId: number) => void
    onDecrement: (productId: number) => void
    onSetQuantity: (productId: number, quantity: number) => void
    onRemove: (productId: number) => void
    onClear: () => void
    onGoNext: () => void
}

export function VentaCartStepCarrito({
    items,
    onIncrement,
    onDecrement,
    onSetQuantity,
    onRemove,
    onClear,
    onGoNext,
}: VentaCartStepCarritoProps) {
    const cartTotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    )
    const itemCount = items.length

    return (
        <>
            <CardContent className="flex flex-col gap-4 pt-4">
                {items.length ? (
                    <ul className="flex flex-col gap-2">
                        {items.map((item) => {
                            const lineTotal = item.unitPrice * item.quantity
                            const kg = item.unitType === "KILOGRAMO"
                            return (
                                <li
                                    key={item.productId}
                                    className="group rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-foreground">
                                                {item.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {item.sku}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            aria-label={`Quitar ${item.name}`}
                                            onClick={() => onRemove(item.productId)}
                                            className="text-muted-foreground/60 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                                        >
                                            <X className="size-3.5" aria-hidden="true" />
                                        </Button>
                                    </div>

                                    <div className="mt-2.5 flex items-center justify-between gap-2">
                                        {/* Controles de cantidad */}
                                        <div className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-muted/40 p-0.5">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label="Disminuir cantidad"
                                                onClick={() => onDecrement(item.productId)}
                                                className="rounded-md hover:bg-background"
                                            >
                                                <Minus className="size-3" aria-hidden="true" />
                                            </Button>
                                            <Input
                                                type="number"
                                                min={kg ? 0.01 : 1}
                                                step={kg ? 0.01 : 1}
                                                value={item.quantity}
                                                aria-label={`Cantidad de ${item.name}`}
                                                onChange={(event) =>
                                                    onSetQuantity(
                                                        item.productId,
                                                        Number(event.target.value)
                                                    )
                                                }
                                                className="h-7 w-14 border-none bg-transparent px-1 text-center text-sm font-medium tabular-nums shadow-none focus-visible:ring-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                aria-label="Aumentar cantidad"
                                                onClick={() => onIncrement(item.productId)}
                                                className="rounded-md hover:bg-background"
                                            >
                                                <Plus className="size-3" aria-hidden="true" />
                                            </Button>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-[11px] text-muted-foreground">
                                                {formatCurrency(item.unitPrice)}{" "}
                                                × {formatSaleQuantity(item.quantity, item.unitType)}
                                            </p>
                                            <p className="text-sm font-semibold tabular-nums text-foreground">
                                                {formatCurrency(lineTotal)}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2.5 py-10 text-center text-muted-foreground">
                        <div className="flex size-11 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50">
                            <ShoppingCart className="size-5 text-muted-foreground/70" aria-hidden="true" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium text-foreground">
                                Carrito vacío
                            </p>
                            <p className="text-xs">
                                Hacé clic en un producto para agregarlo.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-4">
                {itemCount > 0 && (
                    <div className="flex w-full items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-medium text-foreground">Total</span>
                            <span className="text-xs text-muted-foreground">
                                ({itemCount} {itemCount === 1 ? "item" : "items"})
                            </span>
                        </div>
                        <span className="text-base font-semibold tabular-nums text-foreground">
                            {formatCurrency(cartTotal)}
                        </span>
                    </div>
                )}

                {itemCount > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="self-end gap-1.5 text-muted-foreground hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        <span>Vaciar carrito</span>
                    </Button>
                )}
                <Button
                    type="button"
                    onClick={onGoNext}
                    disabled={items.length === 0 || items.some((i) => i.quantity <= 0)}
                    className="h-10 w-full gap-1.5 font-medium"
                >
                    <span>Siguiente</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
            </CardFooter>
        </>
    )
}