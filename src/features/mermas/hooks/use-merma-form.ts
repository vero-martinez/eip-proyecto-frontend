"use client"

/**
 * Lógica del formulario de registro de merma.
 *
 * Centraliza el estado de React Hook Form, el producto seleccionado
 * (para el step de cantidad según su unidad y el contexto de stock),
 * el motivo elegido y la mutation con su toast. El componente
 * MermaForm solo consume lo que devuelve este hook y lo renderiza.
 */

import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Product } from "@/types/products"

import { mermaSchema, type MermaFormData } from "../schemas"
import { useRegisterMerma } from "./use-register-merma"

interface UseMermaFormParams {
    products: Product[]
    /** Nombre de la persona que registra el ajuste (usuario logueado). */
    responsable: string
}

export function useMermaForm({ products, responsable }: UseMermaFormParams) {
    const registerMerma = useRegisterMerma()

    const methods = useForm<MermaFormData>({
        resolver: zodResolver(mermaSchema),
        defaultValues: {
            productId: undefined,
            quantity: undefined,
            motivo: undefined,
            detalle: undefined,
        },
    })
    const { control, setValue, reset } = methods

    const productId = useWatch({ control, name: "productId" })
    const selectedProduct = products.find((p) => p.id === productId)

    const motivo = useWatch({ control, name: "motivo" })

    /**
     * Para kilogramos se permite decimal (0.01); para unidades, solo enteros.
     */
    const quantityStep = selectedProduct?.unitType === "KILOGRAMO" ? "0.01" : "1"

    const handleProductChange = (value: string) => {
        setValue("productId", Number(value))
    }

    const handleMotivoChange = (value: string) => {
        setValue("motivo", value)
    }

    const onSubmit = methods.handleSubmit((data) => {
        const product = products.find((p) => p.id === data.productId)
        registerMerma.mutate(
            { ...data, responsable },
            {
                onSuccess: () => {
                    toast.success(`Merma registrada: ${product?.name ?? "producto"}`)
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
        isSubmitting: registerMerma.isPending,
        selectedProduct,
        motivo,
        quantityStep,
        handleProductChange,
        handleMotivoChange,
        onSubmit,
    }
}