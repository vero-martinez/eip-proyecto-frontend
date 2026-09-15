"use client"

/**
 * Error boundary global — captura errores no manejados que ocurren
 * en cualquier componente de la app en runtime (ej: una query que
 * falla y no fue atrapada, un error de renderizado).
 *
 * Debe ser un Client Component obligatoriamente (requisito de Next.js).
 */

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Acá, más adelante, se podría mandar el error a un servicio
        // de monitoreo (Sentry, etc.) — por ahora solo lo logueamos.
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
            <AlertTriangle className="size-16 text-destructive" />
            <h1 className="text-2xl font-bold">Algo salió mal</h1>
            <p className="text-muted-foreground max-w-md">
                Ocurrió un error inesperado. Puedes intentar de nuevo o volver más tarde.
            </p>
            <Button onClick={reset}>Intentar de nuevo</Button>
        </div>
    )
}