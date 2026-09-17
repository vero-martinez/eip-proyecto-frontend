"use client"

/**
 * Lógica del formulario de producto (crear/editar).
 *
 * Centraliza el estado de React Hook Form, la precarga según el
 * modo, la categoría raíz/subcategoría y las mutations de
 * crear/actualizar con sus toasts. El componente ProductForm solo
 * consume lo que devuelve este hook y lo renderiza.
 */

import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Category, Product, UnitType } from "@/types/products"

import { productSchema, type ProductFormData } from "../schemas"
import {
    getRootCategories,
    getRootCategoryId,
    getSubcategories,
} from "../utils"
import { useCreateProduct } from "./use-create-product"
import { useUpdateProduct } from "./use-update-product"

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

interface UseProductFormParams {
    product?: Product
    categories: Category[]
    /** Se llama al guardar con éxito; el padre cierra el dialog. */
    onClose: () => void
}

export function useProductForm({
    product,
    categories,
    onClose,
}: UseProductFormParams) {
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

    const onSubmit = handleSubmit((data) => {
        const onSuccess = (message: string) => {
            toast.success(message)
            onClose()
        }
        const onError = (error: Error) => toast.error(error.message)

        if (isEditing) {
            updateProduct.mutate(
                { id: product.id, data },
                {
                    onSuccess: () =>
                        onSuccess("Producto actualizado correctamente"),
                    onError,
                }
            )
        } else {
            createProduct.mutate(data, {
                onSuccess: () => onSuccess("Producto creado correctamente"),
                onError,
            })
        }
    })

    return {
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
    }
}