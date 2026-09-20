/**
 * Tarjetas de métricas y resumen del módulo de Mermas.
 */

import { useMemo } from "react"
import {
    Trash2,
    TrendingDown,
    Wrench,
    Clock,
    type LucideIcon,
} from "lucide-react"
import { StatCard, type StatTone } from "@/components/common/stat-card"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types/products"

import type { Merma } from "../types"
import { summarizeMermas } from "../utils"

interface MermasStatsProps {
    products: Product[]
    mermas: Merma[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
    valueClassName?: string
    title?: string
}

export function MermasStats({ products, mermas }: MermasStatsProps) {
    // Memoizamos el cálculo de las métricas para optimizar rendimiento
    const { piecesLast30, estimatedLossMonth, ajustesMonth, lastMerma } =
        useMemo(() => summarizeMermas(mermas, products), [mermas, products])

    const stats: StatConfig[] = [
        {
            label: "Piezas descartadas",
            value: `${piecesLast30} ${lastMerma?.product.unitType === "KILOGRAMO" ? "kg" : "u"}`,
            sublabel: "en los últimos 30 días",
            icon: Trash2,
            tone: "amber",
        },
        {
            label: "Pérdida estimada del mes",
            value: formatCurrency(estimatedLossMonth),
            sublabel: "costo de la mercadería",
            icon: TrendingDown,
            tone: "rose",
        },
        {
            label: "Ajustes del mes",
            value: ajustesMonth,
            sublabel: "mermas registradas este mes",
            icon: Wrench,
            tone: "violet",
        },
        {
            label: "Último ajuste",
            value: lastMerma?.product.name ?? "—",
            title: lastMerma?.product.name, // Tooltip nativo si el texto se trunca
            sublabel: lastMerma?.responsable,
            icon: Clock,
            tone: "slate",
            valueClassName: "truncate",
        },
    ]

    return (
        <section
            aria-label="Resumen de mermas"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}