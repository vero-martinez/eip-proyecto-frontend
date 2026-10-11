"use client"

/**
 * Hook para la gestión del módulo de etiquetado de productos.
 * Centraliza filtrado, selección masiva/individual y la descarga de PDFs.
 */

import { useMemo, useState } from "react"
import { toast } from "sonner"

import type { Product } from "@/types/products"
import {
    ALL_LABELS_PDF_FILENAME,
    SELECTED_LABELS_PDF_FILENAME,
    buildAllLabelsPdf,
    buildProductLabelPdf,
    downloadBlob,
    getLabelPdfFileName,
} from "../services/etiquetas-pdf.service"

type PendingDownload = "all" | "selected" | number | null

/** Extrae el mensaje de error para las notificaciones. */
function getErrorMessage(error: unknown, fallbackMessage: string): string {
    return error instanceof Error ? error.message : fallbackMessage
}

export function useEtiquetado(products: Product[]) {
    // ==========================================
    // ESTADO LOCAL
    // ==========================================

    const [searchQuery, setSearchQuery] = useState("")
    const [selectedIds, setSelectedIds] = useState<ReadonlySet<number>>(
        new Set()
    )
    const [pending, setPending] = useState<PendingDownload>(null)

    // ==========================================
    // FILTRADO Y PROPIEDADES DERIVADAS
    // ==========================================

    /** Productos activos aptos para etiquetado. */
    const activeProducts = useMemo(
        () => products.filter((product) => product.isActive),
        [products]
    )

    /** Productos filtrados según la búsqueda por nombre o SKU. */
    const filteredProducts = useMemo(() => {
        const term = searchQuery.trim().toLowerCase()
        if (!term) return activeProducts

        return activeProducts.filter(
            (product) =>
                product.name.toLowerCase().includes(term) ||
                product.sku.toLowerCase().includes(term)
        )
    }, [activeProducts, searchQuery])

    const selectedCount = selectedIds.size

    // Estados de descarga
    const isDownloading = pending !== null
    const isDownloadingAll = pending === "all"
    const isDownloadingSelected = pending === "selected"

    // ==========================================
    // MÉTODOS DE SELECCIÓN
    // ==========================================

    const isSelected = (id: number) => selectedIds.has(id)
    const isDownloadingProduct = (id: number) => pending === id

    const handleToggleSelected = (id: number) => {
        if (pending) return
        setSelectedIds((current) => {
            const next = new Set(current)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleClearSelection = () => {
        if (pending) return
        setSelectedIds(new Set())
    }

    // ==========================================
    // HANDLERS DE DESCARGA PDF
    // ==========================================

    /** Descarga la etiqueta de un solo producto. */
    const handleDownloadProduct = async (product: Product) => {
        if (pending) return
        setPending(product.id)

        try {
            const blob = await buildProductLabelPdf(product)
            downloadBlob(blob, getLabelPdfFileName(product.sku))
            toast.success(`Etiqueta descargada: ${product.name}`)
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "No se pudo generar la etiqueta. Intentá de nuevo."
                )
            )
        } finally {
            setPending(null)
        }
    }

    /** Descarga el PDF con las etiquetas de todos los productos activos. */
    const handleDownloadAll = async () => {
        if (pending) return
        if (activeProducts.length === 0) {
            toast.info("No hay productos activos para etiquetar")
            return
        }

        setPending("all")
        try {
            const blob = await buildAllLabelsPdf(activeProducts)
            downloadBlob(blob, ALL_LABELS_PDF_FILENAME)
            toast.success(
                `Etiquetas descargadas: ${activeProducts.length} productos`
            )
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "No se pudieron generar las etiquetas. Intentá de nuevo."
                )
            )
        } finally {
            setPending(null)
        }
    }

    /** Descarga el PDF unificado de los productos seleccionados. */
    const handleDownloadSelected = async () => {
        if (pending) return
        if (selectedCount === 0) {
            toast.info("Seleccioná al menos una etiqueta para descargar")
            return
        }

        setPending("selected")
        try {
            const selectedProducts = activeProducts.filter((product) =>
                selectedIds.has(product.id)
            )
            const blob = await buildAllLabelsPdf(selectedProducts)

            downloadBlob(blob, SELECTED_LABELS_PDF_FILENAME)
            toast.success(
                `Etiquetas descargadas: ${selectedCount} ${
                    selectedCount === 1 ? "producto" : "productos"
                }`
            )
            setSelectedIds(new Set())
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "No se pudieron generar las etiquetas. Intentá de nuevo."
                )
            )
        } finally {
            setPending(null)
        }
    }

    return {
        // Filtros y listas
        activeProducts,
        filteredProducts,
        searchQuery,
        setSearchQuery,

        // Selección
        selectedCount,
        isSelected,
        handleToggleSelected,
        handleClearSelection,

        // Descargas
        isDownloading,
        isDownloadingAll,
        isDownloadingSelected,
        isDownloadingProduct,
        handleDownloadProduct,
        handleDownloadAll,
        handleDownloadSelected,
    }
}