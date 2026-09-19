"use client"

/**
 * Paso 2 del carrito del Punto de Venta: tipo de venta, método de pago,
 * bloque de efectivo/vuelto y totales.
 *
 * Componente presentacional: recibe los totales, el formulario de pago
 * y los callbacks desde el orquestador. No lee estado global ni llama
 * mutaciones.
 */

import { ArrowLeft, ArrowRight, Banknote, Check, CreditCard, Smartphone } from "lucide-react"
import { Controller, useWatch, type UseFormReturn } from "react-hook-form"

import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn, formatCurrency } from "@/lib/utils"

import { METODOS_PAGO, TIPOS_VENTA } from "../constants"
import type { PagoVentaInput, PagoVentaFormData } from "../schemas"
import type { VentasTotals } from "../types"
import { VentaCartTotals } from "./venta-cart"

interface VentaCartStepPagoProps {
    totals: VentasTotals
    pagoMethods: UseFormReturn<PagoVentaInput, unknown, PagoVentaFormData>
    onGoBack: () => void
    onConfirmPago: () => void
}

/** Ícono por método de pago, con fallback genérico si no reconoce el value. */
function getMetodoPagoIcon(value: string) {
    if (value.includes("efectivo")) return Banknote
    if (value.includes("tarjeta")) return CreditCard
    return Smartphone
}

export function VentaCartStepPago({
    totals,
    pagoMethods,
    onGoBack,
    onConfirmPago,
}: VentaCartStepPagoProps) {
    const {
        control,
        setValue,
        formState: { errors },
    } = pagoMethods

    // useWatch (no watch) para que React Compiler no memorice valores
    // obsoletos del form al seleccionar el método de pago.
    const tipoVenta = useWatch({ control, name: "tipoVenta" })
    const metodoPago = useWatch({ control, name: "metodoPago" })
    const pagoCon = useWatch({ control, name: "pagoCon" })
    const pagoData = { tipoVenta, metodoPago, pagoCon }

    const esEfectivo = pagoData.metodoPago === "efectivo"
    const pagoConRaw = pagoData.pagoCon
    const pagoConNumber =
        pagoConRaw === undefined || pagoConRaw === "" || pagoConRaw === null
            ? undefined
            : Number(pagoConRaw)
    const efectivoInsuficiente =
        esEfectivo && pagoConNumber !== undefined && pagoConNumber < totals.total
    const vueltoValido =
        esEfectivo && pagoConNumber !== undefined && pagoConNumber >= totals.total

    return (
        <>
            <CardContent className="flex flex-col gap-4 pt-4">
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Define cómo se realiza esta venta antes de confirmar.
                    </p>

                    <div className="space-y-2">
                        <Label htmlFor="venta-tipo" className="text-sm font-medium">
                            Tipo de venta
                            <span className="text-destructive"> *</span>
                        </Label>
                        <Controller
                            control={control}
                            name="tipoVenta"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={(value) =>
                                        field.onChange(value ?? "")
                                    }
                                >
                                    <SelectTrigger
                                        id="venta-tipo"
                                        className="w-full"
                                        aria-invalid={errors.tipoVenta ? true : undefined}
                                    >
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIPOS_VENTA.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.tipoVenta && (
                            <p className="text-xs font-medium text-destructive" role="alert">
                                {errors.tipoVenta.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Método de pago
                            <span className="text-destructive"> *</span>
                        </Label>
                        <Controller
                            control={control}
                            name="metodoPago"
                            render={({ field }) => (
                                <div
                                    className={cn(
                                        "grid gap-2",
                                        METODOS_PAGO.length === 3
                                            ? "grid-cols-3"
                                            : "grid-cols-2"
                                    )}
                                    role="radiogroup"
                                    aria-label="Método de pago"
                                    aria-invalid={errors.metodoPago ? true : undefined}
                                >
                                    {METODOS_PAGO.map((option) => {
                                        const Icon = getMetodoPagoIcon(option.value)
                                        const selected = field.value === option.value
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                role="radio"
                                                aria-checked={selected}
                                                onClick={() => field.onChange(option.value)}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
                                                    selected
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-border/70 text-muted-foreground hover:border-border hover:bg-muted/40"
                                                )}
                                            >
                                                <Icon className="size-4" aria-hidden="true" />
                                                <span className="leading-tight text-center">
                                                    {option.label}
                                                </span>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        />
                        {errors.metodoPago && (
                            <p className="text-xs font-medium text-destructive" role="alert">
                                {errors.metodoPago.message}
                            </p>
                        )}
                    </div>

                    {esEfectivo && (
                        <div className="space-y-2 rounded-lg border border-border/70 bg-muted/30 p-3">
                            <div className="flex items-center justify-between gap-2">
                                <Label
                                    htmlFor="venta-pago-con"
                                    className="text-sm font-medium"
                                >
                                    Monto recibido (S/)
                                    <span className="text-destructive"> *</span>
                                </Label>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-6 px-2 text-xs font-medium"
                                    onClick={() =>
                                        setValue(
                                            "pagoCon",
                                            String(totals.total)
                                        )
                                    }
                                >
                                    Exacto
                                </Button>
                            </div>
                            <Controller
                                control={control}
                                name="pagoCon"
                                render={({ field }) => (
                                    <Input
                                        id="venta-pago-con"
                                        type="number"
                                        inputMode="decimal"
                                        min="0"
                                        step="0.1"
                                        placeholder="0.00"
                                        value={field.value ?? ""}
                                        onChange={(event) =>
                                            field.onChange(event.target.value)
                                        }
                                        className="h-11 text-base font-semibold tabular-nums"
                                        aria-invalid={
                                            efectivoInsuficiente ||
                                            errors.pagoCon
                                                ? true
                                                : undefined
                                        }
                                    />
                                )}
                            />
                            {esEfectivo && pagoConNumber === undefined && (
                                <p
                                    className="text-xs font-medium text-destructive"
                                    role="alert"
                                >
                                    Ingresa el monto recibido en efectivo.
                                </p>
                            )}
                            {efectivoInsuficiente && (
                                <p
                                    className="text-xs font-medium text-destructive"
                                    role="alert"
                                >
                                    Falta{" "}
                                    {formatCurrency(
                                        totals.total - (pagoConNumber ?? 0)
                                    )}{" "}
                                    para completar el total.
                                </p>
                            )}
                            {errors.pagoCon && (
                                <p
                                    className="text-xs font-medium text-destructive"
                                    role="alert"
                                >
                                    {errors.pagoCon.message}
                                </p>
                            )}
                            {vueltoValido && (
                                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5">
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                        <Check className="size-4" aria-hidden="true" />
                                        Vuelto
                                    </span>
                                    <span className="text-base font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                                        {formatCurrency(
                                            (pagoConNumber ?? 0) - totals.total
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {!esEfectivo && pagoData.metodoPago && (
                        <p className="rounded-lg border border-border/70 bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                            Cobra{" "}
                            <span className="font-semibold tabular-nums text-foreground">
                                {formatCurrency(totals.total)}
                            </span>{" "}
                            con Yape / Plin.
                        </p>
                    )}

                    <VentaCartTotals totals={totals} />
                </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-border/60 pt-4">
                <div className="flex w-full gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onGoBack}
                        className="h-10 flex-1 gap-1.5"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        <span>Volver</span>
                    </Button>
                    <Button
                        type="button"
                        onClick={onConfirmPago}
                        disabled={esEfectivo && !vueltoValido}
                        className="h-10 flex-1 gap-1.5"
                    >
                        <span>Continuar</span>
                        <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                </div>
            </CardFooter>
        </>
    )
}