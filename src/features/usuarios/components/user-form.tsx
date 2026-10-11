"use client"

/**
 * Formulario de usuario (crear/editar), mostrado dentro de un Dialog.
 */

import { FormProvider, useFormState, useWatch } from "react-hook-form"
import Link from "next/link"
import { Calendar, Mail, ShieldCheck } from "lucide-react"

import { FormDialog } from "@/components/common/form-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import type { Rol } from "@/types/auth"
import type { User } from "../types"

import { useUserForm } from "@/features/usuarios/hooks"

const FORM_ID = "user-form"

const ROLE_OPTIONS: { value: Rol; label: string }[] = [
    { value: "admin", label: "Administrador" },
    { value: "vendedor", label: "Vendedor" },
    { value: "taller", label: "Taller" },
]

interface UserFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User
}

export function UserForm({ open, onOpenChange, user }: UserFormProps) {
    const isEditing = !!user

    const { methods, isSubmitting, onSubmit } = useUserForm({
        user,
        open,
        onClose: () => onOpenChange(false),
    })

    const { register, setValue, control } = methods
    const { errors } = useFormState({ control })

    const role = useWatch({ control, name: "role" })
    const isActive = useWatch({ control, name: "isActive" })
    const informado = useWatch({ control, name: "informado" })

    return (
        <FormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={isEditing ? "Editar usuario" : "Nuevo usuario"}
            description={
                isEditing
                    ? "Modificá los datos del usuario. Dejá la contraseña vacía para no cambiarla."
                    : "Creá una cuenta de acceso al sistema para un nuevo usuario."
            }
            formId={FORM_ID}
            submitLabel={isEditing ? "Guardar cambios" : "Crear usuario"}
            isSubmitting={isSubmitting}
            submitDisabled={!isEditing && !informado}
            meta={
                user ? (
                    <>
                        <span className="flex items-center gap-1.5">
                            <Mail className="size-3" aria-hidden="true" />
                            {user.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span
                                className={`size-1.5 rounded-full ${
                                    user.isActive ? "bg-success" : "bg-muted-foreground"
                                }`}
                                aria-hidden="true"
                            />
                            {user.isActive ? "Activo" : "Inactivo"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="size-3" aria-hidden="true" />
                            Creado el {formatDate(user.createdAt)}
                        </span>
                    </>
                ) : undefined
            }
        >
            <FormProvider {...methods}>
                <form id={FORM_ID} noValidate onSubmit={onSubmit}>
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nombre completo</Label>
                            <Input
                                id="fullName"
                                placeholder="Ej: Ricardo Pasión"
                                aria-invalid={errors.fullName ? true : undefined}
                                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                                {...register("fullName")}
                            />
                            {errors.fullName && (
                                <p id="fullName-error" role="alert" className="text-sm text-destructive">
                                    {errors.fullName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="usuario@pasion.pe"
                                aria-invalid={errors.email ? true : undefined}
                                aria-describedby={errors.email ? "email-error" : undefined}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p id="email-error" role="alert" className="text-sm text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Rol</Label>
                                <Select
                                    value={role}
                                    onValueChange={(value) => value && setValue("role", value as Rol)}
                                    items={{
                                        admin: "Administrador",
                                        vendedor: "Vendedor",
                                        taller: "Taller",
                                    }}
                                >
                                    <SelectTrigger className="w-full" aria-label="Rol">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ROLE_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {isEditing ? "Nueva contraseña" : "Contraseña"}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={isEditing ? "Dejar vacío para no cambiar" : "••••••••"}
                                    aria-invalid={errors.password ? true : undefined}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p id="password-error" role="alert" className="text-sm text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                            <div>
                                <Label htmlFor="isActive">Usuario activo</Label>
                                <p id="isActive-description" className="text-xs text-muted-foreground">
                                    Los usuarios inactivos no pueden iniciar sesión.
                                </p>
                            </div>
                            <Switch
                                id="isActive"
                                checked={isActive}
                                onCheckedChange={(checked) => setValue("isActive", checked)}
                                aria-describedby="isActive-description"
                                        className="data-checked:bg-success"
                            />
                        </div>

                        {!isEditing && (
                            <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
                                <div className="flex gap-2">
                                    <ShieldCheck
                                        className="mt-0.5 size-4 shrink-0 text-primary"
                                        aria-hidden="true"
                                    />
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            Tratamiento de datos:
                                        </span>{" "}
                                        se registrarán el nombre, correo, rol y estado de
                                        la cuenta para gestionar el acceso y la
                                        autenticación en el sistema. Responsable: Import
                                        &amp; Export Pasión.{" "}
                                        <Link
                                            href="/privacidad"
                                            className="text-primary underline-offset-4 hover:underline"
                                        >
                                            Política de Privacidad
                                        </Link>
                                        .
                                    </p>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Checkbox
                                        id="informado"
                                        checked={informado}
                                        onCheckedChange={(checked) =>
                                            setValue("informado", checked)
                                        }
                                        aria-invalid={errors.informado ? true : undefined}
                                        aria-describedby={
                                            errors.informado ? "informado-error" : undefined
                                        }
                                        className="mt-0.5"
                                    />
                                    <Label
                                        htmlFor="informado"
                                        className="items-start text-xs leading-relaxed font-normal text-muted-foreground"
                                    >
                                        Confirmo que informé a esta persona sobre el
                                        tratamiento de sus datos personales y la finalidad
                                        indicada.
                                    </Label>
                                </div>

                                {errors.informado && (
                                    <p
                                        id="informado-error"
                                        role="alert"
                                        className="text-xs text-destructive"
                                    >
                                        {errors.informado.message}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </form>
            </FormProvider>
        </FormDialog>
    )
}