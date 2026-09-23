"use client"

/**
 * Página del Catálogo (solo para el rol taller).
 *
 * Container: junta los hooks de datos (useProducts, useCategories) con
 * la vista del catálogo. El precio de costo se mantiene oculto.
 */

import { AlertTriangle } from "lucide-react"

import { useAuth } from "@/providers/auth-provider"
import { useProducts } from "@/features/products/hooks/use-products"
import { useCategories } from "@/features/products/hooks/use-categories"
import { CatalogView } from "@/features/products/components/catalog-view"

export default function CatalogoPage() {
    const { usuario } = useAuth()
    const {
        data: products,
        isLoading: isLoadingProducts,
        isError: isErrorProducts,
    } = useProducts()
    const {
        data: categories,
        isLoading: isLoadingCategories,
        isError: isErrorCategories,
    } = useCategories()

    if (isErrorProducts || isErrorCategories) {
        return (
            <div
                role="alert"
                className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground"
            >
                <AlertTriangle
                    className="size-8 text-destructive"
                    aria-hidden="true"
                />
                <p>No se pudo cargar el catálogo. Intentá nuevamente.</p>
            </div>
        )
    }

    if (isLoadingProducts || isLoadingCategories) {
        return (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
                Cargando catálogo...
            </div>
        )
    }

    return (
        <CatalogView
            products={products ?? []}
            categories={categories ?? []}
            showCost={usuario?.rol === "admin"}
        />
    )
}