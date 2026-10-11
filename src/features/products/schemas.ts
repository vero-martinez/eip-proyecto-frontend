/**
 * Esquema de validación del formulario de producto (crear/editar),
 * usando Zod. Define las reglas que deben cumplir los campos antes
 * de enviar el formulario.
 *
 * Se usa el mismo esquema para crear y editar — en editar, el "id"
 * y "createdAt" no forman parte del formulario, así que no se incluyen acá.
 */

import { z } from "zod"

export const productSchema = z.object({
    sku: z
        .string()
        .min(1, "El SKU es obligatorio")
        .max(50, "El SKU no puede superar los 50 caracteres"),

    name: z
        .string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(150, "El nombre no puede superar los 150 caracteres"),

    categoryId: z
        .number({ message: "Seleccioná una categoría" })
        .positive("Seleccioná una categoría válida"),

    unitType: z.enum(["UNIDAD", "KILOGRAMO"], {
        message: "Seleccioná una unidad de medida",
    }),

    salePrice: z
        .number({ message: "El precio de venta es obligatorio" })
        .min(0, "El precio de venta no puede ser negativo"),

    minStockAlert: z
        .number({ message: "El stock mínimo es obligatorio" })
        .min(0, "El stock mínimo no puede ser negativo"),

    isActive: z.boolean(),
}).refine((data) => !data.isActive || data.salePrice > 0, {
    message: "Para activar el producto, el precio de venta debe ser mayor a 0",
    path: ["salePrice"],
})


export type ProductFormData = z.infer<typeof productSchema>