"use client"

/**
 * Dialog con formulario reutilizable: shell de dialog con header
 * (título, descripción y metadatos opcionales), cuerpo
 * scrolleable donde cada módulo coloca sus campos, y footer con
 * botones. El footer por defecto es "Cancelar" + "Guardar"; se puede
 * reemplazar completo vía la prop footer.
 *
 * Para que el botón Guardar ejecute la validación del formulario, se
 * usa el id del <form> interno vía formId (atributo form). Si no hay
 * formId, el botón dispara directamente onSubmit.
 */

import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface FormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    /** Fila de metadatos del header (ej. "SKU PRD-01 · Activo") */
    meta?: ReactNode
    /** id del <form> interno; el botón Guardar se asocia con form= */
    formId?: string
    submitLabel?: string
    isSubmitting?: boolean
    /** Deshabilita el botón de guardar (ej. falta una confirmación) */
    submitDisabled?: boolean
    /** Solo se usa cuando no se pasa formId (sin form nativo) */
    onSubmit?: () => void
    /** Reemplaza el footer default (Cancelar + Guardar) */
    footer?: ReactNode
    className?: string
    children: ReactNode
}

export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    meta,
    formId,
    submitLabel = "Guardar",
    isSubmitting = false,
    submitDisabled = false,
    onSubmit,
    footer,
    className,
    children,
}: FormDialogProps) {
    const defaultFooter = (
        <div className="flex flex-col-reverse gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
            >
                Cancelar
            </Button>
            <Button
                type={formId ? "submit" : "button"}
                form={formId}
                onClick={formId ? undefined : onSubmit}
                disabled={isSubmitting || submitDisabled}
            >
                {isSubmitting ? (
                    <>
                        <Loader2
                            className="size-4 animate-spin"
                            aria-hidden="true"
                        />
                        {submitLabel}
                    </>
                ) : (
                    submitLabel
                )}
            </Button>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "grid-rows-[auto_minmax(0,1fr)] max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-lg [&_[data-slot=dialog-close]]:text-primary-foreground",
                    className
                )}
            >
                <DialogHeader className="bg-primary px-6 py-6 text-left shadow-sm">
                    <DialogTitle className="text-xl font-bold text-primary-foreground">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-primary-foreground/80">
                            {description}
                        </DialogDescription>
                    )}
                    {meta && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-primary-foreground/80">
                            {meta}
                        </div>
                    )}
                </DialogHeader>

                <div className="min-h-0 overflow-y-auto px-6 py-6">{children}</div>

                {footer ?? defaultFooter}
            </DialogContent>
        </Dialog>
    )
}