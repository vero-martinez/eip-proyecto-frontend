/**
 * Fila de indicadores del reporte activo.
 *
 * Reutiliza el `StatCard` compartido para que los KPIs de Reportes se vean
 * igual que los del Dashboard y el resto de la app: `StatReporte` es un
 * subconjunto de sus props, así que se despliega tal cual.
 */

import { StatCard } from "@/components/common/stat-card"

import type { StatReporte } from "../types"

interface ReportesStatsProps {
    stats: StatReporte[]
}

export function ReportesStats({ stats }: ReportesStatsProps) {
    if (stats.length === 0) return null

    return (
        <section
            aria-label="Indicadores del reporte"
            className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
        >
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </section>
    )
}
