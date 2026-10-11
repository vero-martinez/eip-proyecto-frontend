/** Esquemas de validación Zod para el módulo de Inventario. */

import { z } from "zod"

/** Validación para entradas internas de producción (Taller). */
export const entradaProduccionSchema = z.object({
  productId: z
    .number({ message: "Seleccioná un producto" })
    .positive("Seleccioná un producto"),

  quantity: z
    .number({ message: "Ingresá una cantidad" })
    .positive("La cantidad debe ser mayor a 0"),
})

export type EntradaProduccionFormData = z.infer<
  typeof entradaProduccionSchema
>

/** Validación para registro de compras (Admin). */
export const compraSchema = z.object({
  productId: z
    .number({ message: "Seleccioná un producto" })
    .positive("Seleccioná un producto"),

  proveedorId: z
    .number()
    .positive("Seleccioná un proveedor válido")
    .optional(),

  quantity: z
    .number({ message: "Ingresá una cantidad" })
    .positive("La cantidad debe ser mayor a 0"),

  costoUnitarioSoles: z
    .number({ message: "El costo debe ser un número" })
    .nonnegative("El costo no puede ser negativo")
    .optional(),
})

export type CompraFormData = z.infer<typeof compraSchema>