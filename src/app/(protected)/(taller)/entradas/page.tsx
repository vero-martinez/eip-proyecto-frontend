"use client"

/**
 * Página de entradas del taller (solo rol taller).
 *
 * Container: junta los hooks de datos (useProducts, useStockEntries)
 * con los componentes armados en features/entradas: stats, la card de
 * registro y la lista de últimas entradas.
 *
 * Lee el query param "producto" (ej. desde Alertas) para pre-seleccionar
 * un producto en el formulario de registro.
 */

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/features/products/hooks/use-products"
import { useStockEntries } from "@/features/entradas/hooks/use-entradas"
import { useProveedores } from "@/features/entradas/hooks/use-proveedores"
import { EntradasStats } from "@/features/entradas/components/entradas-stats"
import { EntradaForm } from "@/features/entradas/components/entrada-form"
import { RecentEntradas } from "@/features/entradas/components/recent-entradas"

function EntradasPageContent() {
    const searchParams = useSearchParams()
    const rawProductId = searchParams.get("producto")
    const initialProductId =
        rawProductId && /^\d+$/.test(rawProductId)
            ? Number(rawProductId)
            : undefined

    const { usuario } = useAuth()
    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts,
    } = useProducts()

    const {
        data: entries,
        isLoading: isLoadingEntries,
        isError: isErrorEntries,
        refetch: refetchEntries,
    } = useStockEntries()

    const {
        data: proveedores,
        isLoading: isLoadingProveedores,
        isError: isErrorProveedores,
        refetch: refetchProveedores,
    } = useProveedores()

    const productList = products ?? []
    const entryList = entries ?? []
    const proveedorList = proveedores ?? []

    const handleRetry = () => {
        refetchProducts()
        refetchEntries()
        refetchProveedores()
    }

    // Estado de Error Accesible
    if (isErrorProducts || isErrorEntries || isErrorProveedores) {
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
                    No se pudieron cargar las entradas.
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
    if (isLoadingProducts || isLoadingEntries || isLoadingProveedores) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm">Cargando datos de entradas...</span>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            {/* Título accesible para navegación de lectores de pantalla */}
            <h1 className="sr-only">Gestión de Entradas de Stock</h1>

            <EntradasStats products={productList} entries={entryList} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                <EntradaForm
                    products={productList}
                    proveedores={proveedorList}
                    responsable={usuario?.nombre ?? "Sin asignar"}
                    initialProductId={initialProductId}
                />
                <RecentEntradas
                    products={productList}
                    entries={entryList}
                    proveedores={proveedorList}
                />
            </div>
        </main>
    )
}

export default function EntradasPage() {
    // useSearchParams requiere un boundary de Suspense para el prerender.
    return (
        <Suspense fallback={null}>
            <EntradasPageContent />
        </Suspense>
    )
}