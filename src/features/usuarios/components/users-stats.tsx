"use client"

/**
 * Cards de resumen del módulo Usuarios: total, activos, inactivos
 * y administradores.
 */

import { Users, UserCheck, UserX, ShieldCheck, type LucideIcon } from "lucide-react"
import { StatCard, type StatTone } from "@/components/common/stat-card"
import { summarizeUsers } from "../users.utils"
import type { User } from "../types"

interface UsersStatsProps {
    users: User[]
}

interface StatConfig {
    label: string
    value: string | number
    sublabel?: string
    icon: LucideIcon
    tone: StatTone
}

export function UsersStats({ users }: UsersStatsProps) {
    const { total, active, inactive, admins } = summarizeUsers(users)

    const stats: StatConfig[] = [
        {
            label: "Usuarios registrados",
            value: total,
            sublabel: `${active} activos`,
            icon: Users,
            tone: "violet",
        },
        {
            label: "Activos",
            value: active,
            sublabel: "con acceso al sistema",
            icon: UserCheck,
            tone: "amber",
        },
        {
            label: "Inactivos",
            value: inactive,
            sublabel: "sin acceso al sistema",
            icon: UserX,
            tone: "slate",
        },
        {
            label: "Administradores",
            value: admins,
            sublabel: "con permisos totales",
            icon: ShieldCheck,
            tone: "rose",
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