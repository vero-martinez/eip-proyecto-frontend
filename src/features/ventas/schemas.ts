import { z } from "zod"

/**
 * Esquema de validación para el cobro en Punto de Venta.
 */
export const pagoVentaSchema = z.object({
    tipoVenta: z.string().min(1, "Seleccioná el tipo de venta"),

    metodoPago: z.string().min(1, "Seleccioná el método de pago"),

    /**
     * Monto recibido en efectivo.
     * Convierte el string del input a número y valida que no sea negativo.
     * La verificación contra el total a pagar se realiza en el componente.
     */
    pagoCon: z
        .string()
        .optional()
        .transform((val) => {
            if (!val?.trim()) return undefined
            const num = Number(val)
            return Number.isFinite(num) ? num : undefined
        })
        .refine((val) => val === undefined || val >= 0, {
            message: "Ingresá un monto válido",
        }),
})

/** Valores de entrada del formulario (pagoCon como string). */
export type PagoVentaInput = z.input<typeof pagoVentaSchema>

/** Valores procesados por el esquema (pagoCon transformado a número). */
export type PagoVentaFormData = z.output<typeof pagoVentaSchema>