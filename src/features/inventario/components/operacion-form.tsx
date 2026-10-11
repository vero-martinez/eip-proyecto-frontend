"use client"

/**
 * Formulario de operación de inventario, adaptativo
 * por rol:
 * - "produccion": entrada interna del taller — solo producto y cantidad.
 * - "compra": compra a proveedor nacional — proveedor + cantidad +
 *   costo de compra (opcional; obligatorio sin stock previo).
 *
 * Presentacional: la lógica de estado y mutations vive en
 * useOperacionForm.
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
    Wallet,
} from "lucide-react"

import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    InputGroup,
    InputGroupInput,
    InputGroupAddon,
    InputGroupText,
} from "@/components/ui/input-group"
import { formatStock, hasLowStock, UNIT_OPTIONS } from "@/lib/units"
import type { Product } from "@/types/products"

import type { Proveedor } from "@/features/proveedores/types"
import type { OperacionModo } from "../hooks/use-operacion-form"
import { useOperacionForm } from "../hooks/use-operacion-form"

const FORM_ID = "operacion-form"

interface OperacionFormProps {
    modo: OperacionModo
    products: Product[]
    proveedores?: Proveedor[]
    /** Nombre de la persona que registra (usuario logueado). */
    responsable: string
    /** Id de un producto preseleccionado (ej. desde Alertas). */
    initialProductId?: number
}

export function OperacionForm({
    modo,
    products,
    proveedores = [],
    responsable,
    initialProductId,
}: OperacionFormProps) {
    const esCompra = modo === "compra"

    const {
        methods,
        isSubmitting,
        selectedProduct,
        selectedProveedor,
        quantityStep,
        hasLotes,
        handleProductChange,
        handleProveedorChange,
        onSubmit,
    } = useOperacionForm({
        modo,
        products,
        proveedores,
        responsable,
        initialProductId,
    })

    const {
        register,
        formState: { errors },
    } = methods

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
                            {esCompra ? "Registrar compra" : "Registrar entrada"}
                        </CardTitle>
                        <CardDescription className="text-sm">
                            {esCompra
                                ? "Comprá stock a un proveedor nacional; actualiza el costo promedio del producto."
                                : "Entrada interna del taller; no altera el costo del producto."}
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
                            htmlFor="operacion-product"
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
                                errors.productId
                                    ? "operacion-product-error"
                                    : undefined
                            }
                            triggerClassName="w-full h-10"
                        />
                        {errors.productId && (
                            <p
                                id="operacion-product-error"
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
                                        ? "border-destructive/30 bg-destructive/10 text-destructive"
                                        : "border-success/30 bg-success/10 text-success"
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

                                <div className="mt-2 flex items-center gap-1.5 border-t border-foreground/10 pt-2 font-medium">
                                    {productIsLow ? (
                                        <>
                                            <AlertTriangle className="size-3.5 shrink-0 text-destructive" aria-hidden="true" />
                                            <span>Stock bajo — se sugiere reponer.</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-3.5 shrink-0 text-success" aria-hidden="true" />
                                            <span>Stock en nivel óptimo.</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Proveedor (compra) */}
                    {esCompra && (
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
                    )}

                    {/* Cantidad */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="operacion-quantity"
                            className="flex items-center gap-2 text-base font-medium"
                        >
                            <Hash className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            <span>Cantidad</span>
                            <span className="text-destructive">*</span>
                        </Label>
                        <InputGroup className="h-10">
                            <InputGroupInput
                                id="operacion-quantity"
                                type="number"
                                min="0.01"
                                step={quantityStep}
                                placeholder="0.00"
                                className="h-full"
                                aria-invalid={errors.quantity ? true : undefined}
                                aria-describedby={
                                    errors.quantity
                                        ? "operacion-quantity-error"
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
                                id="operacion-quantity-error"
                                role="alert"
                                className="text-xs font-medium text-destructive"
                            >
                                {errors.quantity.message}
                            </p>
                        )}
                    </div>

                    {/* Costo de compra (solo compra) */}
                    {esCompra && (
                        <div className="space-y-2">
                            <Label
                                htmlFor="operacion-costo"
                                className="flex items-center gap-2 text-base font-medium"
                            >
                                <Wallet className="size-3.5 text-muted-foreground" aria-hidden="true" />
                                <span>Costo de compra (S/)</span>
                                <span className="text-[10px] text-muted-foreground/70">(Opcional)</span>
                            </Label>
                            <InputGroup className="h-10">
                                <InputGroupAddon align="inline-start" className="h-full">
                                    <InputGroupText className="text-xs font-medium text-muted-foreground">
                                        S/
                                    </InputGroupText>
                                </InputGroupAddon>
                                <InputGroupInput
                                    id="operacion-costo"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="h-full"
                                    aria-invalid={errors.costoUnitarioSoles ? true : undefined}
                                    aria-describedby={
                                        errors.costoUnitarioSoles
                                            ? "operacion-costo-error"
                                            : "operacion-costo-hint"
                                    }
                                    {...register("costoUnitarioSoles", {
                                        valueAsNumber: true,
                                    })}
                                />
                            </InputGroup>
                            {errors.costoUnitarioSoles && (
                                <p
                                    id="operacion-costo-error"
                                    role="alert"
                                    className="text-xs font-medium text-destructive"
                                >
                                    {errors.costoUnitarioSoles.message}
                                </p>
                            )}
                            <p
                                id="operacion-costo-hint"
                                className="text-xs text-muted-foreground"
                            >
                                {hasLotes
                                    ? "Sin indicar costo, se usa el promedio ponderado actual."
                                    : "Obligatorio: el producto aún no tiene stock registrado."}
                            </p>
                        </div>
                    )}

                    {/* Botón Acción Principal */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-2 h-10 w-full font-medium transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                                <span>
                                    {esCompra
                                        ? "Registrando compra..."
                                        : "Registrando ingreso..."}
                                </span>
                            </>
                        ) : (
                            <>
                                <PackagePlus className="size-4" aria-hidden="true" />
                                <span>
                                    {esCompra
                                        ? "Registrar compra"
                                        : "Registrar entrada"}
                                </span>
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}