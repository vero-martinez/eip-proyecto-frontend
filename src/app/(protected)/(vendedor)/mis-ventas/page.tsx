"use client"

/**
 * Página "Mis ventas".
 *
 * Container: junta el usuario logueado (para filtrar las ventas del
 * vendedor) y el hook de ventas con las cards de métricas y el
 * historial armados en features/ventas.
 */

import { useMemo } from "react"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useVentas } from "@/features/ventas/hooks/use-ventas"
import { VentasStats } from "@/features/ventas/components/ventas-stats"
import { VentasLista } from "@/features/ventas/components/ventas-lista"

export default function MisVentasPage() {
    const { usuario } = useAuth()
    const {
        data: ventas = [],
        isLoading,
        isError,
        refetch,
    } = useVentas()

    const misVentas = useMemo(
        () => ventas.filter((venta) => venta.responsable === usuario?.nombre),
        [ventas, usuario?.nombre]
    )

    if (isLoading) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                aria-label="Cargando historial de ventas"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2
                    className="size-6 animate-spin text-primary"
                    aria-hidden="true"
                />
                <span className="text-sm font-medium">Cargando tus ventas...</span>
            </div>
        )
    }

    if (isError) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="flex h-64 flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <h2 className="text-sm font-semibold text-foreground">
                    No se pudieron cargar tus ventas
                </h2>
                <p className="text-xs text-muted-foreground">
                    Ocurrió un problema al conectar con el servidor.
                </p>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    aria-label="Reintentar carga de ventas"
                    className="mt-2 gap-2 font-bold"
                >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Reintentar</span>
                </Button>
            </div>
        )
    }

    return (
        <main 
            id="main-content" 
            tabIndex={-1} 
            className="flex flex-col gap-6 outline-none sm:gap-8"
        >
            <h1 className="sr-only">Mis ventas</h1>

            <section aria-label="Métricas de ventas">
                <VentasStats ventas={misVentas} />
            </section>

            <section aria-label="Historial de ventas">
                <VentasLista ventas={misVentas} />
            </section>
        </main>
    )
}