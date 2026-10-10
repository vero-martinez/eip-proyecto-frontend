/**
 * Utilidades de formato para el módulo de Reportes.
 */

const LOCALE = "es-PE"

import { formatCurrency } from "@/lib/utils"
import type { ColumnaReporte, FormatoColumna, ValorCelda } from "../types"
import { PESO_COLUMNA_NUMERICA, PESO_COLUMNA_TEXTO } from "../constants"

export function formatPorcentaje(valor: number | null, decimales = 1): string {
    if (valor === null || !Number.isFinite(valor)) return "-"
    return valor.toFixed(decimales) + "%"
}

export function formatNumero(valor: number, decimales = 2): string {
    return new Intl.NumberFormat(LOCALE, { maximumFractionDigits: decimales }).format(valor)
}

export function formatUSD(valor: number): string {
    return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency: "USD",
    }).format(valor)
}

export function porcentaje(parte: number, total: number): number | null {
    if (!total) return null
    return (parte / total) * 100
}

export function formatCelda(
    columna: { formato: FormatoColumna },
    valor: ValorCelda | undefined
): string {
    if (valor === null || valor === undefined) return ""

    switch (columna.formato) {
        case "moneda":
            return formatCurrency(valor as number)
        case "usd":
            return formatUSD(valor as number)
        case "numero":
            return formatNumero(valor as number)
case "porcentaje":
            return valor + "%"
        default:
            return String(valor)
    }
}

export function sufijoUnidad(formato: FormatoColumna): string {
    if (formato === "moneda") return " (S/)"
    if (formato === "usd") return " (USD)"
    return ""
}

export function col(
    clave: string,
    etiqueta: string,
    formato: ColumnaReporte["formato"],
    peso?: number
): ColumnaReporte {
    return {
        clave,
        etiqueta,
        formato,
        peso: peso ?? (formato === "texto" ? PESO_COLUMNA_TEXTO : PESO_COLUMNA_NUMERICA),
    }
}

