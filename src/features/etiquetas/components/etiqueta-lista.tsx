"use client"

/**
 * Grilla de tarjetas de etiquetas QR del taller.
 * Incluye filtro local por nombre/SKU, selección masiva y descargas en PDF.
 * Componente presentacional totalmente accesible y responsivo.
 */

import { FileDown, Inbox, Loader2, QrCode, Search, X } from "lucide-react"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group"

import {
    getParentCategoryName,
    getRootCategoryId,
    getSubcategoryName,
} from "@/features/products/utils"
import type { Category, Product } from "@/types/products"

import { EtiquetaCard } from "./etiqueta-card"

interface EtiquetaListaProps {
    /** Productos activos ya filtrados por el término de búsqueda. */
    products: Product[]
    /** Total de productos activos (sin filtro). */
    total: number
    categories: Category[]
    searchQuery: string
    onSearchQueryChange: (query: string) => void
    /** Cantidad de tarjetas marcadas. */
    selectedCount: number
    isSelected: (id: number) => boolean
    onToggleSelected: (id: number) => void
    onClearSelection: () => void
    isDownloading: boolean
    isDownloadingAll: boolean
    isDownloadingSelected: boolean
    isDownloadingProduct: (id: number) => boolean
    onDownloadAll: () => void
    onDownloadSelected: () => void
    onDownloadProduct: (product: Product) => void
}

export function EtiquetaLista({
    products,
    total,
    categories,
    searchQuery,
    onSearchQueryChange,
    selectedCount,
    isSelected,
    onToggleSelected,
    onClearSelection,
    isDownloading,
    isDownloadingAll,
    isDownloadingSelected,
    isDownloadingProduct,
    onDownloadAll,
    onDownloadSelected,
    onDownloadProduct,
}: EtiquetaListaProps) {
    const hasFilters = searchQuery.trim() !== ""

    return (
        <Card className="border-border/80 shadow-sm transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                    <span
                        className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-800"
                        aria-hidden="true"
                    >
                        <QrCode className="size-5" />
                    </span>
                    <div className="flex flex-col gap-0.5">
                        <CardTitle className="text-base font-semibold leading-tight">
                            Productos con etiquetas
                        </CardTitle>
                        <CardDescription
                            id="lista-etiquetas-descripcion"
                            className="text-xs text-muted-foreground"
                        >
                            {total}{" "}
                            {total === 1
                                ? "producto activo listo para etiquetar"
                                : "productos activos listos para etiquetar"}
                            {hasFilters && " (filtrados)"}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 pt-0">
                {/* Controles de Búsqueda y Acciones principales */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <InputGroup className="h-9 flex-1">
                        <InputGroupAddon>
                            <Search className="size-4" aria-hidden="true" />
                        </InputGroupAddon>
                        <InputGroupInput
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            placeholder="Buscar por nombre o SKU..."
                            aria-label="Filtrar productos por nombre o SKU"
                            aria-describedby="lista-etiquetas-descripcion"
                            className="h-9 pr-8"
                        />
                        {hasFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onSearchQueryChange("")}
                                aria-label="Limpiar término de búsqueda"
                                className="absolute right-1 top-1/2 -translate-y-1/2 size-7 p-0 text-muted-foreground hover:text-foreground"
                            >
                                <X className="size-3.5" aria-hidden="true" />
                            </Button>
                        )}
                    </InputGroup>

                    {/* Botones de Descarga */}
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        <Button
                            type="button"
                            size="sm"
                            onClick={onDownloadSelected}
                            disabled={selectedCount === 0 || isDownloading}
                            aria-busy={isDownloadingSelected}
                            aria-label={
                                isDownloadingSelected
                                    ? `Generando PDF con ${selectedCount} etiquetas seleccionadas`
                                    : `Descargar PDF con ${selectedCount} etiquetas seleccionadas`
                            }
                            className="h-9 flex-1 gap-2 sm:flex-none"
                        >
                            {isDownloadingSelected ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                                <FileDown className="size-4" aria-hidden="true" />
                            )}
                            <span aria-live="polite">
                                {selectedCount > 0
                                    ? `Descargar seleccionadas (${selectedCount})`
                                    : "Descargar seleccionadas"}
                            </span>
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            onClick={onDownloadAll}
                            disabled={total === 0 || isDownloading}
                            aria-busy={isDownloadingAll}
                            aria-label={
                                isDownloadingAll
                                    ? `Generando PDF con las ${total} etiquetas activas`
                                    : `Descargar PDF con todas las ${total} etiquetas`
                            }
                            className="h-9 flex-1 gap-2 bg-amber-400 text-white hover:bg-amber-500 dark:bg-amber-500 dark:hover:bg-amber-600 sm:flex-none"
                        >
                            {isDownloadingAll ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                                <FileDown className="size-4" aria-hidden="true" />
                            )}
                            <span aria-live="polite">
                                {total > 0
                                    ? `Descargar todas (${total})`
                                    : "Descargar todas"}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Toolbar de selección activa */}
                {selectedCount > 0 && (
                    <div
                        role="region"
                        aria-live="polite"
                        aria-label="Estado de la selección de etiquetas"
                        className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-primary dark:bg-primary/15"
                    >
                        <p className="text-xs font-medium">
                            {selectedCount}{" "}
                            {selectedCount === 1
                                ? "etiqueta seleccionada"
                                : "etiquetas seleccionadas"}{" "}
                            para impresión unificada
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClearSelection}
                            disabled={isDownloading}
                            aria-label="Deseleccionar todas las etiquetas marcadas"
                            className="h-7 gap-1.5 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
                        >
                            <X className="size-3.5" aria-hidden="true" />
                            <span>Limpiar selección</span>
                        </Button>
                    </div>
                )}

                {/* Contenido principal: Grilla / Estado vacío */}
                {products.length > 0 ? (
                    <div
                        role="region"
                        aria-label="Grilla de etiquetas de productos"
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    >
                        {products.map((product) => (
                            <EtiquetaCard
                                key={product.id}
                                product={product}
                                categoryName={getParentCategoryName(
                                    product.categoryId,
                                    categories
                                )}
                                subcategoryName={getSubcategoryName(
                                    product.categoryId,
                                    categories
                                )}
                                rootCategoryId={getRootCategoryId(
                                    categories,
                                    product.categoryId
                                )}
                                isSelected={isSelected(product.id)}
                                onToggleSelect={() => onToggleSelected(product.id)}
                                isDownloading={isDownloadingProduct(product.id)}
                                onDownload={onDownloadProduct}
                            />
                        ))}
                    </div>
                ) : (
                    <div
                        role="status"
                        className="flex h-48 flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed p-6 text-center text-muted-foreground"
                    >
                        <div
                            className="flex size-11 items-center justify-center rounded-full bg-muted/80 ring-1 ring-border/50"
                            aria-hidden="true"
                        >
                            <Inbox className="size-5 text-muted-foreground/70" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                                {total === 0
                                    ? "No hay productos activos"
                                    : "Sin resultados coincidentes"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {total === 0
                                    ? "Activá productos en el catálogo para generar sus etiquetas."
                                    : "No encontramos productos que coincidan con la búsqueda."}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}