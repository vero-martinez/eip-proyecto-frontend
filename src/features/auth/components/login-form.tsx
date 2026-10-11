"use client"

/**
 * Formulario de login, envuelto en un Card de shadcn/ui.
 *
 * Componente presentacional: toda la lógica (React Hook Form + Zod, la
 * mutation de login, la sesión global y la redirección) vive en
 * useLoginForm.
 */

import { ArrowRightIcon, EyeIcon, EyeOffIcon, Loader2Icon, LockIcon, MailIcon, ShieldCheckIcon } from "lucide-react"

import { useLoginForm } from "@/features/auth/hooks/use-login-form"

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
  const { methods, onSubmit, isSubmitting, showPassword, togglePassword } =
    useLoginForm()

  const {
    register,
    formState: { errors },
  } = methods

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
          onSubmit={onSubmit}
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
                placeholder="admin@pasion.com"
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
                  onClick={togglePassword}
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
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