"use client"

/**
 * Paso 3 del carrito del Punto de Venta: resumen del pago definido,
 * detalle de la venta y confirmación final.
 *
 * Componente presentacional: recibe los items, los totales, el
 * formulario de pago y los callbacks desde el orquestador. No lee
 * estado global ni llama mutaciones.
 */

import { useMemo } from "react"
import { ArrowLeft, Check, Loader2, Receipt } from "lucide-react"
import { useWatch, type UseFormReturn } from "react-hook-form"

import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

import { METODOS_PAGO, TIPOS_VENTA } from "../constants"
import { formatSaleQuantity } from "../utils"
import type { PagoVentaInput, PagoVentaFormData } from "../schemas"
import type { VentaItem, VentasTotals } from "../types"
import { VentaCartTotals } from "./venta-cart"

interface VentaCartStepConfirmarProps {
    items: VentaItem[]
    totals: VentasTotals
    pagoMethods: UseFormReturn<PagoVentaInput, unknown, PagoVentaFormData>
    isSubmitting: boolean
    onGoBack: () => void
    onSubmitVenta: () => void
}

function labelFor(
    value: string,
    options: { value: string; label: string }[]
): string {
    return options.find((option) => option.value === value)?.label ?? value
}

export function VentaCartStepConfirmar({
    items,
    totals,
    pagoMethods,
    isSubmitting,
    onGoBack,
    onSubmitVenta,
}: VentaCartStepConfirmarProps) {
    const { control } = pagoMethods

    // useWatch (no watch) para que React Compiler no memorice valores
    // obsoletos del form al confirmar la venta.
    const tipoVenta = useWatch({ control, name: "tipoVenta" })
    const metodoPago = useWatch({ control, name: "metodoPago" })
    const pagoCon = useWatch({ control, name: "pagoCon" })
    const pagoData = { tipoVenta, metodoPago, pagoCon }
    const tipoVentaLabel = labelFor(pagoData.tipoVenta, TIPOS_VENTA)
    const metodoPagoLabel = labelFor(pagoData.metodoPago, METODOS_PAGO)

    const esEfectivo = pagoData.metodoPago === "efectivo"
    const pagoConRaw = pagoData.pagoCon
    const pagoConNumber =
        pagoConRaw === undefined || pagoConRaw === "" || pagoConRaw === null
            ? undefined
            : Number(pagoConRaw)
    const vueltoValido =
        esEfectivo && pagoConNumber !== undefined && pagoConNumber >= totals.total

    const methodsMap = useMemo(() => {
        const map = new Map(TIPOS_VENTA.map((o) => [o.value, o.label]))
        for (const option of METODOS_PAGO) map.set(option.value, option.label)
        return map
    }, [])

    const itemCount = items.length

    return (
        <>
            <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    <Receipt className="size-3.5 shrink-0" aria-hidden="true" />
                    Revisa los datos antes de confirmar la venta.
                </div>

                <div className="flex flex-col gap-4">
                    <div className="space-y-1.5 rounded-lg border border-border/70 bg-accent/30 p-3">
                        <p className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">Tipo de venta</span>
                            <span className="font-medium text-foreground">
                                {methodsMap.get(pagoData.tipoVenta) ?? tipoVentaLabel}
                            </span>
                        </p>
                        <p className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-muted-foreground">Método de pago</span>
                            <span className="font-medium text-foreground">
                                {methodsMap.get(pagoData.metodoPago) ?? metodoPagoLabel}
                            </span>
                        </p>
                        {esEfectivo && vueltoValido && (
                            <>
                                <p className="flex items-center justify-between gap-2 border-t border-border/60 pt-1.5 text-xs">
                                    <span className="text-muted-foreground">
                                        Monto recibido
                                    </span>
                                    <span className="font-medium tabular-nums text-foreground">
                                        {formatCurrency(pagoConNumber ?? 0)}
                                    </span>
                                </p>
                                <div className="flex items-center justify-between gap-2 rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs">
                                    <span className="font-medium text-emerald-800 dark:text-emerald-300">
                                        Vuelto
                                    </span>
                                    <span className="font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                                        {formatCurrency(
                                            (pagoConNumber ?? 0) - totals.total
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-xs font-medium text-muted-foreground">
                            Productos ({itemCount})
                        </p>
                        <ul className="flex max-h-40 flex-col divide-y divide-border/50 overflow-y-auto rounded-lg border border-border/60">
                            {items.map((item) => (
                                <li
                                    key={item.productId}
                                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
                                >
                                    <span className="min-w-0 truncate text-foreground">
                                        {item.name}
                                        <span className="ml-1.5 text-muted-foreground">
                                            × {formatSaleQuantity(item.quantity, item.unitType)}
                                        </span>
                                    </span>
                                    <span className="shrink-0 tabular-nums font-medium text-foreground">
                                        {formatCurrency(item.unitPrice * item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <VentaCartTotals totals={totals} />
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-4">
                <div className="flex w-full gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onGoBack}
                        disabled={isSubmitting}
                        className="h-11 flex-1 gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        <span>Volver</span>
                    </Button>
                    <Button
                        type="button"
                        onClick={onSubmitVenta}
                        disabled={isSubmitting}
                        className="h-11 flex-[2] gap-1.5 bg-emerald-600 font-medium shadow-sm hover:bg-emerald-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                <span>Registrando...</span>
                            </>
                        ) : (
                            <>
                                <Check className="size-4" aria-hidden="true" />
                                <span>Confirmar venta</span>
                            </>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </>
    )
}