/**
 * Página: AlertasPage (Alertas del taller)
 *
 * Descripción:
 * Contenedor principal que consulta los datos de inventario y categorías para presentar
 * las métricas clave y la lista de alertas de reposición del taller.
 */

"use client"

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCategories } from "@/features/products/hooks/use-categories"
import { useProducts } from "@/features/products/hooks/use-products"
import { AlertasLista } from "@/features/alertas/components/alertas-lista"
import { AlertasStats } from "@/features/alertas/components/alertas-stats"

export default function AlertasPage() {
    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts,
    } = useProducts()

    const {
        data: categories,
        isLoading: isLoadingCategories,
        isError: isErrorCategories,
        refetch: refetchCategories,
    } = useCategories()

    const productList = products ?? []
    const categoryList = categories ?? []

    const handleRetry = () => {
        refetchProducts()
        refetchCategories()
    }

    // Estado de Carga Accesible
    if (isLoadingProducts || isLoadingCategories) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2
                    className="size-6 animate-spin text-primary"
                    aria-hidden="true"
                />
                <span className="text-sm font-medium">Cargando alertas...</span>
            </div>
        )
    }

    // Estado de Error Accesible
    if (isErrorProducts || isErrorCategories) {
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
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground">
                        No se pudieron cargar las alertas.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Ocurrió un problema al conectar con el servidor.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="mt-1 gap-2"
                >
                    <RefreshCw className="size-3.5" aria-hidden="true" />
                    <span>Reintentar</span>
                </Button>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            {/* Título semántico para la navegación con lectores de pantalla */}
            <h1 className="sr-only">Alertas del Taller</h1>

            {/* Métrica general de productos en riesgo */}
            <AlertasStats products={productList} />

            {/* Lista detallada con filtros de búsqueda y acción directa */}
            <AlertasLista
                products={productList}
                categories={categoryList}
            />
        </main>
    )
}