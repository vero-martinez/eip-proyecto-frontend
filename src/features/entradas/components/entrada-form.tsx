"use client"

/**
 * Card de registro de entrada: selector de producto con búsqueda,
 * cantidad y botón para registrar.
 */

import { useMemo } from "react"
import {
    AlertTriangle,
    CheckCircle2,
    Hash,
    Loader2,
    Package,
    PackagePlus,
    Truck,
} from "lucide-react"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import { formatStock, hasLowStock, UNIT_OPTIONS } from "@/features/products/utils"
import type { Product } from "@/types/products"

import type { Proveedor } from "../types"
import { useStockEntryForm } from "../hooks/use-entrada-form"

const FORM_ID = "stock-entry-form"

interface EntradaFormProps {
    products: Product[]
    proveedores: Proveedor[]
    /** Nombre de la persona que registra la entrada (usuario logueado). */
    responsable: string
}

export function EntradaForm({ products, proveedores, responsable }: EntradaFormProps) {
    const {
        methods,
        isSubmitting,
        selectedProduct,
        selectedProveedor,
        quantityStep,
        handleProductChange,
        handleProveedorChange,
        onSubmit,
    } = useStockEntryForm({ products, proveedores, responsable })

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

    const proveedorOptions = useMemo(
        () => [
            { value: "", label: "Sin especificar" },
            ...proveedores.map((proveedor) => ({
                value: String(proveedor.id),
                label: proveedor.name,
            })),
        ],
        [proveedores]
    )

    const unitSymbol =
        UNIT_OPTIONS.find((option) => option.value === selectedProduct?.unitType)
            ?.symbol ?? "u"

    const productIsLow = selectedProduct ? hasLowStock(selectedProduct) : false

    return (
        <Card className="border-border/70 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                        <PackagePlus className="size-4" aria-hidden="true" />
                    </span>

                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            Registrar entrada
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Sumá stock de un producto al inventario del taller.
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
                            htmlFor="stock-entry-product"
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
                                errors.productId ? "stock-entry-product-error" : undefined
                            }
                            triggerClassName="w-full h-10"
                        />
                        {errors.productId && (
                            <p
                                id="stock-entry-product-error"
                                role="alert"
                                className="text-xs font-medium text-destructive"
                            >
                                {errors.productId.message}
                            </p>
                        )}

                        {/* Banner contextual del producto seleccionado */}
                        {selectedProduct && (
                            <div
                                className={`mt-2.5 animate-in fade-in-50 slide-in-from-top-1 duration-200 rounded-lg border p-3 text-xs ${
                                    productIsLow
                                        ? "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200"
                                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200"
                                }`}
                            >
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
                                            <span>Stock bajo — se sugiere reponer inmediatamente.</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                                            <span>Stock en nivel óptimo.</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Grid para Proveedor y Cantidad */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Selector de Proveedor */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2 text-base font-medium">
                                <Truck className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                <span>Proveedor</span>
                                <span className="text-[10px] text-muted-foreground/70">(Opcional)</span>
                            </Label>
                            <SearchableSelect
                                value={selectedProveedor ? String(selectedProveedor.id) : ""}
                                onValueChange={handleProveedorChange}
                                options={proveedorOptions}
                                placeholder="Seleccionar..."
                                searchPlaceholder="Buscar proveedor..."
                                ariaLabel="Proveedor"
                                triggerClassName="w-full h-10"
                            />
                        </div>

                        {/* Input de Cantidad */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="stock-entry-quantity"
                                className="flex items-center gap-2 text-base font-medium"
                            >
                                <Hash className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                <span>Cantidad</span>
                                <span className="text-destructive">*</span>
                            </Label>
                            <InputGroup className="h-10">
                                <InputGroupInput
                                    id="stock-entry-quantity"
                                    type="number"
                                    min="0.01"
                                    step={quantityStep}
                                    placeholder="0.00"
                                    className="h-full"
                                    aria-invalid={errors.quantity ? true : undefined}
                                    aria-describedby={
                                        errors.quantity
                                            ? "stock-entry-quantity-error"
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
                                    id="stock-entry-quantity-error"
                                    role="alert"
                                    className="text-xs font-medium text-destructive"
                                >
                                    {errors.quantity.message}
                                </p>
                            )}
                        </div>
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
                                <span>Registrando ingreso...</span>
                            </>
                        ) : (
                            <>
                                <PackagePlus className="size-4" aria-hidden="true" />
                                <span>Registrar entrada</span>
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}