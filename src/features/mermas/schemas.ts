/**
 * Esquema de validación del formulario de registro de merma.
 * Define las reglas que deben cumplir el producto elegido, la
 * cantidad a descontar, el motivo (obligatorio) y el detalle (opcional).
 */

import { z } from "zod"

import { MOTIVOS_MERMA } from "./constants"

/**
 * El backend solo admite los motivos de `MOTIVOS_MERMA`; derivar el enum de
 * las constantes evita que la lista y la validación se desincronicen.
 */
const MOTIVOS_VALIDADOS = MOTIVOS_MERMA.map(
    (motivo) => motivo.value
) as [string, ...string[]]

export const mermaSchema = z.object({
    productId: z
        .number({ message: "Seleccioná un producto" })
        .positive("Seleccioná un producto"),

    quantity: z
        .number({ message: "Ingresá una cantidad" })
        .positive("La cantidad debe ser mayor a 0"),

    motivo: z.enum(MOTIVOS_VALIDADOS, {
        message: "Seleccioná un motivo",
    }),

    detalle: z.string().optional(),
})

export type MermaFormData = z.infer<typeof mermaSchema>