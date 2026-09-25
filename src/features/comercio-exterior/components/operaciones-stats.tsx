/**
 * Tarjetas de métricas del módulo de Comercio Exterior.
 */

import { useMemo } from "react"
import { CircleDollarSign, History, Plane, Ship, type LucideIcon } from "lucide-react"
import { StatCard, type StatTone } from "@/components/common/stat-card"

import { formatUSD, resumirOperaciones } from "../utils"
import type { OperacionComercioExterior } from "../types"

interface OperacionesStatsProps {
    operaciones: OperacionComercioExterior[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export function OperacionesStats({ operaciones }: OperacionesStatsProps) {
    const resumen = useMemo(
        () => resumirOperaciones(operaciones),
        [operaciones]
    )

    const stats: StatConfig[] = [
        {
            label: "Operaciones registradas",
            value: resumen.total,
            sublabel: "importaciones y exportaciones",
            icon: History,
            tone: "slate",
        },
        {
            label: "Importaciones",
            value: resumen.importaciones,
            sublabel: `${formatUSD(resumen.invertidoUSD)} invertidos`,
            icon: Ship,
            tone: "amber",
        },
        {
            label: "Exportaciones",
            value: resumen.exportaciones,
            sublabel: `${formatUSD(resumen.exportadoUSD)} negociados`,
            icon: Plane,
            tone: "violet",
        },
        {
            label: "Total negociado",
            value: formatUSD(resumen.totalUSD),
            sublabel: "en operaciones de import y export",
            icon: CircleDollarSign,
            tone: "rose",
        },
    ]

    return (
        <section
            aria-label="Resumen de comercio exterior"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}