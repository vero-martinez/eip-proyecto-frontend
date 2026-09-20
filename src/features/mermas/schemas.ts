/**
 * Esquema de validación del formulario de registro de merma.
 * Define las reglas que deben cumplir el producto elegido, la
 * cantidad a descontar, el motivo (obligatorio) y el detalle (opcional).
 */

import { z } from "zod"

export const mermaSchema = z.object({
    productId: z
        .number({ message: "Seleccioná un producto" })
        .positive("Seleccioná un producto"),

    quantity: z
        .number({ message: "Ingresá una cantidad" })
        .positive("La cantidad debe ser mayor a 0"),

    motivo: z
        .string({ message: "Seleccioná un motivo" })
        .min(1, "Seleccioná un motivo"),

    detalle: z.string().optional(),
})

export type MermaFormData = z.infer<typeof mermaSchema>