/**
 * Tarjetas de métricas del historial de movimientos de inventario.
 */

import { useMemo } from "react"
import {
    History,
    PackagePlus,
    ShoppingCart,
    PackageMinus,
    type LucideIcon,
} from "lucide-react"
import { StatCard, type StatTone } from "@/components/common/stat-card"

import { summarizeMovimientos } from "../utils"
import type { InventoryMovement } from "../types"

interface MovimientosStatsProps {
    movements: InventoryMovement[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export function MovimientosStats({ movements }: MovimientosStatsProps) {
    const { total, entradas, ventas, mermas } = useMemo(
        () => summarizeMovimientos(movements),
        [movements]
    )

    const stats: StatConfig[] = [
        {
            label: "Movimientos registrados",
            value: total,
            sublabel: "en el historial",
            icon: History,
            tone: "slate",
        },
        {
            label: "Entradas",
            value: entradas,
            sublabel: "ingresos al stock",
            icon: PackagePlus,
            tone: "amber",
        },
        {
            label: "Ventas",
            value: ventas,
            sublabel: "líneas vendidas",
            icon: ShoppingCart,
            tone: "violet",
        },
        {
            label: "Mermas",
            value: mermas,
            sublabel: "descartes registrados",
            icon: PackageMinus,
            tone: "rose",
        },
    ]

    return (
        <section
            aria-label="Resumen del historial de movimientos"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}