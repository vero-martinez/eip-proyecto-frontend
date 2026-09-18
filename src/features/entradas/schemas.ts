/**
 * Esquema de validación del formulario de registro de entrada.
 * Define las reglas que deben cumplir el producto elegido y la
 * cantidad ingresada antes de registrar la entrada.
 */

import { z } from "zod"

export const stockEntrySchema = z.object({
    productId: z
        .number({ message: "Seleccioná un producto" })
        .positive("Seleccioná un producto"),

    quantity: z
        .number({ message: "Ingresá una cantidad" })
        .positive("La cantidad debe ser mayor a 0"),

    proveedorId: z
        .number()
        .positive("Seleccioná un proveedor válido")
        .optional(),
})

export type StockEntryFormData = z.infer<typeof stockEntrySchema>