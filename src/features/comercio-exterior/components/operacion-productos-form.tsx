"use client"

/**
 * Editor de líneas de una operación de comercio exterior. Cada línea
 * combina un producto (SearchableSelect) con su cantidad y precio en
 * USD, más la remoción y el agregado de filas dinámicas.
 */

import { memo, useMemo } from "react"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/common/searchable-select"
import { cn, formatCurrency } from "@/lib/utils"
import { getUnitSymbol } from "@/lib/units"
import type { Product } from "@/types/products"
import type {
    FieldErrors,
    UseFieldArrayReturn,
    UseFormRegister,
    UseFormSetValue,
} from "react-hook-form"

import type { OperacionCreateSchema } from "../schemas/operacionCreateSchema"
import { formatUSD } from "../utils"
import type { TipoOperacion } from "../types"

interface OperacionProductosFormProps {
    products: Product[]
    tipo: TipoOperacion
    /** Líneas watch del formulario (para reflectar el estado en el select y subtotales). */
    lineas: OperacionCreateSchema["lineas"]
    fields: UseFieldArrayReturn<OperacionCreateSchema, "lineas">["fields"]
    register: UseFormRegister<OperacionCreateSchema>
    setValue: UseFormSetValue<OperacionCreateSchema>
    errors: FieldErrors<OperacionCreateSchema>
    montos: { subtotalUSD: number; totalUSD: number; totalPEN: number }
    getCantidadStep: (productId: number | undefined) => string | undefined
    onAppend: () => void
    onRemove: (index: number) => void
}

export const OperacionProductosForm = memo(function OperacionProductosForm({
    products,
    tipo,
    lineas,
    fields,
    register,
    setValue,
    errors,
    montos,
    getCantidadStep,
    onAppend,
    onRemove,
}: OperacionProductosFormProps) {
    const productOptions = useMemo(
        () =>
            products.map((product) => ({
                value: String(product.id),
                label: product.isActive
                    ? `${product.name} · ${product.sku}`
                    : `${product.name} · ${product.sku} (inactivo)`,
            })),
        [products]
    )

    const productById = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products]
    )

    return (
        <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
                <span>Productos</span>
                <span className="text-destructive">*</span>
            </Label>

            {errors.lineas?.message && (
                <p role="alert" className="text-xs font-medium text-destructive">
                    {errors.lineas.message}
                </p>
            )}

            <div className="space-y-3">
                {fields.map((field, index) => {
                    const watchedLine = lineas[index]
                    const productoId = watchedLine?.productoId
                    const product = productById.get(productoId)
                    const unitSymbol = product
                        ? getUnitSymbol(product.unitType)
                        : ""
                    const cantidad = watchedLine?.cantidad ?? 0
                    const precioUSD = watchedLine?.precioUSD ?? 0
                    const currentStock = product?.currentStock
                    const sobrepasaStock =
                        tipo === "exportacion" &&
                        productoId !== undefined &&
                        cantidad > 0 &&
                        currentStock !== undefined &&
                        cantidad > currentStock
                    const subtotal =
                        productoId && cantidad > 0 && precioUSD >= 0
                            ? formatUSD(cantidad * precioUSD)
                            : "—"

                    return (
                        <div
                            key={field.id}
                            className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3"
                        >
                            <div className="space-y-1.5">
                                <SearchableSelect
                                    value={productoId ? String(productoId) : ""}
                                    onValueChange={(value) =>
                                        setValue(`lineas.${index}.productoId`, Number(value), {
                                            shouldValidate: true,
                                        })
                                    }
                                    options={productOptions}
                                    placeholder="Seleccionar producto..."
                                    searchPlaceholder="Buscar por nombre o SKU..."
                                    emptyText="Sin productos"
                                    ariaLabel={`Producto de la línea ${index + 1}`}
                                    ariaInvalid={!!errors.lineas?.[index]?.productoId}
                                    ariaDescribedby={
                                        errors.lineas?.[index]?.productoId
                                            ? `linea-${index}-producto-error`
                                            : undefined
                                    }
                                    triggerClassName="w-full h-10"
                                />
                                {errors.lineas?.[index]?.productoId && (
                                    <p
                                        id={`linea-${index}-producto-error`}
                                        role="alert"
                                        className="text-xs font-medium text-destructive"
                                    >
                                        {errors.lineas?.[index]?.productoId?.message}
                                    </p>
                                )}
                            </div>

                            {product && (
                                <p
                                    className={cn(
                                        "text-xs font-medium",
                                        sobrepasaStock
                                            ? "text-destructive"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    Disponible: {currentStock} {unitSymbol}
                                    {sobrepasaStock &&
                                        " · Cantidad mayor al stock disponible"}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:items-end">
                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor={`linea-${index}-cantidad`}
                                        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        Cantidad {unitSymbol && `(${unitSymbol})`}
                                    </Label>
                                    <Input
                                        id={`linea-${index}-cantidad`}
                                        type="number"
                                        min="0.01"
                                        step={getCantidadStep(productoId)}
                                        placeholder="0"
                                        aria-invalid={
                                            errors.lineas?.[index]?.cantidad
                                                ? true
                                                : undefined
                                        }
                                        aria-describedby={
                                            errors.lineas?.[index]?.cantidad
                                                ? `linea-${index}-cantidad-error`
                                                : undefined
                                        }
                                        className="h-9"
                                        {...register(`lineas.${index}.cantidad`, {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    {errors.lineas?.[index]?.cantidad && (
                                        <p
                                            id={`linea-${index}-cantidad-error`}
                                            role="alert"
                                            className="text-xs font-medium text-destructive"
                                        >
                                            {errors.lineas?.[index]?.cantidad?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label
                                        htmlFor={`linea-${index}-precio`}
                                        className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                                    >
                                        Precio (US$)
                                    </Label>
                                    <Input
                                        id={`linea-${index}-precio`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        aria-invalid={
                                            errors.lineas?.[index]?.precioUSD
                                                ? true
                                                : undefined
                                        }
                                        aria-describedby={
                                            errors.lineas?.[index]?.precioUSD
                                                ? `linea-${index}-precio-error`
                                                : undefined
                                        }
                                        className="h-9"
                                        {...register(`lineas.${index}.precioUSD`, {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    {errors.lineas?.[index]?.precioUSD && (
                                        <p
                                            id={`linea-${index}-precio-error`}
                                            role="alert"
                                            className="text-xs font-medium text-destructive"
                                        >
                                            {errors.lineas?.[index]?.precioUSD?.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        Subtotal US$
                                    </Label>
                                    <p className="flex h-9 items-center truncate text-sm font-semibold tabular-nums text-foreground">
                                        {subtotal}
                                    </p>
                                </div>

                                <div className="flex items-end justify-end sm:justify-start">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="size-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        onClick={() => onRemove(index)}
                                        disabled={fields.length <= 1}
                                        aria-label={`Quitar línea ${index + 1}`}
                                    >
                                        <Trash2 className="size-4" aria-hidden="true" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAppend}
                className={cn("w-full gap-1.5 border-dashed")}
            >
                <Plus className="size-4" aria-hidden="true" />
                Agregar producto
            </Button>

            {/* Resumen de totales en vivo */}
            <div className="rounded-lg border border-border/70 bg-muted/30 p-3 text-sm">
                <dl className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Subtotal (US$)</dt>
                        <dd className="font-medium tabular-nums text-foreground">
                            {formatUSD(montos.subtotalUSD)}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Total (US$)</dt>
                        <dd className="font-bold tabular-nums text-foreground">
                            {formatUSD(montos.totalUSD)}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Equivalente (S/)</dt>
                        <dd className="font-medium tabular-nums text-foreground">
                            {formatCurrency(montos.totalPEN)}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
})