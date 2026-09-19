"use client"

/**
 * Lógica del formulario de registro de entrada.
 *
 * Centraliza el estado de React Hook Form, el producto seleccionado
 * (para el step de cantidad según su unidad y el contexto de stock) y
 * la mutation con su toast. El componente EntradaForm solo consume lo
 * que devuelve este hook y lo renderiza.
 */

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Product } from "@/types/products"

import type { Proveedor } from "../types"
import { stockEntrySchema, type StockEntryFormData } from "../schemas"
import { useRegisterStockEntry } from "./use-register-entrada"

interface UseStockEntryFormParams {
    products: Product[]
    proveedores: Proveedor[]
    /** Nombre de la persona que registra la entrada (usuario logueado). */
    responsable: string
    /** Id de un producto preseleccionado (ej. desde Alertas). */
    initialProductId?: number
}

export function useStockEntryForm({
    products,
    proveedores,
    responsable,
    initialProductId,
}: UseStockEntryFormParams) {
    const registerStockEntry = useRegisterStockEntry()

    const initialProduct =
        initialProductId !== undefined
            ? products.find(
                  (product) =>
                      product.id === initialProductId && product.isActive
              )
            : undefined

    const methods = useForm<StockEntryFormData>({
        resolver: zodResolver(stockEntrySchema),
        defaultValues: {
            productId: initialProduct?.id ?? undefined,
            quantity: undefined,
            proveedorId: undefined,
        },
    })
    const { control, setValue, reset } = methods

    const productId = useWatch({ control, name: "productId" })
    const selectedProduct = products.find((p) => p.id === productId)

    const proveedorId = useWatch({ control, name: "proveedorId" })
    const selectedProveedor = proveedores.find((p) => p.id === proveedorId)

    /**
     * Para kilogramos se permite decimal (0.01); para unidades, solo enteros.
     */
    const quantityStep = selectedProduct?.unitType === "KILOGRAMO" ? "0.01" : "1"

    const handleProductChange = (value: string) => {
        setValue("productId", Number(value))
    }

    /**
     * El proveedor es opcional: con valor vacío se guarda sin proveedor.
     */
    const handleProveedorChange = (value: string) => {
        if (value === "") {
            setValue("proveedorId", undefined)
        } else {
            setValue("proveedorId", Number(value))
        }
    }

    const onSubmit = methods.handleSubmit((data) => {
        const product = products.find((p) => p.id === data.productId)
        registerStockEntry.mutate(
            { ...data, responsable },
            {
                onSuccess: () => {
                    toast.success(`Entrada registrada: ${product?.name ?? "producto"}`)
                    reset()
                },
                onError: (error) => {
                    toast.error(error.message)
                },
            }
        )
    })

    return {
        methods,
        isSubmitting: registerStockEntry.isPending,
        selectedProduct,
        selectedProveedor,
        quantityStep,
        handleProductChange,
        handleProveedorChange,
        onSubmit,
    }
}