"use client"

/**
 * Página principal del Historial de Movimientos de Inventario.
 */

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import { MovimientoDetailDialog } from "@/features/movimientos/components/movimiento-detail-dialog"
import { MovimientosStats } from "@/features/movimientos/components/movimientos-stats"
import { MovimientosList } from "@/features/movimientos/components/movimientos-list"
import { useMovimientos } from "@/features/movimientos/hooks/use-movimientos"

import type { InventoryMovement } from "@/features/movimientos/types"

export default function MovimientosPage() {
    const {
        data: movements,
        isLoading: isLoadingMovements,
        isError: isErrorMovements,
        refetch: refetchMovements,
    } = useMovimientos()

    const [movimientoDetalle, setMovimientoDetalle] =
        React.useState<InventoryMovement | null>(null)

    const handleRetry = () => {
        refetchMovements()
    }

    const handleDetailOpenChange = (open: boolean) => {
        if (!open) setMovimientoDetalle(null)
    }

    if (isErrorMovements) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        No se pudieron cargar los movimientos.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Ocurrió un problema al conectar con el servidor.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-2 gap-2"
                >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Reintentar</span>
                </Button>
            </div>
        )
    }

    if (isLoadingMovements) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                aria-atomic="true"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2
                    className="size-6 animate-spin text-primary"
                    aria-hidden="true"
                />
                <span className="text-sm">
                    Cargando historial de movimientos...
                </span>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            <h1 className="sr-only">Historial de Movimientos de Inventario</h1>

            <MovimientosStats movements={movements ?? []} />

            <MovimientosList
                movements={movements ?? []}
                onView={setMovimientoDetalle}
            />

            <MovimientoDetailDialog
                movement={movimientoDetalle}
                onOpenChange={handleDetailOpenChange}
            />
        </main>
    )
}