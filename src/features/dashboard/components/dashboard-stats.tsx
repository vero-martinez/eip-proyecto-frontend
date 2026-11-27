import { Package, Receipt, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react"

import { StatCard, type StatTone } from "@/components/common/stat-card"
import { formatCurrency } from "@/lib/utils"

import type { ResumenVentas, SerieSemanal } from "../types"
import {
    formatPiezas,
    formatPorcentaje,
    getMargenPorcentaje,
    getPiezasPorVenta,
    getVariacionCampo,
} from "../utils"

interface DashboardStatsProps {
    resumen: ResumenVentas
    serie: SerieSemanal[]
}

interface StatConfig {
    label: string
    value: string
    sublabel: string
    sublabelClassName?: string
    icon: LucideIcon
    tone: StatTone
}

function formatearComparacion(variacion: number | null): {
    texto: string
    clase: string
} {
    if (variacion === null) {
        return {
            texto: "Sin comparación disponible",
            clase: "text-muted-foreground",
        }
    }

    const sube = variacion >= 0
    return {
        texto: `${sube ? "▲" : "▼"} ${formatPorcentaje(Math.abs(variacion))} vs. semana anterior`,
        clase: sube ? "text-success" : "text-destructive",
    }
}

export function DashboardStats({ resumen, serie }: DashboardStatsProps) {
    const margenPorcentaje = getMargenPorcentaje(resumen.margenBruto, resumen.totalVentas)
    const piezasPorVenta = getPiezasPorVenta(resumen.piezasVendidas, resumen.cantidadVentas)

    const comparacionVentas = formatearComparacion(getVariacionCampo(serie, "totalVentas"))
    const comparacionMargen = formatearComparacion(getVariacionCampo(serie, "margenBruto"))
    const comparacionPiezas = formatearComparacion(getVariacionCampo(serie, "piezasVendidas"))

    const stats: StatConfig[] = [
        {
            label: "Ventas del periodo",
            value: formatCurrency(resumen.totalVentas),
            sublabel: comparacionVentas.texto,
            sublabelClassName: comparacionVentas.clase,
            icon: ShoppingCart,
            tone: "violet",
        },
        {
            label: "Margen bruto",
            value: formatCurrency(resumen.margenBruto),
            sublabel: `${formatPorcentaje(margenPorcentaje)} de las ventas · ${comparacionMargen.texto}`,
            sublabelClassName: comparacionMargen.clase,
            icon: TrendingUp,
            tone: "amber",
        },
        {
            label: "Piezas vendidas",
            value: formatPiezas(resumen.piezasVendidas),
            sublabel: comparacionPiezas.texto,
            sublabelClassName: comparacionPiezas.clase,
            icon: Package,
            tone: "slate",
        },
        {
            label: "Ticket promedio",
            value: formatCurrency(resumen.promedioPorVenta),
            sublabel: piezasPorVenta === null
                ? "Sin comparación disponible"
                : `${formatPiezas(piezasPorVenta)} por venta · sin comparación disponible`,
            sublabelClassName: "text-muted-foreground",
            icon: Receipt,
            tone: "rose",
        },
    ]

    return (
        <section
            aria-label="Indicadores del periodo"
            className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard
                    key={stat.label}
                    {...stat}
                    valueClassName="text-3xl"
                />
            ))}
        </section>
    )
}
