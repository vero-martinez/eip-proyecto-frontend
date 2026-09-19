"use client"

/**
 * Página de etiquetas QR del taller (solo rol taller).
 *
 * Container: junta los hooks de datos (useProducts, useCategories) con la
 * lógica del módulo (useEtiquetado) y realiza el wiring con el componente
 * presentacional (EtiquetaLista).
 */

import { useCallback } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { useProducts } from "@/features/products/hooks/use-products"
import { useCategories } from "@/features/products/hooks/use-categories"
import { useEtiquetado } from "@/features/etiquetas/hooks/use-etiquetado"
import { EtiquetaLista } from "@/features/etiquetas/components/etiqueta-lista"

export default function EtiquetasPage() {
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

    const handleRetry = useCallback(() => {
        refetchProducts()
        refetchCategories()
    }, [refetchProducts, refetchCategories])

    const {
        activeProducts,
        searchQuery,
        setSearchQuery,
        filteredProducts,
        selectedCount,
        isSelected,
        handleToggleSelected,
        handleClearSelection,
        isDownloading,
        isDownloadingAll,
        isDownloadingSelected,
        isDownloadingProduct,
        handleDownloadProduct,
        handleDownloadAll,
        handleDownloadSelected,
    } = useEtiquetado(productList)

    // Estado de Error
    if (isErrorProducts || isErrorCategories) {
        return (
            <main className="flex flex-col gap-6 sm:gap-8">
                <h1 className="sr-only">Etiquetas QR</h1>
                <div
                    role="alert"
                    aria-live="assertive"
                    className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center text-muted-foreground"
                >
                    <div
                        className="flex size-12 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20"
                        aria-hidden="true"
                    >
                        <AlertTriangle className="size-6 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                            No se pudieron cargar las etiquetas
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Ocurrió un problema al conectar con el servidor. Verificá tu conexión e intentalo de nuevo.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="mt-2 gap-2"
                    >
                        <RefreshCw className="size-3.5" aria-hidden="true" />
                        <span>Reintentar</span>
                    </Button>
                </div>
            </main>
        )
    }

    // Estado de Carga (Skeleton estructurado)
    if (isLoadingProducts || isLoadingCategories) {
        return (
            <main
                className="flex flex-col gap-6 sm:gap-8"
                aria-busy="true"
                aria-label="Cargando catálogo de etiquetas"
            >
                <h1 className="sr-only">Etiquetas QR</h1>

                <Card className="border-border/80 shadow-sm">
                    <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="size-9 rounded-lg" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-3.5 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                        {/* Controles ficticios */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <Skeleton className="h-9 w-full lg:max-w-md" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-44" />
                                <Skeleton className="h-9 w-36" />
                            </div>
                        </div>

                        {/* Grilla de Skeletons */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div
                                    key={`skeleton-card-${index}`}
                                    className="flex flex-col justify-between rounded-lg border p-4 space-y-3"
                                >
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                    <div className="flex justify-center py-4">
                                        <Skeleton className="size-28 rounded-md" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Skeleton className="h-8 flex-1" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        )
    }

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            {/* Título accesible para lectores de pantalla */}
            <h1 className="sr-only">Etiquetas QR</h1>

            <EtiquetaLista
                products={filteredProducts}
                total={activeProducts.length}
                categories={categoryList}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedCount={selectedCount}
                isSelected={isSelected}
                onToggleSelected={handleToggleSelected}
                onClearSelection={handleClearSelection}
                isDownloading={isDownloading}
                isDownloadingAll={isDownloadingAll}
                isDownloadingSelected={isDownloadingSelected}
                isDownloadingProduct={isDownloadingProduct}
                onDownloadAll={handleDownloadAll}
                onDownloadSelected={handleDownloadSelected}
                onDownloadProduct={handleDownloadProduct}
            />
        </main>
    )
}