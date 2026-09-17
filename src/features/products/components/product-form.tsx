"use client"

/**
 * Formulario de producto (crear/editar), mostrado dentro de un Dialog.
 *
 * Toda la lógica de estado y mutations vive en useProductForm; este
 * componente solo arma el shell (FormDialog) y renderiza los campos.
 */

import { FormProvider } from "react-hook-form"
import { Calendar, Tag } from "lucide-react"

import { FormDialog } from "@/components/common/form-dialog"
import { SearchableSelect } from "@/components/common/searchable-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import type { Category, Product } from "@/types/products"

import { getCategoryOptions, UNIT_OPTIONS } from "../utils"
import { useProductForm } from "../hooks/use-product-form"

const FORM_ID = "product-form"

interface ProductFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: Product
    categories: Category[]
}

export function ProductForm({
    open,
    onOpenChange,
    product,
    categories,
}: ProductFormProps) {
    const isEditing = !!product

    const {
        methods,
        isSubmitting,
        categoryId,
        unitType,
        isActive,
        rootCategoryId,
        rootCategories,
        subcategories,
        handleRootChange,
        handleSubcategoryChange,
        handleUnitTypeChange,
        handleActiveChange,
        onSubmit,
    } = useProductForm({
        product,
        categories,
        onClose: () => onOpenChange(false),
    })

    const {
        register,
        formState: { errors },
    } = methods

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={isEditing ? "Editar producto" : "Nuevo producto"}
            description={
                isEditing
                    ? "Modificá los datos del producto."
                    : "Completá los datos para agregar el producto al catálogo."
            }
            formId={FORM_ID}
            submitLabel={isEditing ? "Guardar cambios" : "Crear producto"}
            isSubmitting={isSubmitting}
            meta={
                product ? (
                    <>
                        <span className="flex items-center gap-1.5">
                            <Tag className="size-3" aria-hidden="true" />
                            SKU {product.sku}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`size-1.5 rounded-full ${
                                    product.isActive
                                        ? "bg-emerald-400"
                                        : "bg-muted-foreground"
                                }`}
                                aria-hidden="true"
                            />
                            {product.isActive ? "Activo" : "Inactivo"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="size-3" aria-hidden="true" />
                            Creado el {formatDate(product.createdAt)}
                        </span>
                    </>
                ) : undefined
            }
        >
            <FormProvider {...methods}>
                <form id={FORM_ID} noValidate onSubmit={onSubmit}>
                    <div className="flex flex-col gap-4">
                        {/* Nombre y SKU */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Cuarzo"
                                    aria-invalid={
                                        errors.name ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.name ? "name-error" : undefined
                                    }
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p
                                        id="name-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    placeholder="Ej: PRD-001"
                                    aria-invalid={errors.sku ? true : undefined}
                                    aria-describedby={
                                        errors.sku ? "sku-error" : undefined
                                    }
                                    {...register("sku")}
                                />
                                {errors.sku && (
                                    <p
                                        id="sku-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.sku.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Categoría (raíz) y Unidad de medida */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Categoría</Label>
                                <SearchableSelect
                                    value={
                                        rootCategoryId !== undefined
                                            ? String(rootCategoryId)
                                            : ""
                                    }
                                    onValueChange={handleRootChange}
                                    options={getCategoryOptions(rootCategories)}
                                    placeholder="Seleccionar categoría"
                                    searchPlaceholder="Buscar categoría..."
                                    ariaLabel="Categoría"
                                    ariaInvalid={!!errors.categoryId}
                                    ariaDescribedby={
                                        errors.categoryId
                                            ? "categoryId-error"
                                            : undefined
                                    }
                                    triggerClassName="w-full"
                                />
                                {errors.categoryId && (
                                    <p
                                        id="categoryId-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.categoryId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Unidad de medida</Label>
                                <Select
                                    value={unitType}
                                    onValueChange={handleUnitTypeChange}
                                    items={UNIT_OPTIONS}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        aria-label="Unidad de medida"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {UNIT_OPTIONS.map((option) => (
                                            <SelectItem
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Subcategoría (solo si la categoría raíz tiene) */}
                        {subcategories.length > 0 && (
                            <div className="space-y-2">
                                <Label>Subcategoría</Label>
                                <SearchableSelect
                                    value={
                                        categoryId !== undefined &&
                                        subcategories.some(
                                            (subcategory) =>
                                                subcategory.id === categoryId
                                        )
                                            ? String(categoryId)
                                            : ""
                                    }
                                    onValueChange={handleSubcategoryChange}
                                    options={getCategoryOptions(subcategories)}
                                    placeholder="Seleccionar subcategoría"
                                    searchPlaceholder="Buscar subcategoría..."
                                    ariaLabel="Subcategoría"
                                    triggerClassName="w-full"
                                />
                            </div>
                        )}

                        {/* Precios */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="costPrice">
                                    Precio de costo (S/)
                                </Label>
                                <Input
                                    id="costPrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    aria-invalid={
                                        errors.costPrice ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.costPrice
                                            ? "costPrice-error"
                                            : undefined
                                    }
                                    {...register("costPrice", {
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.costPrice && (
                                    <p
                                        id="costPrice-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.costPrice.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salePrice">
                                    Precio de venta (S/)
                                </Label>
                                <Input
                                    id="salePrice"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    aria-invalid={
                                        errors.salePrice ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.salePrice
                                            ? "salePrice-error"
                                            : undefined
                                    }
                                    {...register("salePrice", {
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.salePrice && (
                                    <p
                                        id="salePrice-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.salePrice.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="currentStock">
                                    Stock actual
                                </Label>
                                <Input
                                    id="currentStock"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    aria-invalid={
                                        errors.currentStock ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.currentStock
                                            ? "currentStock-error"
                                            : undefined
                                    }
                                    {...register("currentStock", {
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.currentStock && (
                                    <p
                                        id="currentStock-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.currentStock.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minStockAlert">
                                    Stock mínimo (alerta)
                                </Label>
                                <Input
                                    id="minStockAlert"
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    aria-invalid={
                                        errors.minStockAlert ? true : undefined
                                    }
                                    aria-describedby={
                                        errors.minStockAlert
                                            ? "minStockAlert-error"
                                            : undefined
                                    }
                                    {...register("minStockAlert", {
                                        valueAsNumber: true,
                                    })}
                                />
                                {errors.minStockAlert && (
                                    <p
                                        id="minStockAlert-error"
                                        role="alert"
                                        className="text-sm text-destructive"
                                    >
                                        {errors.minStockAlert.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Activo/Inactivo */}
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div>
                                <Label htmlFor="isActive">Producto activo</Label>
                                <p
                                    id="isActive-description"
                                    className="text-xs text-muted-foreground"
                                >
                                    Los productos inactivos no aparecen en el
                                    catálogo de ventas
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={handleActiveChange}
                                aria-describedby="isActive-description"
                                className="data-checked:bg-emerald-500"
                            />
                        </div>
                    </div>
                </form>
            </FormProvider>
        </FormDialog>
    )
}