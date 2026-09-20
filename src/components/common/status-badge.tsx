/**
 * Badge de estado activo/inactivo reutilizable entre módulos.
 * Toma un booleano y muestra el label y color correspondiente;
 * los textos y colores pueden sobrescribirse por uso.
 */

import { Badge } from "@/components/ui/badge"
import { cn } from "cn"

interface StatusBadgeProps {
    active: boolean
    activeLabel?: string
    inactiveLabel?: string
    className?: string
}

const statusClasses = {
    active: "border-emerald-500/40 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400",
    inactive: "border-slate-400/60",
} as const

export function StatusBadge({
    active,
    activeLabel = "Activo",
    inactiveLabel = "Inactivo",
    className,
}: StatusBadgeProps) {
    return (
        <Badge
            variant={active ? "default" : "secondary"}
            className={cn(
                active ? statusClasses.active : statusClasses.inactive,
                "px-2.5",
                className
            )}
        >
            {active ? activeLabel : inactiveLabel}
        </Badge>
    )
}