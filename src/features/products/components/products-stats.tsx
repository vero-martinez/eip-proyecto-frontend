/**
 * Cards de resumen del módulo Productos: total, stock bajo,
 * inactivos y valor de inventario. La configuración define el
 * icono, texto y tema de cada card; el cálculo de las métricas
 * se delega en summarizeProducts().
 */

import { Package, AlertTriangle, PackageX, Wallet, type LucideIcon } from "lucide-react"
import { StatCard, type StatTone } from "@/components/common/stat-card"
import { summarizeProducts } from "../utils"
import { formatCurrency } from "@/lib/utils"
import type { Product } from "@/types/products"

interface ProductsStatsProps {
    products: Product[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export function ProductsStats({ products }: ProductsStatsProps) {
    const { total, active, lowStock, inactive, inventoryValue } = summarizeProducts(products)

    const stats: StatConfig[] = [
        {
            label: "Productos en catálogo",
            value: total,
            sublabel: `${active} activos`,
            icon: Package,
            tone: "violet",
        },
        {
            label: "Stock bajo",
            value: lowStock,
            sublabel: "requieren reposición",
            icon: AlertTriangle,
            tone: "rose",
        },
        {
            label: "Inactivos",
            value: inactive,
            sublabel: "pausados del catálogo",
            icon: PackageX,
            tone: "slate",
        },
        {
            label: "Valor de inventario (PVP)",
            value: formatCurrency(inventoryValue),
            sublabel: "según stock actual",
            icon: Wallet,
            tone: "amber",
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
            ))}
        </div>
    )
}