/**
 * Esquema de validación (Zod) para la creación de operaciones de Comercio Exterior.
 */

import { z } from "zod"

import { INCOTERMS, MEDIOS_TRANSPORTE } from "../constants"
import { TIPO_OPERACION_VALUES } from "../types"

// --- MAPEO DE CONSTANTES ---

const incotermValues = INCOTERMS.map((option) => option.value) as [
    string,
    ...string[],
]

const medioTransporteValues = MEDIOS_TRANSPORTE.map(
    (option) => option.value
) as [string, ...string[]]

// --- ESQUEMA DE VALIDACIÓN ---

// Valida los datos necesarios para registrar una nueva operación (payload / formulario)
export const operacionCreateSchema = z.object({
    fecha: z.string().min(1, "La fecha es requerida"),
    tipo: z.enum(TIPO_OPERACION_VALUES, {
        message: "Seleccioná el tipo de operación",
    }),
    socioComercialId: z
        .number({ message: "Seleccioná un socio comercial" })
        .int("El socio comercial es inválido")
        .positive("Seleccioná un socio comercial"),
    incoterm: z.enum(incotermValues).optional(),
    medioTransporte: z.enum(medioTransporteValues).optional(),
    tipoCambio: z
        .number({ message: "Ingresá el tipo de cambio" })
        .positive("El tipo de cambio debe ser mayor a 0"),
    notas: z.string().optional(),
    lineas: z
        .array(
            z.object({
                productoId: z
                    .number({ message: "Seleccioná un producto" })
                    .int("El producto es inválido")
                    .positive("Seleccioná un producto"),
                cantidad: z
                    .number({ message: "Ingresá una cantidad" })
                    .positive("La cantidad debe ser mayor a 0"),
                precioUSD: z
                    .number({ message: "Ingresá el precio en USD" })
                    .min(0, "El precio no puede ser negativo"),
            })
        )
        .min(1, "Agregá al menos un producto"),
    responsable: z.string().min(1, "El responsable es requerido"),
})

export type OperacionCreateSchema = z.infer<typeof operacionCreateSchema>