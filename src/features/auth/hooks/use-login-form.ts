"use client"

/**
 * Lógica del formulario de login.
 *
 * Centraliza React Hook Form + Zod, la mutation de login, el guardado
 * de la sesión global con useAuth() y la redirección posterior. El
 * componente LoginForm solo consume lo que devuelve este hook y lo
 * renderiza.
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { useAuth } from "@/providers/auth-provider"

import { loginSchema, type LoginFormData } from "../schemas"
import { useLogin } from "./use-login"

export function useLoginForm() {
    const router = useRouter()
    const { login: guardarSesion } = useAuth()
    const loginMutation = useLogin()
    const [showPassword, setShowPassword] = useState(false)

    const methods = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = methods.handleSubmit((data) => {
        loginMutation.mutate(
            { email: data.email, password: data.password },
            {
                onSuccess: (usuario) => {
                    guardarSesion(usuario)
                    router.push("/")
                },
                onError: (error) => {
                    toast.error(error.message)
                },
            }
        )
    })

    const togglePassword = () => setShowPassword((prev) => !prev)

    return {
        methods,
        onSubmit,
        isSubmitting: loginMutation.isPending,
        showPassword,
        togglePassword,
    }
}
