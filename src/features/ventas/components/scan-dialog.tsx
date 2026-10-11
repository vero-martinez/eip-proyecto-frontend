"use client"

/**
 * Diálogo de escaneo del Punto de Venta.
 *
 * Abre la cámara (cámara trasera) y detecta códigos QR de forma
 * continua con html5-qrcode. Los QR de los productos codifican el SKU:
 * al detectar un código conocido, agrega el producto al carrito y
 * cierra el diálogo. Si la cámara no está disponible o el usuario no
 * la permite, ofrece un ingreso manual del código como respaldo.
 *
 * El componente es presentacional: el container le pasa los productos,
 * el callback onProductScanned y el control de apertura.
 */

import { useEffect, useRef, useState } from "react"
import { Camera, Loader2, ScanBarcode, XCircle } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { findProductBySku } from "../utils"
import type { Product } from "@/types/products"

interface ScanDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    products: Product[]
    /** Se llama con el producto detectado para agregarlo al carrito. */
    onProductScanned: (product: Product) => void
}

const SCANNER_ELEMENT_ID = "pos-qr-scanner"

export function ScanDialog({
    open,
    onOpenChange,
    products,
    onProductScanned,
}: ScanDialogProps) {
    const [cameraState, setCameraState] = useState<
        "idle" | "starting" | "scanning" | "error"
    >("idle")
    const [message, setMessage] = useState<string | null>(null)
    const [manualCode, setManualCode] = useState("")
    const [retryCount, setRetryCount] = useState(0)

    const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null)
    const onScannedRef = useRef(onProductScanned)
    const productsRef = useRef(products)

    // Mantiene actualizadas las props para los callbacks del escáner sin
    // reiniciar la cámara en cada render (acceso a refs solo vía efecto).
    useEffect(() => {
        onScannedRef.current = onProductScanned
        productsRef.current = products
    })

    const stopCamera = async () => {
        const scanner = scannerRef.current
        scannerRef.current = null
        if (!scanner) {
            setCameraState("idle")
            return
        }
        try {
            await scanner.stop()
        } catch {
            // ya estaba detenido o nunca inició
        }
        try {
            scanner.clear()
        } catch {
            // clear() es síncrono; no hace falta await
        }
        setCameraState("idle")
    }

    const handleCode = (code: string) => {
        const product = findProductBySku(productsRef.current, code)
        if (!product) {
            setMessage(`Código no encontrado: “${code.trim()}”. Verifica el SKU.`)
            return
        }
        setMessage(null)
        setManualCode("")
        stopCamera()
        onScannedRef.current(product)
        onOpenChange(false)
    }

    useEffect(() => {
        if (!open) return

        let cancelled = false

        const startCamera = async () => {
            setCameraState("starting")
            setMessage(null)

            try {
                const { Html5Qrcode } = await import("html5-qrcode")
                if (cancelled) return

                const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
                    verbose: false,
                })
                scannerRef.current = scanner

                await scanner.start(
                    { facingMode: "environment" },
                    {
                        fps: 12,
                        qrbox: { width: 240, height: 240 },
                    },
                    (decodedText) => handleCode(decodedText),
                    () => {
                        /* frame sin código: se ignora */
                    }
                )
                if (cancelled) return
                setCameraState("scanning")
            } catch {
                if (cancelled) return
                setCameraState("error")
                setMessage(
                    "No se pudo acceder a la cámara (puede que falte permiso o no tengas una). Usa el ingreso manual del código."
                )
            }
        }

        startCamera()

        return () => {
            cancelled = true
            scannerRef.current?.stop().catch(() => {})
            try {
                scannerRef.current?.clear()
            } catch {
                // contenedor sin escáner iniciado
            }
            scannerRef.current = null
            setCameraState("idle")
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, retryCount])

    const handleManualSubmit = () => {
        handleCode(manualCode)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col gap-4 p-6 sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ScanBarcode className="size-4" aria-hidden="true" />
                        Escanear producto
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Apunta la cámara al código QR del producto o escribe el
                        código (SKU) manualmente.
                    </DialogDescription>
                </DialogHeader>

                {/* Zona de cámara */}
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-accent/40">
                    <div id={SCANNER_ELEMENT_ID} className="h-full w-full" />

                    {cameraState !== "scanning" && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            {cameraState === "starting" ? (
                                <>
                                    <Loader2
                                        className="size-6 animate-spin text-primary"
                                        aria-hidden="true"
                                    />
                                    <span className="text-xs">
                                        Iniciando cámara...
                                    </span>
                                </>
                            ) : cameraState === "error" ? (
                                <>
                                    <XCircle
                                        className="size-6 text-destructive"
                                        aria-hidden="true"
                                    />
                                    <span className="max-w-[220px] text-center text-xs">
                                        Sin cámara disponible. Usa el ingreso
                                        manual de abajo.
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Camera
                                        className="size-6"
                                        aria-hidden="true"
                                    />
                                    <span className="text-xs">
                                        Esperando cámara...
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {message && (
                    <p
                        role="alert"
                        className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-warning"
                    >
                        {message}
                    </p>
                )}

                {cameraState === "error" && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setRetryCount((count) => count + 1)}
                    >
                        Reintentar cámara
                    </Button>
                )}

                {/* Ingreso manual */}
                <div className="space-y-2">
                    <Label htmlFor="scan-manual-code" className="text-sm font-medium">
                        Código o SKU (manual)
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="scan-manual-code"
                            value={manualCode}
                            onChange={(event) => setManualCode(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    event.preventDefault()
                                    handleManualSubmit()
                                }
                            }}
                            placeholder="Ej: EIP-0001"
                            autoComplete="off"
                            className="h-10"
                        />
                        <Button
                            type="button"
                            onClick={handleManualSubmit}
                            disabled={!manualCode.trim()}
                            className="h-10 gap-1.5"
                        >
                            <ScanBarcode className="size-4" aria-hidden="true" />
                            <span>Agregar</span>
                        </Button>
                    </div>
                </div>

                <DialogFooter className="sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}