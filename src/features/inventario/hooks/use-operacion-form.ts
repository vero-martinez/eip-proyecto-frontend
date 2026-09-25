"use client"

/**
 * Hook para la gestión del formulario de operaciones de inventario.
 * Soporta dos modalidades: "produccion" (entrada interna) y "compra" (proveedores).
 */

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Product } from "@/types/products"
import type { Proveedor } from "@/features/proveedores/types"

import { compraSchema, entradaProduccionSchema } from "../schemas"
import type { CompraFormData } from "../schemas"
import { useLotesPorProducto } from "./use-lotes"
import {
    useRegistrarCompra,
    useRegistrarEntradaProduccion,
} from "./use-operaciones"

export type OperacionModo = "produccion" | "compra"

interface UseOperacionFormParams {
    modo: OperacionModo
    products: Product[]
    proveedores?: Proveedor[]
    responsable: string
    initialProductId?: number
}

/** Centraliza la validación, mutaciones y estado de React Hook Form para operaciones. */
export function useOperacionForm({
    modo,
    products,
    proveedores = [],
    responsable,
    initialProductId,
}: UseOperacionFormParams) {
    const esCompra = modo === "compra"
    const registrarEntrada = useRegistrarEntradaProduccion()
    const registrarCompra = useRegistrarCompra()

    const initialProduct =
        initialProductId !== undefined
            ? products.find(
                (product) => product.id === initialProductId && product.isActive
            )
            : undefined

    const methods = useForm<CompraFormData>({
        resolver: zodResolver(esCompra ? compraSchema : entradaProduccionSchema),
        defaultValues: {
            productId: initialProduct?.id ?? undefined,
            quantity: undefined,
            proveedorId: undefined,
            costoUnitarioSoles: undefined,
        },
    })
    const { control, setValue, reset } = methods

    const productId = useWatch({ control, name: "productId" })
    const selectedProduct = products.find((p) => p.id === productId)

    const proveedorId = useWatch({ control, name: "proveedorId" })
    const selectedProveedor = proveedores.find((p) => p.id === proveedorId)

    const { data: lotes, isLoading: isLoadingLotes } = useLotesPorProducto(
        esCompra && productId !== undefined ? productId : null
    )
    const hasLotes = !!lotes?.some((lote) => lote.cantidadDisponible > 0)

    const quantityStep = selectedProduct?.unitType === "KILOGRAMO" ? "0.01" : "1"

    const handleProductChange = (value: string) => {
        setValue("productId", Number(value))
        setValue("proveedorId", undefined)
        setValue("costoUnitarioSoles", undefined)
    }

    const handleProveedorChange = (value: string) => {
        setValue("proveedorId", value === "" ? undefined : Number(value))
    }

    const onSubmit = methods.handleSubmit((data) => {
        const product = products.find((p) => p.id === data.productId)

        if (esCompra) {
            if (
                data.costoUnitarioSoles === undefined &&
                !hasLotes &&
                !isLoadingLotes
            ) {
                toast.error(
                    "El costo de compra es obligatorio cuando el producto aún no tiene stock"
                )
                return
            }

            registrarCompra.mutate(
                { ...data, responsable },
                {
                    onSuccess: () => {
                        toast.success(
                            `Compra registrada: ${product?.name ?? "producto"}`
                        )
                        reset()
                    },
                    onError: (error) => {
                        toast.error(error.message)
                    },
                }
            )
            return
        }

        registrarEntrada.mutate(
            {
                productId: data.productId,
                quantity: data.quantity,
                responsable,
            },
            {
                onSuccess: () => {
                    toast.success(
                        `Entrada registrada: ${product?.name ?? "producto"}`
                    )
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
        isSubmitting: esCompra
            ? registrarCompra.isPending
            : registrarEntrada.isPending,
        esCompra,
        selectedProduct,
        selectedProveedor,
        quantityStep,
        hasLotes,
        handleProductChange,
        handleProveedorChange,
        onSubmit,
    }
}