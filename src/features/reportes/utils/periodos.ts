/**
 * Agrupación temporal de "Ventas por periodo": claves ordenables y
 * etiquetas legibles para granularidad diaria, semanal y mensual.
 */

import type { Granularidad } from "../types"

const LOCALE = "es-PE"

const MESES_CORTOS = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
]

function pad(n: number): string {
    return String(n).padStart(2, "0")
}

/** Número de semana aproximado (ISO 8601) de una fecha local. */
function numeroSemana(fecha: Date): number {
    const inicioAnio = new Date(fecha.getFullYear(), 0, 1)
    const dias = Math.floor((fecha.getTime() - inicioAnio.getTime()) / 86400000)
    return Math.ceil((dias + inicioAnio.getDay() + 1) / 7)
}

/**
 * Clave ordenable ("YYYY-MM-DD", "YYYY-Www" o "YYYY-MM") según la
 * granularidad. Ordenar por la clave equivale a ordenar por fecha.
 */
export function clavePeriodo(iso: string, granularidad: Granularidad): string {
    const fecha = new Date(iso)
    const anio = fecha.getFullYear()

    if (granularidad === "mes") return `${anio}-${pad(fecha.getMonth() + 1)}`
    if (granularidad === "semana") return `${anio}-W${pad(numeroSemana(fecha))}`
    return `${anio}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`
}

/** Etiqueta legible de una clave generada con `clavePeriodo`. */
export function etiquetaPeriodo(clave: string, granularidad: Granularidad): string {
    if (granularidad === "mes") {
        const [anio, mes] = clave.split("-")
        return `${MESES_CORTOS[Number(mes) - 1] ?? mes} ${anio}`
    }

    if (granularidad === "semana") {
        const [anio, raw] = clave.split("-W")
        return `Semana ${raw} ${anio}`
    }

    const [anio, mes, dia] = clave.split("-")
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(dia))
    return new Intl.DateTimeFormat(LOCALE, {
        day: "numeric",
        month: "short",
    }).format(fecha)
}