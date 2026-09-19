"use client"

/**
 * Servicio de generación de etiquetas QR en PDF (taller).
 *
 * Arma PDFs A4 con jspdf y los QR PNG (dataURL) generados con qrcode.
 * El QR codifica únicamente el SKU del producto para que el lector del
 * POS (scan-dialog) pueda resolver el producto al escanear.
 *
 * jspdf usa fuentes estándar Latin-1/windows-1252, por lo que nombres
 * con acentos y ñ se imprimen correctamente.
 */

import jsPDF from "jspdf"
import { toDataURL } from "qrcode"

import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types/products"

// ==========================================
// CONSTANTES DE EXPORTACIÓN Y CONFIGURACIÓN
// ==========================================

export const ALL_LABELS_PDF_FILENAME = "etiquetas-todas.pdf"
export const SELECTED_LABELS_PDF_FILENAME = "etiquetas-seleccionadas.pdf"

// Constantes de layout (A4 en milímetros)
const A4_WIDTH = 210
const A4_HEIGHT = 297
const PAGE_MARGIN = 10
const GRID_COLS = 3
const GRID_GAP = 4
const CELL_PAD = 4
const QR_SINGLE_SIZE = 44
const QR_GRID_SIZE = 26

/** Ancho de cada celda de etiqueta en la grilla "todas". */
const GRID_CELL_WIDTH =
    (A4_WIDTH - 2 * PAGE_MARGIN - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS

const QR_OPTIONS = {
    errorCorrectionLevel: "M" as const,
    margin: 1,
    width: 512,
}

// Altura (mm) por línea de texto según el tamaño de fuente.
const NAME_LINE_HEIGHT = 4
const SKU_LINE_HEIGHT = 3.8
const PRICE_LINE_HEIGHT = 4.2

// ==========================================
// FUNCIONES AUXILIARES INTERNAS
// ==========================================

/**
 * Devuelve el texto del nombre partido para caber en maxWidth, con un
 * máximo de 2 líneas. Debe llamarse con el mismo estado de fuente que
 * usa drawLabelCell para que el corte coincida.
 */
function getNameLines(
    doc: jsPDF,
    name: string,
    maxWidth: number
): string[] {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    return doc.splitTextToSize(name, maxWidth).slice(0, 2)
}

/**
 * Estima la altura (mm) que ocupará la celda de una etiqueta para un
 * QR de qrSize. Se usa para paginar la grilla antes de dibujar.
 */
function estimateLabelHeight(
    doc: jsPDF,
    product: Product,
    qrSize: number,
    maxWidth: number
): number {
    const nameLines = getNameLines(doc, product.name, maxWidth).length
    return (
        CELL_PAD +
        qrSize +
        2 +
        nameLines * NAME_LINE_HEIGHT +
        1 +
        SKU_LINE_HEIGHT +
        1 +
        PRICE_LINE_HEIGHT +
        CELL_PAD
    )
}

/**
 * Dibuja una etiqueta (borde, QR y textos) dentro de la celda que va
 * de (x, y) a (x + cellW, y + cellH).
 */
function drawLabelCell(
    doc: jsPDF,
    product: Product,
    qrDataUrl: string,
    x: number,
    y: number,
    cellW: number,
    cellH: number,
    qrSize: number
): void {
    // Borde de corte de la etiqueta (stickers).
    doc.setDrawColor(190)
    doc.setLineWidth(0.2)
    doc.rect(x, y, cellW, cellH, "S")

    // QR: codifica solo el SKU.
    doc.addImage(
        qrDataUrl,
        "PNG",
        x + CELL_PAD,
        y + CELL_PAD,
        qrSize,
        qrSize
    )

    const textX = x + CELL_PAD
    const maxWidth = cellW - 2 * CELL_PAD

    // Nombre del producto (hasta 2 líneas).
    const nameLines = getNameLines(doc, product.name, maxWidth)
    let textY = y + CELL_PAD + qrSize + 2
    doc.setTextColor(0)
    for (const line of nameLines) {
        doc.text(line, textX, textY)
        textY += NAME_LINE_HEIGHT
    }

    // SKU.
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7)
    doc.setTextColor(120)
    doc.text(product.sku, textX, textY)
    textY += SKU_LINE_HEIGHT

    // Precio de venta.
    doc.setFontSize(8)
    doc.setTextColor(0)
    doc.text(formatCurrency(product.salePrice), textX, textY + 1)
}

// ==========================================
// FUNCIONES PRINCIPALES (GENERACIÓN DE PDF)
// ==========================================

/**
 * Genera un PDF A4 con la etiqueta de un solo producto en la esquina
 * superior izquierda (para imprimir sobre una hoja de stickers).
 */
export async function buildProductLabelPdf(product: Product): Promise<Blob> {
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const qrDataUrl = await toDataURL(product.sku, QR_OPTIONS)
    const cellW = A4_WIDTH - 2 * PAGE_MARGIN
    const cellH = estimateLabelHeight(
        doc,
        product,
        QR_SINGLE_SIZE,
        cellW - 2 * CELL_PAD
    )

    drawLabelCell(
        doc,
        product,
        qrDataUrl,
        PAGE_MARGIN,
        PAGE_MARGIN,
        cellW,
        cellH,
        QR_SINGLE_SIZE
    )

    return doc.output("blob")
}

/**
 * Genera un PDF A4 con la grilla completa de etiquetas (una por
 * producto), paginando en páginas continuas. Los QR se generan en
 * paralelo antes de armar el documento.
 */
export async function buildAllLabelsPdf(products: Product[]): Promise<Blob> {
    const doc = new jsPDF({ unit: "mm", format: "a4" })

    const labels = await Promise.all(
        products.map(async (product) => ({
            product,
            qrDataUrl: await toDataURL(product.sku, QR_OPTIONS),
            height: estimateLabelHeight(
                doc,
                product,
                QR_GRID_SIZE,
                GRID_CELL_WIDTH - 2 * CELL_PAD
            ),
        }))
    )

    const stepX = GRID_CELL_WIDTH + GRID_GAP
    let column = 0
    let y = PAGE_MARGIN

    for (const label of labels) {
        if (y + label.height > A4_HEIGHT - PAGE_MARGIN) {
            // La fila no entra: empezar una página nueva.
            doc.addPage()
            y = PAGE_MARGIN
            column = 0
        }

        drawLabelCell(
            doc,
            label.product,
            label.qrDataUrl,
            PAGE_MARGIN + column * stepX,
            y,
            GRID_CELL_WIDTH,
            label.height,
            QR_GRID_SIZE
        )

        column += 1
        if (column >= GRID_COLS) {
            column = 0
            y += label.height + GRID_GAP
        }
    }

    return doc.output("blob")
}

// ==========================================
// UTILIDADES DE ARCHIVOS Y DESCARGA
// ==========================================

/**
 * Dispara la descarga de un Blob en el navegador (se revoca la URL
 * temporal al terminar).
 */
export function downloadBlob(blob: Blob, name: string): void {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = name
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
}

/**
 * Nombre de archivo para el PDF descargado. Sanitiza el SKU para
 * evitar caracteres inválidos en sistemas de archivos.
 */
export function getLabelPdfFileName(sku: string): string {
    const safeSku = sku.replace(/[^a-zA-Z0-9._-]/g, "_") || "producto"
    return `etiqueta-${safeSku}.pdf`
}