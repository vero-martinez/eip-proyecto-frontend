/**
 * Esquemas de validación del formulario de usuarios con Zod.
 * La contraseña es obligatoria al crear y opcional al editar
 * (si se deja vacía, no se cambia la contraseña existente).
 */

import { z } from "zod"

const ROLES = ["admin", "vendedor", "taller"] as const

const baseSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, "El nombre es obligatorio")
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .regex(
            /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]+$/,
            "El nombre solo puede contener letras, espacios, guiones y apóstrofes"
        ),
    email: z
        .string()
        .min(1, "El email es obligatorio")
        .email("El email no tiene un formato válido"),
    role: z.enum(ROLES, { message: "Seleccioná un rol" }),
    isActive: z.boolean(),
    informado: z.boolean(),
})

export const createUserSchema = baseSchema
    .extend({
        password: z
            .string()
            .min(1, "La contraseña es obligatoria")
            .min(6, "La contraseña debe tener al menos 6 caracteres"),
    })
    .refine((data) => data.informado, {
        message:
            "Confirmá que informaste a la persona sobre el tratamiento de sus datos",
        path: ["informado"],
    })

export const updateUserSchema = baseSchema.extend({
    password: z
        .union([
            z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
            z.literal(""),
        ])
        .optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>