/**
 * Utilidades de fechas para el módulo de Reportes.
 */

const LOCALE = "es-PE"

function pad(n: number): string {
    return String(n).padStart(2, "0")
}

export function hoyISO(): string {
    const ahora = new Date()
    return ahora.getFullYear() + "-" + pad(ahora.getMonth()+1) + "-" + pad(ahora.getDate())
}

export function parseFecha(fecha: string): Date {
    const [anio, mes, dia] = fecha.split("-").map(Number)
    return new Date(anio ?? 1970, (mes ?? 1) - 1, dia ?? 1)
}

export function restarDias(fecha: Date, dias: number): Date {
    const copia = new Date(fecha)
    copia.setDate(copia.getDate() - dias)
    return copia
}

export function inicioDeMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1)
}

export function inicioDeSemana(fecha: Date): Date {
    const copia = new Date(fecha)
    const desplazamiento = (copia.getDay() + 6) % 7
    return restarDias(copia, desplazamiento)
}

export function aISO(fecha: Date): string {
    return fecha.getFullYear() + "-" + pad(fecha.getMonth()+1) + "-" + pad(fecha.getDate())
}

import type { PresetRango, RangoFechas } from "../types"

export function resolverRango(
    preset: PresetRango,
    desde: string,
    hasta: string
): RangoFechas {
    const hoy = new Date()

    switch (preset) {
        case "hoy":
            return { desde: hoyISO(), hasta: hoyISO() }
        case "7-dias":
            return {
                desde: aISO(restarDias(hoy, 6)),
                hasta: hoyISO(),
            }
        case "30-dias":
            return {
                desde: aISO(restarDias(hoy, 29)),
                hasta: hoyISO(),
            }
        case "este-mes":
            return { desde: aISO(inicioDeMes(hoy)), hasta: hoyISO() }
        case "mes-anterior": {
            const primeroEsteMes = inicioDeMes(hoy)
            const finMesAnterior = new Date(
                primeroEsteMes.getFullYear(),
                primeroEsteMes.getMonth(),
                0
            )
            return {
                desde: aISO(inicioDeMes(finMesAnterior)),
                hasta: aISO(finMesAnterior),
            }
        }
        case "personalizado": {
            if (desde && hasta) return { desde, hasta }
            if (desde) return { desde, hasta: hoyISO() }
            if (hasta) return { desde: aISO(restarDias(hoy, 29)), hasta }
            return { desde: aISO(restarDias(hoy, 29)), hasta: hoyISO() }
        }
    }
}

export function limitesRango(rango: RangoFechas): { inicio: number; fin: number } {
    const inicio = parseFecha(rango.desde)
    inicio.setHours(0, 0, 0, 0)

    const fin = parseFecha(rango.hasta)
    fin.setHours(23, 59, 59, 999)

    return { inicio: inicio.getTime(), fin: fin.getTime() }
}

export function enRango(iso: string, rango: RangoFechas | null): boolean {
    if (!rango) return true
    const { inicio, fin } = limitesRango(rango)
    const tiempo = new Date(iso).getTime()
    return tiempo >= inicio && tiempo <= fin
}

export function formatRango(rango: RangoFechas): string {
    const fmt = new Intl.DateTimeFormat(LOCALE, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
    return fmt.format(parseFecha(rango.desde)) + " a " + fmt.format(parseFecha(rango.hasta))
}

