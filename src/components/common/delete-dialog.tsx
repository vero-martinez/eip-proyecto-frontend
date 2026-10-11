"use client"

/**
 * Diálogo de confirmación de borrado reutilizable, especializado
 * solo en acciones destructivas. Usa AlertDialog (no Dialog) por la
 * semántica de "acción irreversible" y trae el estilo destructivo
 * por defecto: icono de papelera y botón de confirmar rojo.
 */

import type { ReactNode } from "react"
import { Loader2, Trash2 } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    message?: ReactNode
    confirmLabel?: string
    cancelLabel?: string
    /** Deshabilita los botones y muestra un spinner en confirmar */
    isLoading?: boolean
    onConfirm: () => void
}

export function DeleteDialog({
    open,
    onOpenChange,
    title,
    message,
    confirmLabel = "Eliminar",
    cancelLabel = "Cancelar",
    isLoading = false,
    onConfirm,
}: DeleteDialogProps) {
    return (
        <AlertDialog
            open={open}
            onOpenChange={(isOpen) => {
                if (isLoading && !isOpen) return
                onOpenChange(isOpen)
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader className="flex flex-row items-start gap-3 text-left">
                    <AlertDialogMedia className="mb-0 size-10 shrink-0 rounded-full bg-destructive/15 text-destructive dark:bg-destructive/20">
                        <Trash2 className="size-6" aria-hidden="true" />
                    </AlertDialogMedia>
                    <div className="flex flex-col gap-1.5">
                        <AlertDialogTitle>{title}</AlertDialogTitle>
                        {message && (
                            <AlertDialogDescription>
                                {message}
                            </AlertDialogDescription>
                        )}
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="flex-1 h-9"
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="flex-1 h-9 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                                {confirmLabel}
                            </>
                        ) : (
                            confirmLabel
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}