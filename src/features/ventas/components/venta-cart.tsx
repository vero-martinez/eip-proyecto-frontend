"use client"

/**
 * Card del carrito del Punto de Venta, con un flujo de 3 pasos:
 *   1. Carrito   — items, cantidades, subtotal.
 *   2. Pago      — tipo de venta y método de pago.
 *   3. Confirmar — resumen y registro de la venta.
 *
 * Orquestador presentacional: recibe el estado del carrito, el paso
 * actual, los métodos del formulario de pago y los callbacks desde el
 * container, y monta el paso activo. No lee estado global ni llama
 * mutaciones.
 */

import { Check, ShoppingCart } from "lucide-react"
import type { UseFormReturn } from "react-hook-form"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

import type { PagoVentaInput, PagoVentaFormData } from "../schemas"
import type { VentaItem, VentasTotals } from "../types"
import { VentaCartStepCarrito } from "./venta-cart-step-carrito"
import { VentaCartStepPago } from "./venta-cart-step-pago"
import { VentaCartStepConfirmar } from "./venta-cart-step-confirmar"

interface VentaCartProps {
    items: VentaItem[]
    totals: VentasTotals
    step: number
    isSubmitting: boolean
    pagoMethods: UseFormReturn<PagoVentaInput, unknown, PagoVentaFormData>
    onIncrement: (productId: number) => void
    onDecrement: (productId: number) => void
    onSetQuantity: (productId: number, quantity: number) => void
    onRemove: (productId: number) => void
    onClear: () => void
    onGoNext: () => void
    onGoBack: () => void
    onConfirmPago: () => void
    onSubmitVenta: () => void
}

interface StepMeta {
    label: string
}

const STEPS: StepMeta[] = [
    { label: "Carrito" },
    { label: "Pago" },
    { label: "Confirmar" },
]

export function VentaCart({
    items,
    totals,
    step,
    isSubmitting,
    pagoMethods,
    onIncrement,
    onDecrement,
    onSetQuantity,
    onRemove,
    onClear,
    onGoNext,
    onGoBack,
    onConfirmPago,
    onSubmitVenta,
}: VentaCartProps) {
    return (
        <Card className="overflow-hidden border-border/80 pt-0 shadow-sm lg:sticky lg:top-6">
            {/* Cabecera */}
            <CardHeader className="border-b border-border/60 bg-muted/20 pb-4 pt-5">
                <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                            <ShoppingCart className="size-4" aria-hidden="true" />
                        </span>
                        <div className="flex flex-col gap-1">
                            <CardTitle className="text-base font-semibold leading-tight">
                                Venta actual
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">
                                {totals.itemsCount} producto
                                {totals.itemsCount !== 1 ? "s" : ""} ·{" "}
                                {totals.quantity} unidades en total
                            </CardDescription>
                        </div>
                    </div>
                    <span className="shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
                        {formatCurrency(totals.total)}
                    </span>
                </div>

                {/* Indicador de pasos: nodos numerados unidos por una línea */}
                <ol className="mt-5 flex items-center">
                    {STEPS.map((meta, index) => {
                        const active = step === index
                        const done = step > index
                        const isLast = index === STEPS.length - 1
                        return (
                            <li
                                key={meta.label}
                                className={cn(
                                    "flex items-center",
                                    !isLast && "flex-1"
                                )}
                            >
                                <div className="flex flex-col items-center gap-1.5">
                                    <span
                                        className={cn(
                                            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                                            active &&
                                                "bg-primary text-primary-foreground ring-4 ring-primary/15",
                                            done &&
                                                "bg-success text-success-foreground",
                                            !active &&
                                                !done &&
                                                "bg-muted text-muted-foreground"
                                        )}
                                        aria-current={active ? "step" : undefined}
                                    >
                                        {done ? (
                                            <Check className="size-3.5" aria-hidden="true" />
                                        ) : (
                                            index + 1
                                        )}
                                    </span>
                                    <span
                                        className={cn(
                                            "hidden text-[11px] font-medium sm:inline",
                                            active
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {meta.label}
                                    </span>
                                </div>
                                {!isLast && (
                                    <div
                                        className={cn(
                                            "mx-1.5 h-0.5 flex-1 rounded-full transition-colors",
                                            done ? "bg-success/60" : "bg-muted"
                                        )}
                                        aria-hidden="true"
                                    />
                                )}
                            </li>
                        )
                    })}
                </ol>
            </CardHeader>

            {/* Paso activo: contenido + acciones */}
            {step === 0 && (
                <VentaCartStepCarrito
                    items={items}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                    onSetQuantity={onSetQuantity}
                    onRemove={onRemove}
                    onClear={onClear}
                    onGoNext={onGoNext}
                />
            )}

            {step === 1 && (
                <VentaCartStepPago
                    totals={totals}
                    pagoMethods={pagoMethods}
                    onGoBack={onGoBack}
                    onConfirmPago={onConfirmPago}
                />
            )}

            {step === 2 && (
                <VentaCartStepConfirmar
                    items={items}
                    totals={totals}
                    pagoMethods={pagoMethods}
                    isSubmitting={isSubmitting}
                    onGoBack={onGoBack}
                    onSubmitVenta={onSubmitVenta}
                />
            )}
        </Card>
    )
}

/**
 * Bloque de totales del carrito (subtotal y total).
 */
export function VentaCartTotals({ totals }: { totals: VentasTotals }) {
    return (
        <div className="flex flex-col gap-1 rounded-lg border border-border/70 bg-muted/40 p-3">
            <p className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
            </p>
            <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-bold tabular-nums text-foreground">
                    {formatCurrency(totals.total)}
                </span>
            </div>
        </div>
    )
}