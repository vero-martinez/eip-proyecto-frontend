/**
 * Servicio de generación de boletas de venta en PDF.
 * 
 * Genera y descarga boletas de venta en formato PDF (80mm).
 * Captura el elemento visual `#boleta-print` en el DOM para crear
 * un documento adaptado a impresoras térmicas.
 */

import jsPDF from "jspdf"
import { downloadBlob } from "@/lib/utils"
import type { Venta } from "../types"

// --- Configuración ---

const TICKET_WIDTH_MM = 80
const CAPTURE_SCALE = 2

// --- Utilidades ---

/** Nombre de archivo seguro para el PDF descargado de la boleta. */
export function getVentaBoletaFileName(venta: Venta): string {
  const safeFolio = venta.folio.replace(/[^a-zA-Z0-9._-]/g, "_") || "boleta"
  return `boleta-${safeFolio}.pdf`
}

// --- Servicio ---

/**
 * Captura el ticket (#boleta-print) montado en el DOM y devuelve el PDF (80mm).
 */
export async function buildVentaBoletaPdf(): Promise<Blob> {
  const element = document.getElementById("boleta-print")
  if (!element) {
    throw new Error("No se encontró la boleta para generar el PDF")
  }

  const { default: html2canvas } = await import("html2canvas-pro")
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: CAPTURE_SCALE,
    logging: false,
  })

  const heightMm = (TICKET_WIDTH_MM * canvas.height) / canvas.width
  const doc = new jsPDF({
    unit: "mm",
    format: [TICKET_WIDTH_MM, heightMm],
    orientation: "portrait",
    compress: true,
  })

  doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, TICKET_WIDTH_MM, heightMm)

  return doc.output("blob")
}

/** Descarga la boleta de una venta como PDF. */
export async function downloadVentaBoleta(venta: Venta): Promise<void> {
  const blob = await buildVentaBoletaPdf()
  downloadBlob(blob, getVentaBoletaFileName(venta))
}