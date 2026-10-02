/**
 * Tarjetas de indicadores del Dashboard.
 *
 * Todos los valores provienen del endpoint; el sublabel de cada tarjeta es un
 * indicador derivado (margen porcentual, piezas por venta) o un dato del mismo
 * resumen, nunca un número fijo.
 */

import { Package, Receipt, ShoppingCart, TrendingUp, type LucideIcon } from "lucide-react"

import { StatCard, type StatTone } from "@/components/common/stat-card"
import { formatCurrency } from "@/lib/utils"

import type { ResumenVentas } from "../types"
import {
    formatPiezas,
    formatPorcentaje,
    getMargenPorcentaje,
    getPiezasPorVenta,
} from "../utils"

interface DashboardStatsProps {
    resumen: ResumenVentas
}

interface StatConfig {
    label: string
    value: string
    sublabel: string
    icon: LucideIcon
    tone: StatTone
}

export function DashboardStats({ resumen }: DashboardStatsProps) {
    const margenPorcentaje = getMargenPorcentaje(resumen.margenBruto, resumen.totalVentas)
    const piezasPorVenta = getPiezasPorVenta(resumen.piezasVendidas, resumen.cantidadVentas)

    const stats: StatConfig[] = [
        {
            label: "Ventas del periodo",
            value: formatCurrency(resumen.totalVentas),
            sublabel: `${resumen.cantidadVentas} ${resumen.cantidadVentas === 1 ? "operación" : "operaciones"} registrada${resumen.cantidadVentas === 1 ? "" : "s"}`,
            icon: ShoppingCart,
            tone: "violet",
        },
        {
            label: "Margen bruto",
            value: formatCurrency(resumen.margenBruto),
            sublabel: `${formatPorcentaje(margenPorcentaje)} de las ventas`,
            icon: TrendingUp,
            tone: "amber",
        },
        {
            label: "Piezas vendidas",
            value: formatPiezas(resumen.piezasVendidas),
            sublabel:
                piezasPorVenta === null
                    ? "sin ventas en el periodo"
                    : `${formatPiezas(piezasPorVenta)} por venta`,
            icon: Package,
            tone: "slate",
        },
        {
            label: "Ticket promedio",
            value: formatCurrency(resumen.promedioPorVenta),
            sublabel: "por operación de venta",
            icon: Receipt,
            tone: "rose",
        },
    ]

    return (
        <section
            aria-label="Indicadores del periodo"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}