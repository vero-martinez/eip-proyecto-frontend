/**
 * Servicio de exportación de reportes en PDF, CSV y XLSX.
 *
 * Los tres formatos se generan desde la misma estructura normalizada
 * (columnas + filas + totales) que define `construirReporte`, así que
 * PDF, CSV y XLSX muestrean exactamente los mismos números.
 *
 * El PDF se dibuja con jsPDF de forma nativa en lugar de capturar la tabla
 * con html2canvas: una tabla de cientos de filas necesita paginar, y una
 * imagen capturada no puede partirse en varias p ni conservar texto
 * seleccionable.
 */

import type { Row } from "exceljs"
import jsPDF from "jspdf"

import { EMPRESA } from "@/features/ventas/constants"
import { downloadBlob } from "@/lib/utils"

import type {
    ColumnaReporte,
    FormatoReporte,
    RangoFechas,
    ReporteResuelto,
    ValorCelda,
} from "../types"
import { formatCelda, formatRango, sufijoUnidad } from "../utils"

type ExcelJsModule = typeof import("exceljs")

// ==========================================
// PDF → A4 apaisado, todas las medidas en mm
// ==========================================

const PAGE_WIDTH = 297
const PAGE_HEIGHT = 210
const MARGIN = 12
const FOOTER_HEIGHT = 10
const HEADER_HEIGHT = 26
const ROW_HEIGHT = 6
const HEAD_ROW_HEIGHT = 7
const MIN_COLUMN_WIDTH = 13
const LINE_HEIGHT = 3
const CELDA_PADDING_X = 1

const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2
const BODY_TOP = MARGIN + HEADER_HEIGHT
const BODY_BOTTOM = PAGE_HEIGHT - MARGIN - FOOTER_HEIGHT

/** Colores del PDF: tomados del tema claro de `globals.css`
 *  (`--primary`, `--foreground`, `--muted-foreground`, `--border`, `--accent`).
 *  Se fijan en el código a propósito, no se leen del CSS en runtime: el papel
 *  siempre es blanco, así que en modo oscuro los tokens dan texto
 *  claro sobre blanco, ilegible. */
const COLOR_PRIMARY: [number, number, number] = [116, 99, 184] // --primary #7463b8
const COLOR_TEXT: [number, number, number] = [26, 22, 37] // --foreground #1A1625
const COLOR_MUTED: [number, number, number] = [107, 101, 128] // --muted-foreground #6B6580
const COLOR_BORDER: [number, number, number] = [228, 224, 242] // --border #E4E0F2
const COLOR_TOTAL_FILL: [number, number, number] = [237, 233, 251] // --accent #EDE9FB

/** Texto de una celda tal como se escribe en CSV: los números van crudos
 *  para que Excel los reconozca como números y no como texto. */
function textoCsv(columna: { formato: string }, valor: ValorCelda | undefined): string {
    if (valor === null || valor === undefined) return ""
    if (columna.formato === "porcentaje") return `${valor}%`
    return String(valor)
}

/**
 * Reparte el ancho disponible entre columnas seg su peso, respetando un
 * mínimo legible. El excedente que consumen los márgenes se vuelve a repartir
 * entre el resto, para no desbordar la hoja.
 */
function calcularAnchosPesos(pesos: number[], anchoTotal: number): number[] {
    const sumaPesos = pesos.reduce((suma, peso) => suma + peso, 0)
    if (sumaPesos <= 0) return pesos.map(() => anchoTotal / pesos.length)

    let anchos = pesos.map((peso) => (anchoTotal * peso) / sumaPesos)
    let sobrante = 0

    anchos = anchos.map((ancho) => {
        if (ancho >= MIN_COLUMN_WIDTH) return ancho
        sobrante += MIN_COLUMN_WIDTH - ancho
        return MIN_COLUMN_WIDTH
    })

    if (sobrante <= 0) return anchos

    const flexibles = anchos
        .map((ancho, indice) => ({ indice, ancho }))
        .filter((item) => pesos[item.indice]! > 0)

    const pesoFlexible = flexibles.reduce((suma, item) => suma + pesos[item.indice]!, 0)
    if (pesoFlexible <= 0) return anchos

    return anchos.map((ancho, indice) => {
        const peso = pesos[indice]!
        if (peso <= 0) return ancho
        return Math.max(
            MIN_COLUMN_WIDTH,
            ancho - (sobrante * peso) / pesoFlexible
        )
    })
}

/** Envuelve el texto en varias líneas para que quepa en el ancho dado.
 *  A diferencia de recortar con "slice", splitTextToSize nunca pierde contenido:
 *  las líneas crecen y la fila suma la altura que necesite. */
function envolverTexto(doc: jsPDF, texto: string, ancho: number): string[] {
    if (!texto) return []
    return doc.splitTextToSize(texto, Math.max(1, ancho - CELDA_PADDING_X * 2))
}

interface CeldaPDF {
    columna: ColumnaReporte
    ancho: number
    lineas: string[]
}

/** Parte cada columna en l, enganchando columna → texto y ancho. */
function celdasPDF(
    doc: jsPDF,
    columnas: ColumnaReporte[],
    textos: string[],
    anchos: number[]
): CeldaPDF[] {
    return columnas.map((columna, indice) => ({
        columna,
        ancho: anchos[indice]!,
        lineas: envolverTexto(doc, textos[indice] ?? "", anchos[indice]!),
    }))
}

/** Alto de la fila: el de todas las columnas menos el m legible. */
function altoCeldas(celdas: CeldaPDF[], minimo: number): number {
    const lineas = Math.max(1, ...celdas.map((celda) => celda.lineas.length))
    return Math.max(minimo, lineas * LINE_HEIGHT)
}

interface OpcionesFila {
    negrita?: boolean
    relleno?: [number, number, number]
    bordeSuperior?: boolean
}

function dibujarCeldas(
    doc: jsPDF,
    celdas: CeldaPDF[],
    x: number,
    y: number,
    alto: number,
    opciones: OpcionesFila = {}
): void {
    const anchoTotal = celdas.reduce((suma, celda) => suma + celda.ancho, 0)

    if (opciones.relleno) {
        doc.setFillColor(...opciones.relleno)
        doc.rect(x, y, anchoTotal, alto, "F")
    }

    doc.setFont("helvetica", opciones.negrita ? "bold" : "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_TEXT)

    let cursor = x
    celdas.forEach((celda) => {
        const textoX = cursor + CELDA_PADDING_X
        const conteo = celda.lineas.length || 1
        const bloqueY = y + (alto - conteo * LINE_HEIGHT) / 2

        celda.lineas.forEach((linea, indice) => {
            doc.text(linea, textoX, bloqueY + (indice + 0.5) * LINE_HEIGHT + 0.9, {
                align: "left",
                baseline: "middle",
            })
        })

        cursor += celda.ancho
    })

    if (opciones.bordeSuperior) {
        doc.setDrawColor(...COLOR_PRIMARY)
        doc.setLineWidth(0.3)
        doc.line(x, y, x + anchoTotal, y)
    }
}

/** Alto que ocuparía la fila según el texto envuelto de cada columna. */
function altoFila(
    doc: jsPDF,
    reporte: ReporteResuelto,
    fila: Record<string, ValorCelda> | undefined,
    anchos: number[],
    minimo: number
): number {
    const { columnas } = reporte.tabla
    const textos = columnas.map((columna) => formatCelda(columna, fila?.[columna.clave]))
    return altoCeldas(celdasPDF(doc, columnas, textos, anchos), minimo)
}

/** Dibuja una fila de datos y devuelve el alto que ocupó. */
function dibujarFila(
    doc: jsPDF,
    reporte: ReporteResuelto,
    fila: Record<string, ValorCelda> | undefined,
    anchos: number[],
    x: number,
    y: number,
    alto: number,
    opciones: OpcionesFila = {}
): number {
    const { columnas } = reporte.tabla
    const textos = columnas.map((columna) => formatCelda(columna, fila?.[columna.clave]))
    const celdas = celdasPDF(doc, columnas, textos, anchos)
    const altoFinal = altoCeldas(celdas, alto)

    dibujarCeldas(doc, celdas, x, y, altoFinal, opciones)
    return altoFinal
}

/** Dibuja el encabezado de la tabla y devuelve el alto que ocupó. */
function dibujarEncabezadoTabla(
    doc: jsPDF,
    reporte: ReporteResuelto,
    anchos: number[],
    x: number,
    y: number
): number {
    const { columnas } = reporte.tabla
    const textos = columnas.map(
        (columna) => `${columna.etiqueta}${sufijoUnidad(columna.formato)}`
    )
    const celdas = celdasPDF(doc, columnas, textos, anchos)
    const alto = altoCeldas(celdas, HEAD_ROW_HEIGHT)

    doc.setFillColor(...COLOR_PRIMARY)
    doc.rect(x, y, anchos.reduce((suma, ancho) => suma + ancho, 0), alto, "F")

    doc.setFont("helvetica", "bold")
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)

    let cursor = x
    celdas.forEach((celda) => {
        const textoX = cursor + CELDA_PADDING_X
        const conteo = celda.lineas.length || 1
        const bloqueY = y + (alto - conteo * LINE_HEIGHT) / 2

        celda.lineas.forEach((linea, indice) => {
            doc.text(linea, textoX, bloqueY + (indice + 0.5) * LINE_HEIGHT + 0.9, {
                align: "left",
                baseline: "middle",
            })
        })

        cursor += celda.ancho
    })

    return alto
}

/** Bloque de cabecera de la primera página: empresa a la izquierda, reporte a la derecha. */
function dibujarPortada(
    doc: jsPDF,
    reporte: ReporteResuelto,
    rango: RangoFechas | null
): void {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text(EMPRESA.razonSocial, MARGIN, MARGIN + 4)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(`${EMPRESA.tagline} · RUC ${EMPRESA.ruc}`, MARGIN, MARGIN + 9)

    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(...COLOR_TEXT)
    doc.text(reporte.titulo, PAGE_WIDTH - MARGIN, MARGIN + 4, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(reporte.descripcion, PAGE_WIDTH - MARGIN, MARGIN + 9, { align: "right" })

    const alcance = reporte.snapshot
        ? "Snapshot actual del inventario"
        : rango
          ? `Periodo: ${formatRango(rango)}`
          : ""

    if (alcance) {
        doc.text(alcance, PAGE_WIDTH - MARGIN, MARGIN + 14, { align: "right" })
    }

    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, MARGIN + HEADER_HEIGHT - 4, PAGE_WIDTH - MARGIN, MARGIN + HEADER_HEIGHT - 4)
}

/** Encabezado breve que se repite en las páginas siguientes. */
function dibujarEncabezadoContinuacion(
    doc: jsPDF,
    reporte: ReporteResuelto
): void {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_TEXT)
    doc.text(reporte.titulo, MARGIN, MARGIN + 3)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(EMPRESA.razonSocial, PAGE_WIDTH - MARGIN, MARGIN + 3, { align: "right" })

    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, MARGIN + 5, PAGE_WIDTH - MARGIN, MARGIN + 5)
}

function dibujarPie(doc: jsPDF, totalPaginas: number): void {
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)

    doc.text(
        `Generado el ${new Intl.DateTimeFormat("es-PE", {
            dateStyle: "short",
            timeStyle: "short",
        }).format(new Date())}`,
        MARGIN,
        PAGE_HEIGHT - MARGIN + 2
    )

    doc.text(
        `Página ${doc.getCurrentPageInfo().pageNumber} de ${totalPaginas}`,
        PAGE_WIDTH - MARGIN,
        PAGE_HEIGHT - MARGIN + 2,
        { align: "right" }
    )
}

/** Construye el PDF del reporte y lo devuelve como blob. */
function construirReportePdf(
    reporte: ReporteResuelto,
    rango: RangoFechas | null
): Blob {
    const doc = new jsPDF({
        unit: "mm",
        format: "a4",
        orientation: "landscape",
        compress: true,
    })

    const { columnas, filas, totales } = reporte.tabla
    const pesos = columnas.map(
        (columna) => columna.peso ?? (columna.formato === "texto" ? 2 : 1)
    )
    const anchos = calcularAnchosPesos(pesos, CONTENT_WIDTH)

    dibujarPortada(doc, reporte, rango)
    let y = BODY_TOP + dibujarEncabezadoTabla(doc, reporte, anchos, MARGIN, BODY_TOP)

    if (filas.length === 0) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(8)
        doc.setTextColor(...COLOR_MUTED)
        doc.text(
            "No hay datos para los filtros seleccionados.",
            MARGIN + CONTENT_WIDTH / 2,
            y + 10,
            { align: "center" }
        )
        y += 20
    }

    for (const fila of filas) {
        const altoCelda = altoFila(doc, reporte, fila, anchos, ROW_HEIGHT)

        if (y + altoCelda > BODY_BOTTOM) {
            doc.addPage()
            dibujarEncabezadoContinuacion(doc, reporte)
            y = BODY_TOP + dibujarEncabezadoTabla(doc, reporte, anchos, MARGIN, BODY_TOP)
        }

        dibujarFila(doc, reporte, fila, anchos, MARGIN, y, ROW_HEIGHT)
        y += altoCelda
    }

    if (totales) {
        const altoTotales = altoFila(doc, reporte, totales, anchos, ROW_HEIGHT)

        if (y + altoTotales > BODY_BOTTOM) {
            doc.addPage()
            dibujarEncabezadoContinuacion(doc, reporte)
            y = BODY_TOP + dibujarEncabezadoTabla(doc, reporte, anchos, MARGIN, BODY_TOP)
        }

        dibujarFila(doc, reporte, totales, anchos, MARGIN, y, ROW_HEIGHT, {
            negrita: true,
            relleno: COLOR_TOTAL_FILL,
            bordeSuperior: true,
        })

        y += altoTotales
    }

    const totalPaginas = doc.getNumberOfPages()
    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        doc.setPage(pagina)
        dibujarPie(doc, totalPaginas)
    }

    return doc.output("blob")
}

/** Construye el CSV del reporte y lo devuelve como blob. */
function construirReporteCsv(reporte: ReporteResuelto): Blob {
    const { columnas, filas, totales } = reporte.tabla

    const escapar = (valor: string) =>
        /[";\n]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor

    const linea = (celdas: string[]) => celdas.map(escapar).join(";")

    const lineas = [
        linea(columnas.map((columna) => `${columna.etiqueta}${sufijoUnidad(columna.formato)}`)),
    ]

    for (const fila of filas) {
        lineas.push(
            linea(columnas.map((columna) => textoCsv(columna, fila[columna.clave])))
        )
    }

    if (totales) {
        lineas.push(
            linea(columnas.map((columna) => textoCsv(columna, totales[columna.clave])))
        )
    }

    // El BOM evita que Excel rompa las tildes y la "?" al abrir el archivo.
return new Blob(["\ufeff" + lineas.join("\r\n")], {
        type: "text/csv;charset=utf-8",
    })
}

/** El build de navegador de exceljs es UMD: webpack lo deja en `default`. */
async function cargarExcelJs(): Promise<ExcelJsModule> {
    const modulo = await import("exceljs")
    return (modulo as ExcelJsModule & { default?: ExcelJsModule }).default ?? modulo
}

/** Formato numérico de Excel según la columna, para que las celdas sumen.
 *
 *  Ojo con las comillas: en Excel lo encerrado entre comillas es literal, as
 *  que el marcador numérico tiene que quedar FUERA. `"S/ #,##0.00"` deja el
 *  formato entero dentro de las comillas, se queda sin marcador y Excel
 *  termina pintando el propio c del formato en la celda. Por eso el
 *  literal cierra antes: `"S/ " #,##0.00`.
 *
 *  La segunda secci tras el `;` aplica solo a los negativos, en rojo.
 */
function formatoExcel(columna: { formato: string }): string | undefined {
    switch (columna.formato) {
        case "moneda":
            return '"S/ " #,##0.00;[Red]-"S/ " #,##0.00'
        case "usd":
            return '"$ " #,##0.00;[Red]-"$ " #,##0.00'
        case "numero":
            // Solo como valor por defecto de columna. Los enteros se ajustan
            // celda por celda en aplicarNumFmtEnteros.
            return "#,##0.##"
        case "porcentaje":
            return '0"%"'
        default:
            return undefined
    }
}

/**
 * Ajusta a `#,##0` las celdas de columnas numéricas cuyo valor es entero.
 *
 * Excel muestra el separador decimal siempre que la cadena de formato lo
 * contiene, aunque no se rellene ningún `#`: por eso `#,##0.##` pinta `3.`
 * en vez de `3`. No se puede usar `#,##0` como formato general porque hay
 * productos vendidos por KILOGRAMO, con stock y cantidades fraccionarios
 * (0.35 kg) que se redondearían a 0.
 *
 * Decidir por celda resuelve las dos cosas: los enteros salen limpios y los
 * decimales conservan su precisión.
 */
function aplicarNumFmtEnteros(fila: Row, columnas: ColumnaReporte[]): void {
    columnas.forEach((columna, indice) => {
        if (columna.formato !== "numero") return

        const valor = fila.getCell(indice + 1).value
        if (typeof valor !== "number" || !Number.isFinite(valor)) return

        if (Number.isInteger(valor)) {
            fila.getCell(indice + 1).numFmt = "#,##0"
        }
    })
}

/** Excel proh estos caracteres en el nombre de la hoja y admite 31. */
function nombreHoja(titulo: string): string {
    return titulo.replace(/[:\\/?*[\]]/g, "").slice(0, 31) || "Reporte"
}

/** Construye el XLSX del reporte y lo devuelve como blob. */
async function construirReporteXlsx(
    reporte: ReporteResuelto
): Promise<Blob> {
    const { Workbook } = await cargarExcelJs()
    const workbook = new Workbook()

    workbook.creator = EMPRESA.razonSocial
    workbook.created = new Date()

    const { columnas, filas, totales } = reporte.tabla

    const hoja = workbook.addWorksheet(nombreHoja(reporte.titulo), {
        views: [{ state: "frozen", ySplit: 1 }],
    })

    hoja.columns = columnas.map((columna) => {
        const formato = formatoExcel(columna)
        return {
            header: `${columna.etiqueta}${sufijoUnidad(columna.formato)}`,
            key: columna.clave,
            // El ancho en caracteres sigue el mismo peso que el PDF.
            width: Math.round(
                10 + (columna.peso ?? (columna.formato === "texto" ? 2 : 1)) * 6
            ),
            style: formato ? { numFmt: formato } : undefined,
            alignment: {
                horizontal: "left" as const,
                vertical: "middle" as const,
            },
            border: {
                bottom: { style: "thin" as const, color: { argb: "FFE4E0F2" } },
            },
        }
    })

    const encabezado = hoja.getRow(1)
    encabezado.font = { bold: true, color: { argb: "FFFFFFFF" } }
    encabezado.height = 20
    encabezado.eachCell((celda) => {
        celda.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: `FF${hexColor(COLOR_PRIMARY)}` },
        }
        celda.alignment = { vertical: "middle", horizontal: "center", wrapText: true }
    })

    for (const fila of filas) {
        const filaExcel = hoja.addRow(
            columnas.map((columna) => fila[columna.clave] ?? null)
        )
        aplicarNumFmtEnteros(filaExcel, columnas)
    }

    if (totales) {
        const filaTotales = hoja.addRow(
            columnas.map((columna) => totales[columna.clave] ?? null)
        )
        // El total puede caer entero aunque las filas sean fraccionarias
        // (1.5 + 1.5 = 3), así que tambén se ajusta celda por celda.
        aplicarNumFmtEnteros(filaTotales, columnas)
        filaTotales.font = { bold: true }
        filaTotales.eachCell((celda) => {
            celda.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: `FF${hexColor(COLOR_TOTAL_FILL)}` },
            }
            celda.border = {
                top: { style: "thin", color: { argb: `FF${hexColor(COLOR_PRIMARY)}` } },
            }
        })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    return new Blob([buffer as BlobPart], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
}

/** Canal RGB → hex sin "#", para los colores ARGB de exceljs. */
function hexColor([r, g, b]: [number, number, number]): string {
    return [r, g, b]
        .map((valor) => valor.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
}

/** Nombre de archivo: los snapshots no llevan rango porque no lo usan. */
function getReporteFileName(
    reporte: ReporteResuelto,
    rango: RangoFechas | null,
    formato: FormatoReporte
): string {
    const base = reporte.titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

    const alcance = reporte.snapshot || !rango ? "" : `_${rango.desde}_${rango.hasta}`
    return `${base}${alcance}.${formato}`
}

/** Genera el reporte en el formato pedido y lo descarga. */
export async function descargarReporte(
    reporte: ReporteResuelto,
    rango: RangoFechas | null,
    formato: FormatoReporte
): Promise<string> {
    const nombre = getReporteFileName(reporte, rango, formato)

    switch (formato) {
        case "pdf":
            downloadBlob(construirReportePdf(reporte, rango), nombre)
            break
        case "csv":
            downloadBlob(construirReporteCsv(reporte), nombre)
            break
        case "xlsx":
            downloadBlob(await construirReporteXlsx(reporte), nombre)
            break
    }

    return nombre
}
