/**
 * Tarjetas de métricas del módulo de Alertas del taller.
 */

import { useMemo } from "react"
import {
    Bell,
    EyeOff,
    PackageMinus,
    PackageX,
    type LucideIcon,
} from "lucide-react"

import { StatCard, type StatTone } from "@/components/common/stat-card"
import { formatProductCount } from "@/features/products/utils"
import type { Product } from "@/types/products"

import { summarizeAlertas } from "../utils"

interface AlertasStatsProps {
    products: Product[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export function AlertasStats({ products }: AlertasStatsProps) {
    const { alertas, inactivos, agotados, stockBajo, total } = useMemo(
        () => summarizeAlertas(products),
        [products]
    )

    const stats: StatConfig[] = [
        {
            label: "Alertas activas",
            value: alertas,
            sublabel: "requieren acción",
            icon: Bell,
            tone: "rose",
        },
        {
            label: "Productos inactivos",
            value: inactivos,
            sublabel: "no se comercializan",
            icon: EyeOff,
            tone: "slate",
        },
        {
            label: "Agotados",
            value: agotados,
            sublabel: "sin unidades disponibles",
            icon: PackageX,
            tone: "rose",
        },
        {
            label: "Productos con bajo stock",
            value: stockBajo,
            sublabel: `de ${formatProductCount(total)}`,
            icon: PackageMinus,
            tone: "violet",
        },
    ]

    return (
        <section
            aria-label="Resumen de alertas del taller"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}