"use client"

/**
 * Diálogo de boleta: muestra la boleta de una venta (POS o Mis ventas)
 * sobre el FormDialog compartido, con acción de descarga en PDF.
 */

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormDialog } from "@/components/common/form-dialog"

import { downloadVentaBoleta } from "../services/ventas-pdf.service"
import type { Venta } from "../types"
import { VentaBoleta } from "./boleta"

interface VentaBoletaDialogProps {
    /** Venta a mostrar; null cierra el diálogo. */
    venta: Venta | null
    onOpenChange: (open: boolean) => void
}

export function VentaBoletaDialog({
    venta,
    onOpenChange,
}: VentaBoletaDialogProps) {
    const [isDownloading, setIsDownloading] = useState(false)

    const handleDownload = async () => {
        if (!venta || isDownloading) return
        setIsDownloading(true)
        try {
            await downloadVentaBoleta(venta)
            toast.success(`Boleta ${venta.folio} descargada`)
        } catch {
            toast.error("No se pudo generar el PDF. Intentá de nuevo.")
        } finally {
            setIsDownloading(false)
        }
    }

    const footer = (
        <div className="flex flex-col-reverse gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:justify-end">
            <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isDownloading}
            >
                Cerrar
            </Button>
            <Button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading || !venta}
                aria-busy={isDownloading}
                aria-label={
                    venta
                        ? `Descargar boleta ${venta.folio} en PDF`
                        : "Descargar boleta en PDF"
                }
                className="gap-1.5"
            >
                {isDownloading ? (
                    <Loader2
                        className="size-4 animate-spin"
                        aria-hidden="true"
                    />
                ) : (
                    <FileDown className="size-4" aria-hidden="true" />
                )}
                {isDownloading ? "Generando..." : "Descargar PDF"}
            </Button>
        </div>
    )

    return (
        <FormDialog
            open={venta !== null}
            onOpenChange={onOpenChange}
            title={venta ? `Boleta ${venta.folio}` : "Boleta de venta"}
            description="Vista previa y descarga en PDF de la boleta."
            footer={footer}
            className="max-w-[calc(100%-1rem)] rounded-md sm:max-w-sm"
        >
            {venta && <VentaBoleta venta={venta} />}
        </FormDialog>
    )
}