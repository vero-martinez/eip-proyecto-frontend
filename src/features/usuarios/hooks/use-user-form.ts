/**
 * Hook con la lógica del formulario de usuarios (crear/editar).
 */

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import type { Rol } from "@/types/auth"
import type { User } from "../types"

import {
    createUserSchema,
    updateUserSchema,
    type CreateUserFormData,
    type UpdateUserFormData,
} from "../users.schema"
import { useCreateUser } from "./use-create-user"
import { useUpdateUser } from "./use-update-user"

const DEFAULT_VALUES = {
    fullName: "",
    email: "",
    role: "vendedor" as Rol,
    password: "",
    isActive: true,
}

interface UseUserFormParams {
    user?: User
    onClose: () => void
}

export function useUserForm({ user, onClose }: UseUserFormParams) {
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()

    const isEditing = !!user
    const isSubmitting = createUser.isPending || updateUser.isPending

    const methods = useForm<CreateUserFormData | UpdateUserFormData>({
        resolver: zodResolver(isEditing ? updateUserSchema : createUserSchema),
        defaultValues: DEFAULT_VALUES,
    })
    const { reset, handleSubmit } = methods

    useEffect(() => {
        if (user) {
            reset({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                password: "",
                isActive: user.isActive,
            })
        } else {
            reset(DEFAULT_VALUES)
        }
    }, [user, reset])

    const onSubmit = handleSubmit((data) => {
        const onSuccess = (message: string) => {
            toast.success(message)
            onClose()
        }
        const onError = (error: Error) => toast.error(error.message)

        if (isEditing) {
            updateUser.mutate(
                {
                    id: user.id,
                    data: {
                        fullName: data.fullName,
                        email: data.email,
                        role: data.role,
                        isActive: data.isActive,
                        password: data.password || undefined,
                    },
                },
                {
                    onSuccess: () => onSuccess("Usuario actualizado correctamente"),
                    onError,
                }
            )
            return
        }

        createUser.mutate(
            {
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                password: (data as CreateUserFormData).password,
                isActive: data.isActive,
            },
            {
                onSuccess: () => onSuccess("Usuario creado correctamente"),
                onError,
            }
        )
    })

    return {
        methods,
        isSubmitting,
        isEditing,
        onSubmit,
    }
}