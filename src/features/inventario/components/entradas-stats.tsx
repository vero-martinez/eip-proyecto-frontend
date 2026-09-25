/**
 * Tarjetas de métricas y resumen del módulo de Entradas.
 */

import { useMemo } from "react"
import {
    Package,
    ArrowDownToLine,
    AlertTriangle,
    Clock,
    type LucideIcon,
} from "lucide-react"
import { StatCard, type StatTone } from "@/components/common/stat-card"
import type { Product } from "@/types/products"

import type { StockEntry } from "../types"
import {
    formatEntryQuantity,
    formatLastEntryDate,
    summarizeEntradas,
} from "../utils"

interface EntradasStatsProps {
    products: Product[]
    entries: StockEntry[]
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

export function EntradasStats({ products, entries }: EntradasStatsProps) {
    // Memoizamos el cálculo de las métricas para optimizar rendimiento
    const { totalInventory, entriesLast30, unitsLast30, lowStock, lastEntry } =
        useMemo(() => summarizeEntradas(entries, products), [entries, products])

    const stats: StatConfig[] = [
        {
            label: "Productos en inventario",
            value: totalInventory,
            sublabel: "con stock disponible",
            icon: Package,
            tone: "violet",
        },
        {
            label: "Entradas últimos 30 días",
            value: entriesLast30,
            sublabel: `+${unitsLast30} unidades sumadas`,
            icon: ArrowDownToLine,
            tone: "amber",
        },
        {
            label: "Productos en stock bajo",
            value: lowStock,
            sublabel: "requieren reposición",
            icon: AlertTriangle,
            tone: "rose",
        },
        {
            label: "Última entrada",
            value: lastEntry?.product.name ?? "—",
            title: lastEntry?.product.name, // Tooltip nativo si el texto se trunca
            sublabel: lastEntry
                ? `${formatEntryQuantity(
                    lastEntry.quantity,
                    lastEntry.product.unitType
                )} · ${formatLastEntryDate(lastEntry.createdAt)}`
                : undefined,
            icon: Clock,
            tone: "slate",
            valueClassName: "truncate",
        },
    ]

    return (
        <section
            aria-label="Resumen de entradas de stock"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}