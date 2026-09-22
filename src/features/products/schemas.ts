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
        .positive("El precio de venta debe ser mayor a 0"),

    costPrice: z
        .number({ message: "El precio de costo es obligatorio" })
        .positive("El precio de costo debe ser mayor a 0"),



    currentStock: z
        .number({ message: "El stock actual es obligatorio" })
        .min(0, "El stock no puede ser negativo"),

    minStockAlert: z
        .number({ message: "El stock mínimo es obligatorio" })
        .min(0, "El stock mínimo no puede ser negativo"),

    proveedorId: z
        .number()
        .positive("Seleccioná un proveedor válido")
        .optional(),

    isActive: z.boolean(),
}).refine((data) => data.salePrice > data.costPrice, {
    message: "El precio de venta debe ser mayor al precio de costo",
    path: ["salePrice"],
})


export type ProductFormData = z.infer<typeof productSchema>