/**
 * Hook personalizado para manejar la lógica y el estado del formulario
 * de productos (creación y edición).
 */

import { useEffect, useRef, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { useLotesPorProducto } from "@/features/inventario/hooks/use-lotes"
import { useRegistrarApertura } from "@/features/inventario/hooks/use-operaciones"
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
    costPrice: 0,
    currentStock: 0,
    minStockAlert: 0,
    proveedorId: undefined as number | undefined,
    isActive: true,
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
    const registrarApertura = useRegistrarApertura()

    const isEditing = !!product
    const isSubmitting =
        createProduct.isPending ||
        updateProduct.isPending ||
        registrarApertura.isPending

    const lotesQuery = useLotesPorProducto(isEditing ? product.id : null)
    const hasLotes = !!lotesQuery.data?.some(
        (lote) => lote.cantidadDisponible > 0
    )

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
                costPrice: product.costPrice,
                currentStock: product.currentStock,
                minStockAlert: product.minStockAlert,
                proveedorId: product.proveedorId,
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
    const proveedorId = useWatch({ control, name: "proveedorId" })

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

    const handleProveedorChange = (value: string) => {
        setValue("proveedorId", value === "" ? undefined : Number(value))
    }

    const onSubmit = handleSubmit((data) => {
        const onSuccess = (message: string) => {
            toast.success(message)
            onClose()
        }
        const onError = (error: Error) => toast.error(error.message)

        const payload: Partial<Omit<Product, "id" | "createdAt">> = { ...data }
        if (hasLotes) {
            delete payload.currentStock
            delete payload.costPrice
        }

        if (isEditing) {
            const finalizar = () => onSuccess("Producto actualizado correctamente")

            const abrirApertura =
                !hasLotes &&
                !lotesQuery.isLoading &&
                (data.currentStock ?? 0) > 0

            if (abrirApertura) {
                updateProduct.mutate(
                    { id: product.id, data: payload },
                    {
                        onSuccess: () =>
                            registrarApertura.mutate(
                                {
                                    productId: product.id,
                                    cantidad: data.currentStock,
                                    costoUnitarioSoles: data.costPrice,
                                    proveedorId: payload.proveedorId,
                                    responsable: "Administrador",
                                },
                                { onSuccess: finalizar, onError }
                            ),
                        onError,
                    }
                )
                return
            }

            updateProduct.mutate(
                { id: product.id, data: payload },
                { onSuccess: finalizar, onError }
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
        proveedorId,
        hasLotes,
        rootCategoryId,
        rootCategories,
        subcategories,
        handleRootChange,
        handleSubcategoryChange,
        handleUnitTypeChange,
        handleActiveChange,
        handleProveedorChange,
        onSubmit,
    }
}