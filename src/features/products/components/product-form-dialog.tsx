"use client"

/**
 * Dialog para crear o editar un producto (container).
 *
 * Orquesta el shell genérico FormDialog con el estado del formulario
 * (React Hook Form + Zod, vía FormProvider), las mutations de
 * crear/actualizar y los toasts de resultado. Los campos viven en
 * <ProductForm /> (presentacional).
 */

import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Calendar, Tag } from "lucide-react"

import { FormDialog } from "@/components/common/form-dialog"
import { formatDate } from "@/lib/utils"
import type { Category, Product, UnitType } from "@/types/products"

import { productSchema, type ProductFormData } from "../schemas"
import {
    getRootCategories,
    getRootCategoryId,
    getSubcategories,
} from "../utils"
import { useCreateProduct } from "../hooks/use-create-product"
import { useUpdateProduct } from "../hooks/use-update-product"
import { ProductForm } from "./product-form"

const FORM_ID = "product-form"

const DEFAULT_VALUES = {
    sku: "",
    name: "",
    categoryId: undefined,
    unitType: "UNIDAD",
    salePrice: 0,
    costPrice: 0,
    currentStock: 0,
    minStockAlert: 0,
    isActive: true,
} as const

interface ProductFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product?: Product
    categories: Category[]
}

export function ProductFormDialog({
    open,
    onOpenChange,
    product,
    categories,
}: ProductFormDialogProps) {
    const createProduct = useCreateProduct()
    const updateProduct = useUpdateProduct()

    const isEditing = !!product
    const isSubmitting = createProduct.isPending || updateProduct.isPending

    // Categoría raíz elegida para mostrar sus subcategorías; el valor final
    // del form (categoryId) es la subcategoría elegida, o la raíz misma.
    const [rootCategoryId, setRootCategoryId] = useState<number | undefined>(
        () => getRootCategoryId(categories, product?.categoryId)
    )

    const methods = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: DEFAULT_VALUES,
    })
    const { reset, control, setValue, handleSubmit } = methods

    // Las categorías se leen vía ref: evita que un refetch (nueva
    // identidad del array) re-dispare el reset y borre el form.
    const categoriesRef = useRef(categories)
    useEffect(() => {
        categoriesRef.current = categories
    }, [categories])

    // Precarga los valores según el modo: edición → datos del producto;
    // creación → valores por defecto (limpia el form de otros modos).
    useEffect(() => {
        if (product) {
            reset({
                sku: product.sku,
                name: product.name,
                categoryId: product.categoryId,
                unitType: product.unitType,
                salePrice: product.salePrice,
                costPrice: product.costPrice,
                currentStock: product.currentStock,
                minStockAlert: product.minStockAlert,
                isActive: product.isActive,
            })
            setRootCategoryId(
                getRootCategoryId(categoriesRef.current, product.categoryId)
            )
        } else {
            reset(DEFAULT_VALUES)
            setRootCategoryId(undefined)
        }
    }, [product, reset])

    const categoryId = useWatch({ control, name: "categoryId" })
    const unitType = useWatch({ control, name: "unitType" })
    const isActive = useWatch({ control, name: "isActive" })

    const rootCategories = getRootCategories(categories)
    const subcategories =
        rootCategoryId !== undefined
            ? getSubcategories(categories, rootCategoryId)
            : []

    const handleRootChange = (value: string) => {
        const rootId = Number(value)
        setRootCategoryId(rootId)
        setValue("categoryId", rootId)
    }

    const handleSubcategoryChange = (value: string) => {
        setValue("categoryId", Number(value))
    }

    const handleUnitTypeChange = (value: string | null) => {
        if (value === null) return
        setValue("unitType", value as UnitType)
    }

    const handleActiveChange = (checked: boolean) => {
        setValue("isActive", checked)
    }

    const handleSubmitForm = (data: ProductFormData) => {
        const callbacks = {
            onSuccess: (message: string) => {
                toast.success(message)
                onOpenChange(false)
            },
            onError: (error: Error) => {
                toast.error(error.message)
            },
        }

        if (isEditing) {
            updateProduct.mutate(
                { id: product.id, data },
                {
                    onSuccess: () =>
                        callbacks.onSuccess(
                            "Producto actualizado correctamente"
                        ),
                    onError: callbacks.onError,
                }
            )
        } else {
            createProduct.mutate(data, {
                onSuccess: () =>
                    callbacks.onSuccess("Producto creado correctamente"),
                onError: callbacks.onError,
            })
        }
    }

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
                <form
                    id={FORM_ID}
                    noValidate
                    onSubmit={handleSubmit(handleSubmitForm)}
                >
                    <ProductForm
                        rootCategories={rootCategories}
                        subcategories={subcategories}
                        rootCategoryId={rootCategoryId}
                        categoryId={categoryId}
                        unitType={unitType}
                        isActive={isActive}
                        onRootCategoryChange={handleRootChange}
                        onSubcategoryChange={handleSubcategoryChange}
                        onUnitTypeChange={handleUnitTypeChange}
                        onActiveChange={handleActiveChange}
                    />
                </form>
            </FormProvider>
        </FormDialog>
    )
}