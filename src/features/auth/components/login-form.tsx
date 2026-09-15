"use client"

/**
 * Formulario de login, envuelto en un Card de shadcn/ui.
 *
 * Usa React Hook Form + Zod para validar, y useLogin (useMutation)
 * para ejecutar el login mockeado. Al tener éxito, guarda la sesión
 * globalmente con useAuth() y redirige.
 */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowRightIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon, ShieldCheckIcon } from "lucide-react"

import { useAuth } from "@/providers/auth-provider"
import { useLogin } from "@/features/auth/hooks/use-login"
import { loginSchema, LoginFormData } from "@/features/auth/schemas"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"

export function LoginForm() {
  const router = useRouter()
  const { login: guardarSesion } = useAuth()
  const loginMutation = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
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
  }

  return (
    <Card className="w-full max-w-md border-border/60 shadow-xl shadow-black/5">
      <CardHeader className="gap-1 px-8 pt-8">
        {/* Logo / monograma de la empresa */}
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          EIP
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          Import &amp; Export Pasión
        </h1>
        <p className="text-sm text-muted-foreground">
          Ingresá a tu cuenta para continuar
        </p>
      </CardHeader>

      <CardContent className="px-8 pt-7">
        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email de la empresa</Label>
            <InputGroup className="h-10">
              <InputGroupAddon align="inline-start">
                <MailIcon className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                type="email"
                placeholder="admin@eip.com"
                autoComplete="email"
                required
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
            </InputGroup>
            {errors.email && (
              <p id="email-error" role="alert" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <InputGroup className="h-10">
              <InputGroupAddon align="inline-start">
                <LockIcon className="size-4" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? "password-error" : undefined}
                {...register("password")}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-4" />
                  ) : (
                    <EyeIcon className="size-4" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            {errors.password && (
              <p id="password-error" role="alert" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="mt-1 h-10 w-full font-semibold"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              <>
                Ingresar
                <ArrowRightIcon className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center gap-2 border-0 bg-transparent px-8 pt-6 pb-8 text-xs text-muted-foreground">
        <ShieldCheckIcon className="size-4 text-primary" />
        Tu información está protegida y cifrada.
      </CardFooter>
    </Card>
  )
}