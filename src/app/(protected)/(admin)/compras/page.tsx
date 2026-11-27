"use client"

/**
 * Página de compras del Admin (solo rol admin).
 *
 * Container de la compra a proveedores nacionales: stats de compras,
 * el formulario de compra (OperacionForm modo "compra") y las últimas
 * compras registradas.
 */

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCompras } from "@/features/inventario/hooks/use-compras"
import { useProveedores } from "@/features/proveedores/hooks/use-proveedores"
import { OperacionForm } from "@/features/inventario/components/operacion-form"
import { EntradasStats } from "@/features/inventario/components/entradas-stats"
import { RecentEntradas } from "@/features/inventario/components/recent-entradas"

export default function ComprasPage() {
    const { usuario } = useAuth()
    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
        refetch: refetchProducts,
    } = useProducts()

    const {
        data: compras,
        isLoading: isLoadingCompras,
        isError: isErrorCompras,
        refetch: refetchCompras,
    } = useCompras()

    const {
        data: proveedores,
        isLoading: isLoadingProveedores,
        isError: isErrorProveedores,
        refetch: refetchProveedores,
    } = useProveedores()

    const productList = products ?? []
    const proveedorList = proveedores ?? []

    const compraList = compras ?? []

    const handleRetry = () => {
        refetchProducts()
        refetchCompras()
        refetchProveedores()
    }

    if (isErrorProducts || isErrorCompras || isErrorProveedores) {
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
                    No se pudieron cargar las compras.
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

    if (isLoadingProducts || isLoadingCompras || isLoadingProveedores) {
        return (
            <div
                role="status"
                aria-busy="true"
                aria-live="polite"
                className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground"
            >
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm">Cargando datos de compras...</span>
            </div>
        )
    }

    return (
        <main className="flex flex-col gap-6 sm:gap-8">
            <h1 className="sr-only">Compras de Inventario</h1>

            <EntradasStats
                products={productList}
                entries={compraList}
                tituloEntradas30="Compras últimos 30 días"
                tituloUltima="Última compra"
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
                <OperacionForm
                    modo="compra"
                    products={productList}
                    proveedores={proveedorList}
                    responsable={usuario?.nombre ?? "Sin asignar"}
                />
                <RecentEntradas
                    products={productList}
                    entries={compraList}
                    proveedores={proveedorList}
                    titulo="Últimas compras"
                    descripcion="Los últimos registros de compra al inventario."
                    emptyTitle="Sin compras recientes"
                    emptyHint="Registrá una compra para verla reflejada aquí."
                />
            </div>
        </main>
    )
}