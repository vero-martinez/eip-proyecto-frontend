"use client"

/**
 * Hook para gestionar la lógica, validaciones y envio del formulario de Comercio Exterior.
 */

import { useFieldArray, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Product } from "@/types/products"
import type { SocioComercial } from "../types"

import { TIPO_CAMBIO_DEFAULT } from "../constants"
import { operacionCreateSchema } from "../schemas/operacionCreateSchema"
import type { OperacionCreateSchema } from "../schemas/operacionCreateSchema"
import { calcularTotales, fechaHoy } from "../utils"
import { useRegistrarOperacion } from "./use-registrar-operacion"

// --- INTERFACES ---

interface UseOperacionFormParams {
    products: Product[]
    sociosComerciales: SocioComercial[]
    responsable: string
    onSaved?: () => void
}

// --- HOOK PRINCIPAL ---

// Administra el estado, cálculos en tiempo real y envío del formulario de operaciones
export function useOperacionForm({
    products,
    sociosComerciales,
    responsable,
    onSaved,
}: UseOperacionFormParams) {
    const registrar = useRegistrarOperacion()

    // Valores iniciales del formulario
    const defaultValues: OperacionCreateSchema = {
        fecha: fechaHoy(),
        tipo: "importacion",
        socioComercialId: 0,
        incoterm: undefined,
        medioTransporte: undefined,
        tipoCambio: TIPO_CAMBIO_DEFAULT,
        notas: "",
        lineas: [],
        responsable,
    }

    // Configuración de React Hook Form con validación de Zod
    const methods = useForm<OperacionCreateSchema>({
        resolver: zodResolver(operacionCreateSchema),
        defaultValues,
    })
    const { control, register, setValue, handleSubmit, reset, formState } =
        methods

    // Control dinámico de las líneas de producto
    const lineasField = useFieldArray({ control, name: "lineas" })

    // Observadores de campos en tiempo real (Watches)
    const tipo = useWatch({ control, name: "tipo" })
    const socioComercialId = useWatch({ control, name: "socioComercialId" })
    const tipoCambioRaw = useWatch({ control, name: "tipoCambio" })
    const lineas = useWatch({ control, name: "lineas" })

    // Obtiene el socio comercial seleccionado de la lista
    const selectedSocioComercial = sociosComerciales.find(
        (socio) => socio.id === socioComercialId
    )

    // Cálculo automático de los montos en USD y PEN
    const tipoCambio =
        tipoCambioRaw > 0 ? tipoCambioRaw : TIPO_CAMBIO_DEFAULT
    const montos = calcularTotales(
        lineas.map((linea) => ({
            cantidad: linea.cantidad || 0,
            precioUSD: linea.precioUSD || 0,
        })),
        tipoCambio
    )

    // Mapa de productos para búsqueda rápida por ID
    const productById = new Map(products.map((product) => [product.id, product]))

    // Determina el incremento del input según la unidad de medida
    const getCantidadStep = (
        productId: number | undefined
    ): string | undefined => {
        const product = productId ? productById.get(productId) : undefined
        return product?.unitType === "KILOGRAMO" ? "0.01" : "1"
    }

    // Agrega una nueva línea de producto al formulario
    const appendLinea = () => {
        lineasField.append({ productoId: 0, cantidad: 1, precioUSD: 0 })
    }

    // Elimina una línea de producto manteniendo al menos una
    const removeLinea = (index: number) => {
        if (lineasField.fields.length > 1) lineasField.remove(index)
    }

    // Procesa el envío del formulario mediante la mutación
    const onSubmit = handleSubmit((data) => {
        registrar.mutate(data, {
            onSuccess: () => {
                toast.success(
                    `${data.tipo === "importacion" ? "Importación" : "Exportación"} registrada correctamente`
                )
                reset()
                onSaved?.()
            },
            onError: (error) => {
                toast.error(error.message)
            },
        })
    })

    return {
        methods,
        register,
        setValue,
        formState,
        lineasField,
        lineas,
        tipo,
        selectedSocioComercial,
        montos,
        isSubmitting: registrar.isPending,
        getCantidadStep,
        appendLinea,
        removeLinea,
        onSubmit,
        reset,
    }
}