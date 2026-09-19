"use client"

/**
 * Card de registro de merma: selector de producto con búsqueda,
 * cantidad a descontar, motivo buscable y detalle opcional.
 */

import { useMemo } from "react"
import {
    AlertTriangle,
    FileText,
    Hash,
    Loader2,
    Package,
    PackageMinus,
    Trash2,
} from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import { formatStock, hasLowStock, UNIT_OPTIONS } from "@/features/products/utils"
import type { Product } from "@/types/products"

import { MOTIVOS_MERMA } from "../constants"
import { useMermaForm } from "../hooks/use-merma-form"

const FORM_ID = "merma-form"

interface MermaFormProps {
    products: Product[]
    /** Nombre de la persona que registra el ajuste (usuario logueado). */
    responsable: string
}

export function MermaForm({ products, responsable }: MermaFormProps) {
    const {
        methods,
        isSubmitting,
        selectedProduct,
        motivo,
        quantityStep,
        handleProductChange,
        handleMotivoChange,
        onSubmit,
    } = useMermaForm({ products, responsable })

    const {
        register,
        formState: { errors },
    } = methods

    const productOptions = useMemo(
        () =>
            products
                .filter((product) => product.isActive)
                .map((product) => ({
                    value: String(product.id),
                    label: `${product.name} · ${product.sku}`,
                })),
        [products]
    )

    const unitSymbol =
        UNIT_OPTIONS.find((option) => option.value === selectedProduct?.unitType)
            ?.symbol ?? "u"

    const productIsLow = selectedProduct ? hasLowStock(selectedProduct) : false

    return (
        <Card className="border-border/70 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive ring-1 ring-destructive/20">
                        <PackageMinus className="size-4" aria-hidden="true" />
                    </span>

                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            Registrar merma
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Descontá stock de un producto por descarte o pérdida.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <form
                    id={FORM_ID}
                    noValidate
                    onSubmit={onSubmit}
                    className="flex flex-col gap-5"
                >
                    {/* Selector de Producto */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="merma-product"
                            className="flex items-center gap-2 text-base font-medium"
                        >
                            <Package className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            <span>Producto</span>
                            <span className="text-destructive">*</span>
                        </Label>
                        <SearchableSelect
                            value={selectedProduct ? String(selectedProduct.id) : ""}
                            onValueChange={handleProductChange}
                            options={productOptions}
                            placeholder="Seleccionar producto..."
                            searchPlaceholder="Buscar por nombre o SKU..."
                            ariaLabel="Producto"
                            ariaInvalid={!!errors.productId}
                            ariaDescribedby={
                                errors.productId ? "merma-product-error" : undefined
                            }
                            triggerClassName="w-full h-10"
                        />
                        {errors.productId && (
                            <p
                                id="merma-product-error"
                                role="alert"
                                className="text-xs font-medium text-destructive"
                            >
                                {errors.productId.message}
                            </p>
                        )}

                        {/* Banner contextual del producto seleccionado */}
                        {selectedProduct && (
                            <div className="mt-2.5 animate-in fade-in-50 slide-in-from-top-1 duration-200 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-muted-foreground">
                                            Stock actual:
                                        </span>
                                        <span className="text-sm font-semibold text-foreground">
                                            {formatStock(selectedProduct)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <span>Alerta mín:</span>
                                        <span className="font-medium text-foreground">
                                            {selectedProduct.minStockAlert} {unitSymbol}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-2 flex items-center gap-1.5 border-t border-black/5 pt-2 font-medium dark:border-white/10">
                                    {productIsLow ? (
                                        <>
                                            <AlertTriangle className="size-3.5 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                                            <span>Stock bajo — revisá el descarte antes de confirmar.</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                                            <span>Stock disponible en nivel óptimo.</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid para Cantidad y Motivo */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Input de Cantidad */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="merma-quantity"
                                className="flex items-center gap-2 text-base font-medium"
                            >
                                <Hash className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                <span>Cantidad a descontar</span>
                                <span className="text-destructive">*</span>
                            </Label>
                            <InputGroup className="h-10">
                                <InputGroupInput
                                    id="merma-quantity"
                                    type="number"
                                    min="0.01"
                                    step={quantityStep}
                                    placeholder="0.00"
                                    className="h-full"
                                    aria-invalid={errors.quantity ? true : undefined}
                                    aria-describedby={
                                        errors.quantity
                                            ? "merma-quantity-error"
                                            : undefined
                                    }
                                    {...register("quantity", { valueAsNumber: true })}
                                />
                                <InputGroupAddon align="inline-end" className="h-full">
                                    <InputGroupText className="text-xs font-medium text-muted-foreground">
                                        {unitSymbol}
                                    </InputGroupText>
                                </InputGroupAddon>
                            </InputGroup>
                            {errors.quantity && (
                                <p
                                    id="merma-quantity-error"
                                    role="alert"
                                    className="text-xs font-medium text-destructive"
                                >
                                    {errors.quantity.message}
                                </p>
                            )}
                        </div>

                        {/* Selector de Motivo */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="merma-motivo"
                                className="flex items-center gap-2 text-base font-medium"
                            >
                                <Trash2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                <span>Motivo</span>
                                <span className="text-destructive">*</span>
                            </Label>
                            <SearchableSelect
                                value={motivo ?? ""}
                                onValueChange={handleMotivoChange}
                                options={MOTIVOS_MERMA}
                                placeholder="Seleccionar motivo..."
                                searchPlaceholder="Buscar motivo..."
                                ariaLabel="Motivo"
                                ariaInvalid={!!errors.motivo}
                                ariaDescribedby={
                                    errors.motivo ? "merma-motivo-error" : undefined
                                }
                                triggerClassName="w-full h-10"
                            />
                            {errors.motivo && (
                                <p
                                    id="merma-motivo-error"
                                    role="alert"
                                    className="text-xs font-medium text-destructive"
                                >
                                    {errors.motivo.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Detalle (opcional) */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="merma-detalle"
                            className="flex items-center gap-2 text-base font-medium"
                        >
                            <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            <span>Detalle</span>
                            <span className="text-[10px] text-muted-foreground/70">(Opcional)</span>
                        </Label>
                        <Textarea
                            id="merma-detalle"
                            rows={3}
                            placeholder="Comentario adicional sobre el ajuste (ej: lote afectado, observaciones)..."
                            aria-invalid={errors.detalle ? true : undefined}
                            aria-describedby={
                                errors.detalle ? "merma-detalle-error" : undefined
                            }
                            {...register("detalle")}
                        />
                        {errors.detalle && (
                            <p
                                id="merma-detalle-error"
                                role="alert"
                                className="text-xs font-medium text-destructive"
                            >
                                {errors.detalle.message}
                            </p>
                        )}
                    </div>

                    {/* Botón Acción Principal */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 h-10 w-full font-medium transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                <span>Registrando merma...</span>
                            </>
                        ) : (
                            <>
                                <PackageMinus className="size-4" aria-hidden="true" />
                                <span>Registrar merma</span>
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}