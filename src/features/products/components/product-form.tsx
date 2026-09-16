"use client"

/**
 * Campos del formulario de producto (presentacional): no contiene
 * estado ni lógica de negocio. Lee el form de React Hook Form desde
 * el contexto (FormProvider) y recibe por props los datos derivados
 * (categorías/subcategorías, valores observados y callbacks).
 */

import { useFormContext } from "react-hook-form"

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
import type { Category, UnitType } from "@/types/products"

import type { ProductFormData } from "../schemas"
import { getCategoryOptions, UNIT_OPTIONS } from "../utils"

interface ProductFormProps {
    rootCategories: Category[]
    subcategories: Category[]
    rootCategoryId?: number
    categoryId?: number
    unitType: UnitType
    isActive: boolean
    onRootCategoryChange: (value: string) => void
    onSubcategoryChange: (value: string) => void
    onUnitTypeChange: (value: string | null) => void
    onActiveChange: (checked: boolean) => void
}

export function ProductForm({
    rootCategories,
    subcategories,
    rootCategoryId,
    categoryId,
    unitType,
    isActive,
    onRootCategoryChange,
    onSubcategoryChange,
    onUnitTypeChange,
    onActiveChange,
}: ProductFormProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext<ProductFormData>()

    return (
        <div className="flex flex-col gap-4">
            {/* Nombre y SKU */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                        id="name"
                        placeholder="Ej: Cuarzo"
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={errors.name ? "name-error" : undefined}
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
                        aria-describedby={errors.sku ? "sku-error" : undefined}
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
                        onValueChange={onRootCategoryChange}
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
                        onValueChange={onUnitTypeChange}
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
                                (subcategory) => subcategory.id === categoryId
                            )
                                ? String(categoryId)
                                : ""
                        }
                        onValueChange={onSubcategoryChange}
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
                    <Label htmlFor="costPrice">Precio de costo (S/)</Label>
                    <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        aria-invalid={errors.costPrice ? true : undefined}
                        aria-describedby={
                            errors.costPrice ? "costPrice-error" : undefined
                        }
                        {...register("costPrice", { valueAsNumber: true })}
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
                    <Label htmlFor="salePrice">Precio de venta (S/)</Label>
                    <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        aria-invalid={errors.salePrice ? true : undefined}
                        aria-describedby={
                            errors.salePrice ? "salePrice-error" : undefined
                        }
                        {...register("salePrice", { valueAsNumber: true })}
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
                    <Label htmlFor="currentStock">Stock actual</Label>
                    <Input
                        id="currentStock"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        aria-invalid={errors.currentStock ? true : undefined}
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
                    <Label htmlFor="minStockAlert">Stock mínimo (alerta)</Label>
                    <Input
                        id="minStockAlert"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        aria-invalid={errors.minStockAlert ? true : undefined}
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
                        Los productos inactivos no aparecen en el catálogo de
                        ventas
                    </p>
                </div>
                <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={onActiveChange}
                    aria-describedby="isActive-description"
                    className="data-checked:bg-emerald-500"
                />
            </div>
        </div>
    )
}