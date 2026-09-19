"use client"

/**
 * Card de etiqueta para la grilla de Etiquetas QR (taller).
 *
 * Vista previa de la etiqueta en pantalla. Presentacional y accesible.
 */

import { cn } from "cn"
import { FileDown, Loader2, QrCode } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { CATEGORY_TONE_CLASSES } from "@/features/products/components/product-card"
import { getCategoryTone } from "@/features/products/utils"
import type { Product } from "@/types/products"

interface EtiquetaCardProps {
    product: Product
    categoryName: string
    subcategoryName: string
    rootCategoryId: number | undefined
    isSelected: boolean
    onToggleSelect: () => void
    isDownloading: boolean
    onDownload: (product: Product) => void
}

export function EtiquetaCard({
    product,
    categoryName,
    subcategoryName,
    rootCategoryId,
    isSelected,
    onToggleSelect,
    isDownloading,
    onDownload,
}: EtiquetaCardProps) {
    const tone = getCategoryTone(rootCategoryId)
    const { surface, icon, badge } = CATEGORY_TONE_CLASSES[tone]

    return (
        <Card className="group h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
            {/* Vista previa de la etiqueta */}
            <div
                className={cn(
                    "relative flex h-28 items-center justify-center",
                    surface
                )}
            >
                {/* Icono QR decorativo */}
                <div
                    aria-hidden="true"
                    className="flex size-14 items-center justify-center rounded-full bg-white/70 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:ring-white/10"
                >
                    <QrCode className={cn("size-7", icon)} />
                </div>

                {/* SKU visible y legible por lector de pantalla */}
                <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 border-transparent bg-black/60 font-mono text-[10px] text-white backdrop-blur-sm"
                >
                    <span className="sr-only">SKU: </span>
                    {product.sku}
                </Badge>

                {/* Checkbox accesible */}
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={onToggleSelect}
                    aria-label={`Seleccionar etiqueta de ${product.name}`}
                    title="Marcar para descargar junto con las seleccionadas"
                    className="absolute top-2 left-2 bg-white/90 shadow-sm dark:bg-background/90"
                />
            </div>

            <div className="flex flex-1 flex-col gap-2.5 p-4">
                {/* Nombre de producto semántico */}
                <h3 className="truncate text-sm font-semibold" title={product.name}>
                    {product.name}
                </h3>

                {/* Categorías */}
                <div className="flex flex-wrap items-center gap-1.5" aria-label="Categorías del producto">
                    <Badge variant="outline" className={cn("truncate", badge)}>
                        {categoryName}
                    </Badge>
                    {subcategoryName !== "—" && (
                        <Badge variant="outline" className="truncate text-muted-foreground">
                            {subcategoryName}
                        </Badge>
                    )}
                </div>

                {/* Acciones */}
                <div className="mt-auto pt-1">
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => onDownload(product)}
                        disabled={isDownloading}
                        aria-busy={isDownloading}
                        aria-label={
                            isDownloading
                                ? `Generando etiqueta para ${product.name}`
                                : `Imprimir etiqueta de ${product.name}`
                        }
                        className="w-full h-9 gap-2"
                    >
                        {isDownloading ? (
                            <Loader2
                                className="size-3.5 animate-spin"
                                aria-hidden="true"
                            />
                        ) : (
                            <FileDown className="size-3.5" aria-hidden="true" />
                        )}
                        <span aria-live="polite">
                            {isDownloading ? "Generando..." : "Imprimir"}
                        </span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}