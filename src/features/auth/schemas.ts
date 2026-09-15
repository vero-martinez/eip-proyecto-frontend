/**
 * Esquema de validación del formulario de login con Zod.
 * Define las reglas para el email y la contraseña.
 */

import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El email es obligatorio")
        .email("El email no tiene un formato válido"),
    password: z
        .string()
        .min(1, "La contraseña es obligatoria"),
});

// Genera automáticamente el tipo TypeScript a partir del esquema.
export type LoginFormData = z.infer<typeof loginSchema>;