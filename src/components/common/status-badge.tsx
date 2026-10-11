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
    active: "border-success/40 bg-success/15 text-success hover:bg-success/15",
    inactive: "border-muted-foreground/40",
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