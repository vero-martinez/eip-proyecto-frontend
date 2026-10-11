/**
 * Tarjetas de métricas del historial de ventas: ventas de hoy
 * (cantidad y total en soles) y ventas de esta semana (cantidad y
 * total). Compartidas por "Mis ventas" y el listado de admin, que le
 * pasa el subconjunto ya filtrado por responsable.
 */

import { useMemo } from "react"
import {
    CalendarDays,
    ShoppingCart,
    TrendingUp,
    Wallet,
    type LucideIcon,
} from "lucide-react"

import { StatCard, type StatTone } from "@/components/common/stat-card"
import { formatCurrency } from "@/lib/utils"
import type { Venta } from "@/features/ventas/types"

import { summarizeVentas } from "../utils"

interface VentasStatsProps {
    ventas: Venta[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export function VentasStats({ ventas }: VentasStatsProps) {
    const { hoy, semana } = useMemo(() => summarizeVentas(ventas), [ventas])

    const stats: StatConfig[] = [
        {
            label: "Ventas de hoy",
            value: hoy.count,
            sublabel: "cantidad de ventas",
            icon: ShoppingCart,
            tone: "violet",
        },
        {
            label: "Total vendido hoy",
            value: formatCurrency(hoy.total),
            sublabel: "monto acumulado",
            icon: Wallet,
            tone: "rose",
        },
        {
            label: "Ventas esta semana",
            value: semana.count,
            sublabel: "desde el lunes",
            icon: CalendarDays,
            tone: "slate",
        },
        {
            label: "Total vendido esta semana",
            value: formatCurrency(semana.total),
            sublabel: "monto acumulado",
            icon: TrendingUp,
            tone: "amber",
        },
    ]

    return (
        <section
            aria-label="Resumen de ventas"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}