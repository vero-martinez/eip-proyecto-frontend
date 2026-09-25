"use client"

/**
 * Página del módulo de Comercio Exterior (importaciones y exportaciones).
 *
 * Container: junta los datos (operaciones, socios comerciales, productos) y
 * arma las tarjetas de resumen, la tabla con su detalle y el dialog de
 * alta. El usuario logueado queda como responsable de las operaciones.
 */

import { useState } from "react"
import { AlertTriangle, Loader2, Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/features/products/hooks/use-products"
import {
    useOperaciones,
    useSociosComerciales,
} from "@/features/comercio-exterior/hooks"
import { OperacionesStats } from "@/features/comercio-exterior/components/operaciones-stats"
import { OperacionesTable } from "@/features/comercio-exterior/components/operaciones-table"
import { OperacionDetailDialog } from "@/features/comercio-exterior/components/operacion-detail-dialog"
import { OperacionFormDialog } from "@/features/comercio-exterior/components/operacion-form-dialog"
import type { OperacionComercioExterior } from "@/features/comercio-exterior/types"

export default function ComercioExteriorPage() {
    const { usuario } = useAuth()
    const responsable = usuario?.nombre ?? "Sin asignar"

    const {
        data: operaciones,
        isLoading: isLoadingOperaciones,
        isError: isErrorOperaciones,
        refetch: refetchOperaciones,
    } = useOperaciones()
    const {
        data: socios,
        isLoading: isLoadingSocios,
        isError: isErrorSocios,
        refetch: refetchSocios,
    } = useSociosComerciales()
    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts,
    } = useProducts()

    const [detalleOperacion, setDetalleOperacion] =
        useState<OperacionComercioExterior | null>(null)
    const [crearAbierto, setCrearAbierto] = useState(false)

    const isLoading =
        isLoadingOperaciones || isLoadingSocios || isLoadingProducts
    const isError =
        isErrorOperaciones || isErrorSocios || isErrorProducts

    const handleRetry = () => {
        refetchOperaciones()
        refetchSocios()
        refetchProducts()
    }

    const handleDetailOpenChange = (open: boolean) => {
        if (!open) setDetalleOperacion(null)
    }

    if (isError) {
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
                        No se pudieron cargar las operaciones de comercio exterior.
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

    if (isLoading) {
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
                    Cargando comercio exterior...
                </span>
            </div>
        )
    }

    const sociosComerciales = socios ?? []
    const productList = products ?? []

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            <h1 className="sr-only">Comercio Exterior</h1>

            {/* Encabezado */}
            <div className="flex flex-wrap items-center justify-end gap-4">
                <Button
                    onClick={() => setCrearAbierto(true)}
                    className="h-10 gap-2"
                >
                    <Plus className="size-4" aria-hidden="true" />
                    Nueva operación
                </Button>
            </div>

            <OperacionesStats operaciones={operaciones ?? []} />

            <OperacionesTable
                operaciones={operaciones ?? []}
                onView={setDetalleOperacion}
            />

            <OperacionDetailDialog
                operacion={detalleOperacion}
                onOpenChange={handleDetailOpenChange}
            />

            <OperacionFormDialog
                open={crearAbierto}
                onOpenChange={setCrearAbierto}
                products={productList}
                sociosComerciales={sociosComerciales}
                responsable={responsable}
            />
        </main>
    )
}