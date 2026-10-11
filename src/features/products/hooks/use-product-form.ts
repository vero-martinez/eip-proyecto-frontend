/**
 * Hook personalizado para manejar la lógica y el estado del formulario
 * de productos (creación y edición).
 *
 * El alta es mínima: solo cataloga el producto (nombre, SKU, categorías,
 * unidad y stock mínimo) y nace INACTIVO, sin precio ni stock. El stock
 * y el costo se cargan desde Compras y el precio de venta se fija al editar.
 */

import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
    getRootCategories,
    getRootCategoryId,
    getSubcategories,
} from "@/lib/categories"
import type { Category, Product, UnitType } from "@/types/products"

import { productSchema, type ProductFormData } from "../schemas"
import { useCreateProduct } from "./use-create-product"
import { useUpdateProduct } from "./use-update-product"

const DEFAULT_VALUES = {
    sku: "",
    name: "",
    categoryId: undefined as number | undefined,
    unitType: "UNIDAD",
    salePrice: 0,
    minStockAlert: 0,
    isActive: false,
} as const

interface UseProductFormParams {
    product?: Product
    categories: Category[]
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

    const [rootCategoryId, setRootCategoryId] = useState<number | undefined>(
        () => getRootCategoryId(categories, product?.categoryId)
    )

    const methods = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: DEFAULT_VALUES,
    })
    const { reset, control, setValue, handleSubmit } = methods

    const categoriesRef = useRef(categories)
    useEffect(() => {
        categoriesRef.current = categories
    }, [categories])

    useEffect(() => {
        if (product) {
            reset({
                sku: product.sku,
                name: product.name,
                categoryId: product.categoryId,
                unitType: product.unitType,
                salePrice: product.salePrice,
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
                { onSuccess: () => onSuccess("Producto actualizado correctamente"), onError }
            )
            return
        }

        createProduct.mutate(
            {
                sku: data.sku,
                name: data.name,
                categoryId: data.categoryId,
                unitType: data.unitType,
                // El alta es mínima: sin precio y nace inactivo. El stock
                // y el costo los calcula el backend (vía compras/lotes).
                salePrice: 0,
                minStockAlert: data.minStockAlert,
                isActive: false,
            },
            {
                onSuccess: () => onSuccess("Producto creado correctamente"),
                onError,
            }
        )
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