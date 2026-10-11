"use client"

/**
 * Página de mermas del taller (solo rol taller).
 *
 * Container: junta los hooks de datos (useProducts, useMermas) y el
 * usuario logueado (responsable del ajuste) con los componentes
 * armados en features/mermas: stats, la card de registro y la lista
 * de últimos ajustes.
 */

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/features/products/hooks/use-products"
import { useMermas } from "@/features/mermas/hooks/use-mermas"
import { MermasStats } from "@/features/mermas/components/mermas-stats"
import { MermaForm } from "@/features/mermas/components/merma-form"
import { RecentMermas } from "@/features/mermas/components/recent-mermas"

export default function MermasPage() {
    const { usuario } = useAuth()

    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts,
    } = useProducts()

    const {
        data: mermas,
        isLoading: isLoadingMermas,
        isError: isErrorMermas,
        refetch: refetchMermas,
    } = useMermas()

    const productList = products ?? []
    const mermaList = mermas ?? []

    const handleRetry = () => {
        refetchProducts()
        refetchMermas()
    }

    // Estado de Error Accesible
    if (isErrorProducts || isErrorMermas) {
        return (
            <div
                role="alert"
                aria-live="assertive"
                className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <p className="text-sm font-medium text-foreground">
                    No se pudieron cargar las mermas.
                </p>
                <p className="text-xs text-muted-foreground">
                    Ocurrió un problema al conectar con el servidor.
                </p>
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

    // Estado de Carga Accesible
    if (isLoadingProducts || isLoadingMermas) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm">Cargando datos de mermas...</span>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            {/* Título accesible para navegación de lectores de pantalla */}
            <h1 className="sr-only">Gestión de Mermas del taller</h1>

            <MermasStats products={productList} mermas={mermaList} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                <MermaForm
                    products={productList}
                    responsable={usuario?.nombre ?? "Sin asignar"}
                />
                <RecentMermas
                    products={productList}
                    mermas={mermaList}
                />
            </div>
        </main>
    )
}